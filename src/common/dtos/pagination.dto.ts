import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";


export class PaginationDto {

  @ApiProperty({
    description: 'Limit of products in the response',
    default: 10
  })
  @IsOptional()
  @IsPositive()
  @Type( () => Number )
  limit?: number;
 
  @ApiProperty({
    description: 'Offset of products in the response',
    default: 0
  })
  @IsOptional()
  @Min(0)
  @Type( () => Number )
  offset?: number;
}
