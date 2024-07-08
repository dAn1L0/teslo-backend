import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "../../products/entities";
import { ApiProperty } from "@nestjs/swagger";

@Entity('users')
export class User {

  @ApiProperty({
    example: '4e4e648a-2e32-4654-98ed-944ad10a6384',
    description: 'User unique identifier',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'danilo@google.com',
    description: 'User email',
    uniqueItems: true
  })
  @Column('text',{ unique: true })
  email: string;

  @ApiProperty({
    example: 'D123456A',
    description: 'User password',
  })
  @Column('text',{ select: false })
  password: string;

  @ApiProperty({
    example: 'Danilo Chávez',
    description: 'User full name',
  })
  @Column('text')
  fullName: string;

  @ApiProperty({
    description: 'User active status',
    default: true
  })
  @Column('bool', { default: true })
  isActive: boolean;

  @ApiProperty({
    example: ['user', 'admin', 'super-user'],
    description: 'User roles',
    default: ['user']
  })
  @Column('text', { array: true, default: ['user'] })
  roles: string[];

  @OneToMany(
    () => Product,
    (product) => product.user
  )
  product: Product

  @BeforeInsert()
  checkFieldsBeforeInsert(){
    this.email = this.email.trim().toLowerCase();
  }
  @BeforeUpdate()
  checkFieldsBeforeUpdate(){
    this.checkFieldsBeforeInsert();
  }
}
