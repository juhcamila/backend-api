import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = Array.from({ length: 1000 }).map((_, i) => ({
    name: `Product ${i + 1}`,
    description: `Description for Product ${i + 1}`,
    prices: [Math.random() * 100],
    stock: 10,
  }));

  await prisma.product.createMany({
    data: products,
  });

  console.log('✅ Seeded 1000 products');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
