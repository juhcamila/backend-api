import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ArrayMinSize,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsNumber({}, { each: true })
  prices: number[];

  @IsNumber()
  @IsNotEmpty()
  stock: number;
}
