import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Lear(n)alie database seeding...');

  // 1. Seed Roles
  const rolesData = [
    { name: 'ADMIN', description: 'Mengelola seluruh pengguna, role, kategori, dan video' },
    { name: 'EDUCATION', description: 'Mengakses video Published yang mengizinkan role EDUCATION' },
    { name: 'GAMING', description: 'Mengakses video Published yang mengizinkan role GAMING' },
  ];

  const roleMap = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
    roleMap[role.name] = role;
    console.log(`✓ Role ready: ${role.name}`);
  }

  // 2. Seed Default Admin User
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@learnalie.com';
  const adminName = process.env.INITIAL_ADMIN_NAME || 'Learnalie Admin';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'AdminLearnalie123!';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const adminUser = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        status: 'ACTIVE',
        roleId: roleMap['ADMIN'].id,
      },
    });
    console.log(`✓ Initial admin created: ${adminUser.email} (Status: ACTIVE, Role: ADMIN)`);
  } else {
    console.log(`ℹ Admin user already exists: ${existingAdmin.email}`);
  }

  // 3. Seed Initial Categories and Subcategories
  const categoriesData = [
    {
      name: 'Edukasi',
      slug: 'edukasi',
      subcategories: [
        { name: 'Programming', slug: 'programming' },
        { name: 'Data Analyst', slug: 'data-analyst' },
        { name: 'Cyber Security', slug: 'cyber-security' },
        { name: 'Akuntansi', slug: 'akuntansi' },
        { name: 'Sains', slug: 'sains' },
        { name: 'Bahasa', slug: 'bahasa' },
      ],
    },
    {
      name: 'Gaming',
      slug: 'gaming',
      subcategories: [
        { name: 'Tutorial Game', slug: 'tutorial-game' },
        { name: 'Tips & Tricks', slug: 'tips-tricks' },
        { name: 'Gameplay', slug: 'gameplay' },
        { name: 'Setting & Optimization', slug: 'setting-optimization' },
      ],
    },
  ];

  for (const cat of categoriesData) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
    console.log(`✓ Category ready: ${parent.name}`);

    for (const sub of cat.subcategories) {
      await prisma.category.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, parentId: parent.id },
        create: { name: sub.name, slug: sub.slug, parentId: parent.id },
      });
      console.log(`  └─ Subcategory ready: ${sub.name}`);
    }
  }

  console.log('✅ Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
