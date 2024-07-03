import { ExecutionContext, InternalServerErrorException, createParamDecorator } from "@nestjs/common";


export const RawHeaders = createParamDecorator(
  ( data, ctx: ExecutionContext ) => {
    const req = ctx.switchToHttp().getRequest();
    const raw = req.rawHeaders;
    if ( !raw ){
      throw new InternalServerErrorException('Data not found');
    }
    return raw;
  }
)