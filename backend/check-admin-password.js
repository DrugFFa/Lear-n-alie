
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from './src/config/prisma.js';

async function main() {
    const email = process.env.INITIAL_ADMIN_EMAIL?.toLowerCase().trim();
    const password = process.env.INITIAL_ADMIN_PASSWORD;

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            email: true,
            status: true,
            role: { select: { name: true } },
            passwordHash: true,
        },
    });

    if (!user) {
        console.log('Admin tidak ditemukan.');
        return;
    }

    console.log('Email ditemukan:', user.email);
    console.log('Status:', user.status);
    console.log('Role:', user.role?.name ?? 'Tidak ada');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    console.log('Password sesuai konfigurasi:', isMatch);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

