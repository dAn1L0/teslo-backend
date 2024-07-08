import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";


export class LoginUserDto {

  @ApiProperty({
    description: 'Email del usuario',
    uniqueItems: true
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
  })
  @IsString()
  password: string;

}