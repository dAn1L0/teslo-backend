import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from "typeorm";
import { ProductImage } from "./";
import { User } from "../../auth/entities/auth.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({ name: 'products' })
export class Product {

  @ApiProperty({
    example: '4e4e648a-2e32-4654-98ed-944ad10a6384',
    description: 'Product unique identifier',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: "Danilo's Product",
    description: 'Product title',
    uniqueItems: true
  })
  @Column('text',{
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: 0.00,
    description: 'Product price',
  })
  @Column('float',{
    default: 0
  })
  price?: number;

  @ApiProperty({
    example: "Danilo's Product description",
    description: 'Product description',
    default: null
  })
  @Column({
    type: 'text',
    nullable: true
  })
  description?: string;

  @ApiProperty({
    example: 'danilos_product',
    description: 'Product slug',
    uniqueItems: true
  })
  @Column('text', {
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 10,
    description: 'Product stock',
    default: 0
  })
  @Column({
    type: 'int',
    default: 0,
  })
  stock?: number;

  @ApiProperty({
    example: ['XS', 'S', 'M', 'L','XL', 'XXL', '3XL'],
    description: 'Product sizes',
  })
  @Column('text',{
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example: 'women',
    description: 'Product gender',
  })
  @Column('text')
  gender: string;

  @ApiProperty({
    example: 'shirt',
    description: 'Product tags',
    default: []
  })
  @Column('text',{
    array: true,
    default: [],
  })
  tags: string[];

  @ApiProperty({
    example: ['https://images.com/danilo.jpg', 'https://images.com/danilo2.jpg'],
    description: 'Product images',
  })
  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    { cascade: true, eager: true }
  )
  images?: ProductImage[]

  @ManyToOne(
    () => User,
    (user) => user.product,
    { eager: true }
  )
  user: User

  @BeforeInsert()
  createSlug(){
    if ( !this.slug ) {
      this.slug = this.title
        .toString().toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", '')
        .replaceAll('-', '_');
    } else {
      this.slug = this.slug
        .toString().toLowerCase()
        .replaceAll(/\s+/g, '_')
        .replaceAll(/[^\w-]+/g, '')
        .replaceAll(/-+/g, '_')
        .replaceAll(/--+/g, '_')
        .replaceAll(/^-+|-+$/g, '');
    }
  }

  @BeforeUpdate()
  updateSlug(){
    this.slug = this.slug
      .toString().toLowerCase()
      .replaceAll(/\s+/g, '_')
      .replaceAll(/[^\w-]+/g, '')
      .replaceAll(/-+/g, '_')
      .replaceAll(/^-+|-+$/g, '');
  }
}
