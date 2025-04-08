import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateProductDto) {
    return await this.prisma.product.create({
      data,
    });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProductWhereUniqueInput;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = params;
    return await this.prisma.product.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(id: string) {
    return await this.prisma.product.findUnique({ where: { id } });
  }

  async update(id: string, data: UpdateProductDto) {
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  async purchaseProduct(productId: string, quantity: number) {
    const MAX_RETRIES = 3;
    let attempt = 0;

    while (attempt < MAX_RETRIES) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const product = await tx.product.findUnique({
            where: { id: productId },
          });

          if (!product) {
            throw new NotFoundException('Product not found');
          }

          if (product.stock < quantity) {
            throw new BadRequestException('Insufficient stock');
          }

          return tx.product.update({
            where: { id: productId },
            data: {
              stock: product.stock - quantity,
            },
          });
        }, {
          isolationLevel: 'Serializable',
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError) {
          if (attempt + 1 >= MAX_RETRIES) throw new ConflictException('Transaction failed after multiple attempts');
          const delay = Math.pow(2, attempt) * 100;
          await new Promise((res) => setTimeout(res, delay));
        } else {
          throw err;
        }
      } finally {
        attempt++;
      }
    }
  }
}
