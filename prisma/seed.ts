import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@evolutionfuture.com' },
    update: {},
    create: {
      email: 'admin@evolutionfuture.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      onboarded: true,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 10);
  
  const demo = await prisma.user.upsert({
    where: { email: 'demo@evolutionfuture.com' },
    update: {},
    create: {
      email: 'demo@evolutionfuture.com',
      name: 'Demo User',
      password: demoPassword,
      role: 'USER',
      emailVerified: new Date(),
      onboarded: false,
    },
  });

  console.log('✅ Demo user created:', demo.email);

  // Create sample notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: demo.id,
        title: 'Welcome to Evolution Future',
        message: 'Complete your profile to get started',
        type: 'info',
      },
      {
        userId: demo.id,
        title: 'New Feature Available',
        message: 'Check out our latest dashboard updates',
        type: 'success',
      },
    ],
  });

  console.log('✅ Sample notifications created');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
