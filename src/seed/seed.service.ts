import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/auth.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {

  constructor(

    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>

  ){}

  async runSeed() {
    await this.truncateTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser);
    return `Seed executed`;
  }

  private async truncateTables() {
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];
    seedUsers.forEach( user => {
      user.password = bcrypt.hashSync(user.password, 10);
      users.push( this.userRepository.create(user) )
    })
    await this.userRepository.save( users );
    return users[0];
  }

  private async insertNewProducts( user: User ){

    await this.productsService.deleteAllProducts();
    const products = initialData.products
    const insertPromises = [];

    products.forEach( product => {
      insertPromises.push(
        this.productsService.create(product, user)
      )
    })

    await Promise.all( insertPromises );

    return
  }

}
