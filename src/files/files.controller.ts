import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Files Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
  ){
    const path = this.filesService.getStaticProductImage(imageName)

    // res.status(403).json({
    //   ok: false,
    //   path
    // })
    res.sendFile(path)
  }


  @Post('product')
  @UseInterceptors( FileInterceptor('file',{
    fileFilter: fileFilter,
    // limits: { fileSize: 1000000 }
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadProductImage(@UploadedFile() file: Express.Multer.File ) {

    if(!file) throw new BadRequestException('Image not valid');

    const secureUrl = `${ this.configService.get('HOST_API') }/files/products/${file.filename}`;

    return { secureUrl };

  }

}
