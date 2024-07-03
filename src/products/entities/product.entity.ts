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

@Entity({ name: 'products' })
export class Product {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text',{
    unique: true,
  })
  title: string;

  @Column('float',{
    default: 0
  })
  price?: number;

  @Column({
    type: 'text',
    nullable: true
  })
  description?: string;

  @Column('text', {
    unique: true,
  })
  slug: string;

  @Column({
    type: 'int',
    default: 0,
  })
  stock?: number;

  @Column('text',{
    array: true,
  })
  sizes: string[];

  @Column('text')
  gender: string;

  @Column('text',{
    array: true,
    default: [],
  })
  tags: string[];

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
