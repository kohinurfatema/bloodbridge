import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = async (pw: string) => bcrypt.hash(pw, 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@bloodbridge.com' },
    update: {},
    create: {
      name: 'BloodBridge Admin',
      email: 'admin@bloodbridge.com',
      password: await hash('Admin@1234'),
      role: 'ADMIN',
      phone: '+8801700000001',
      isActive: true,
    },
  });

  const donor = await prisma.user.upsert({
    where: { email: 'donor@bloodbridge.com' },
    update: {},
    create: {
      name: 'Rafiq Ahmed',
      email: 'donor@bloodbridge.com',
      password: await hash('Donor@1234'),
      role: 'DONOR',
      phone: '+8801700000002',
      isActive: true,
    },
  });

  await prisma.donorProfile.upsert({
    where: { userId: donor.id },
    update: {},
    create: {
      userId: donor.id,
      bloodType: 'O_POS',
      location: 'Dhaka',
      isAvailable: true,
      totalDonations: 3,
      lastDonationDate: new Date('2025-06-01'),
    },
  });

  const requester = await prisma.user.upsert({
    where: { email: 'requester@bloodbridge.com' },
    update: {},
    create: {
      name: 'Nadia Islam',
      email: 'requester@bloodbridge.com',
      password: await hash('Requester@1234'),
      role: 'REQUESTER',
      phone: '+8801700000003',
      isActive: true,
    },
  });

  await prisma.bloodRequest.upsert({
    where: { id: 'seed-request-001' },
    update: {},
    create: {
      id: 'seed-request-001',
      requesterId: requester.id,
      bloodType: 'O_POS',
      urgency: 'URGENT',
      hospital: 'Dhaka Medical College Hospital',
      location: 'Dhaka',
      notes: 'Needed urgently for surgery tomorrow morning.',
      requiredDate: new Date('2026-09-10'),
      units: 2,
    },
  });

  console.log('Seed complete.');
  console.log('Admin:', admin.email, '| Password: Admin@1234');
  console.log('Donor:', donor.email, '| Password: Donor@1234');
  console.log('Requester:', requester.email, '| Password: Requester@1234');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
