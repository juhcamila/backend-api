import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let productId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);

    const created = await prisma.product.create({
      data: {
        name: 'Produto concorrente',
        description: 'Teste de concorrência',
        prices: [9.99],
        stock: 1,
      },
    });

    productId = created.id;
  });

  afterAll(async () => {
    await prisma.product.delete({ where: { id: productId } });
    await app.close();
  });

  it('should simulate two concurrent purchases', async () => {
    const body = {
      id: productId,
      quantity: 1,
    };

    const [res1, res2] = await Promise.all([
      request(app.getHttpServer()).post('/products/purchase').send(body),
      request(app.getHttpServer()).post('/products/purchase').send(body),
    ]);

    const statusCodes = [res1.status, res2.status];

    expect(statusCodes).toContain(200);
    expect(statusCodes).toContain(400);
  });
});