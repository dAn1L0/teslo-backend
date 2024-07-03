import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ){}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
        // token: this.getJwtToken({ email: user.email })
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { password, email } = loginUserDto;
      const user = await this.userRepository.findOne({
        where: { email },
        select: { email: true, password: true, id: true },
      });
      if (!user){
        throw new UnauthorizedException('Credentials are not valid');
      }

      if (!bcrypt.compareSync(password, user.password)) {
        throw new UnauthorizedException('Credentials are not valid');
      }
      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
        // token: this.getJwtToken({ email: user.email })
      };

    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async checkAuthStatus( user: User ) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  private getJwtToken( payload: JwtPayload ){
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors (error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    if( error.status === 401 ){
      throw new UnauthorizedException(error.response.message);
    }
    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }

}
