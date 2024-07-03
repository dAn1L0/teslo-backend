import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product, ProductImage } from './entities';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { isUUID } from 'class-validator';
import { User } from '../auth/entities/auth.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ){}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map( img =>
          this.productImageRepository.create({url: img})
        ),
        user: user
      });
      await this.productRepository.save(product);
      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        }
      });
      return products.map( product => ({
        ...product,
        images: product.images.map( img => img.url )
      }))
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async findOne(term: string) {
    try {
      let product: Product;
      if ( isUUID(term, 4) ){
        product = await this.productRepository.findOneBy({id: term});
      } else {
        const queryBuilder = this.productRepository.createQueryBuilder('prod');
        product = await queryBuilder
          .where(
            'UPPER(title) =:title or slug =:slug',
            {
              title: term.toUpperCase(),
              slug: term.toLowerCase()
            }
          )
          .leftJoinAndSelect('prod.images', 'prodImages')
          .getOne();
      }
      if(!product)
        throw new NotFoundException(`Product with term ${term} not found`);
      return {
        ...product,
        images: product.images.map( img => img.url )
      };
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const { images, ...dataToUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id,
      ...dataToUpdate,
    });
    if(!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if(images) {
        await queryRunner.manager.delete( ProductImage, { product: { id } } );
        product.images = images.map(
          img => this.productImageRepository.create({url: img})
        );
      }
      product.user = user;
      await queryRunner.manager.save(product);
      // await this.productRepository.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // return product;
      return this.findOne(id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error)
    }

  }

  async remove(id: string) {
    try {
      const product = await this.productRepository.delete(id);
      if(product.affected === 0) throw new NotFoundException(`Product with id ${id} not found`);
      return { ok: true };
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error);
    if(error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    if(error.response.statusCode === 404) {
      throw new NotFoundException(error.response.message);
    }
    console.log(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('products');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }
}
