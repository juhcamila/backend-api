import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';
import { PurchaseProductDto } from './dto/purchase-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return await this.productsService.create(createProductDto);
  }

  @Get()
  async findAll( 
    @Query('take') take?: number,
    @Query('skip') skip?: number,
    @Query('cursor') cursor?: Prisma.ProductWhereUniqueInput,
    @Query('where') where?: Prisma.ProductWhereInput,
    @Query('orderBy') orderBy?: Prisma.ProductOrderByWithRelationInput
) {
    return await this.productsService.findAll({
      take,
      skip,
      cursor,
      where,
      orderBy
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return await this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }

  @Post('purchase')
  @HttpCode(HttpStatus.OK)
  async purchase(@Body() data: PurchaseProductDto) {
    const updatedProduct = await this.productsService.purchaseProduct(data.id, data.quantity);
    return {
      message: 'Compra realizada com sucesso',
      data: updatedProduct,
    };
  }
}
