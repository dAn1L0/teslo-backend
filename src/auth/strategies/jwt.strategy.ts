import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/auth.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from "@nestjs/common";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    configService: ConfigService
  ){
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    });
  }

  async validate( payload: JwtPayload ): Promise<User> {

    const { id } = payload;
    // const { email } = payload;

    const user = await this.userRepository.findOneBy({ id });

    if ( !user ) {
      throw new UnauthorizedException('Token not valid or User not found');
    }

    if ( !user.isActive ){
      throw new UnauthorizedException('User not active');
    }

    return user;
  }
}