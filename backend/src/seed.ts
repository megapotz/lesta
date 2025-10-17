import bcrypt from 'bcryptjs';

import { CampaignStatus, ContactChannel, CounterpartyRelationship, CounterpartyType, PaymentTerms, PlacementStatus, PlacementType, PricingModel, ProductCode, UserRole, UserStatus } from '@prisma/client';

import { env } from './config/env';
import { prisma } from './lib/prisma';
import { createPlacement, updatePlacement } from './services/placementService';

const hashPassword = (password: string) => bcrypt.hash(password, 10);

const run = async () => {
  console.info('Seeding database using', env.DATABASE_URL);

  await prisma.comment.deleteMany();
  await prisma.pricePreset.deleteMany();
  await prisma.placement.deleteMany();
  await prisma.bloggerCounterparty.deleteMany();
  await prisma.blogger.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.counterparty.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await hashPassword('admin123');
  const managerPassword = await hashPassword('manager123');

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@lestahub.local',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash: adminPassword,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Marketing Manager',
      email: 'manager@lestahub.local',
      role: UserRole.MANAGER,
      status: UserStatus.ACTIVE,
      passwordHash: managerPassword,
    },
  });

  const campaign = await prisma.campaign.create({
    data: {
      name: 'World of Ships Launch',
      product: ProductCode.SHIPS,
      goal: 'Drive awareness and pre-registrations',
      type: 'Launch',
      status: CampaignStatus.ACTIVE,
      budgetPlanned: 500000,
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      ownerId: manager.id,
      createdById: admin.id,
    },
  });

  const counterparty = await prisma.counterparty.create({
    data: {
      name: 'Influence Media LLC',
      type: CounterpartyType.LEGAL_ENTITY,
      relationshipType: CounterpartyRelationship.AGENCY,
      contactName: 'Irina Petrova',
      email: 'contracts@influencemedia.io',
      phone: '+7 921 555-01-23',
      inn: '7812345678',
      kpp: '781201001',
      ogrn: '1207800000000',
      legalAddress: 'Saint Petersburg, Nevsky prospect 12',
      checkingAccount: '40702810900001234567',
      bankName: 'AO Bank',
      bik: '044030653',
      correspondentAccount: '30101810900000000653',
      paymentDetails: 'ООО Influence Media, БИК 044030653, счет 40702810900001234567',
      createdById: admin.id,
    },
  });

  const blogger = await prisma.blogger.create({
    data: {
      name: 'CaptainVlad',
      profileUrl: 'https://t.me/captainvlad',
      socialPlatform: 'Telegram',
      followers: 125000,
      averageReach: 80000,
      primaryChannel: ContactChannel.TELEGRAM,
      primaryContact: '@captainvlad',
      createdById: manager.id,
      counterparties: {
        create: [{ counterparty: { connect: { id: counterparty.id } } }],
      },
    },
  });

  await prisma.pricePreset.create({
    data: {
      bloggerId: blogger.id,
      title: 'Telegram post 24h',
      description: 'Promo post pinned for 24 hours',
      cost: 65000,
    },
  });

  const firstPlacement = await createPlacement(
    {
      campaignId: campaign.id,
      bloggerId: blogger.id,
      counterpartyId: counterparty.id,
      placementType: PlacementType.POST,
      pricingModel: PricingModel.FIX,
      paymentTerms: PaymentTerms.PREPAYMENT,
      placementDate: new Date().toISOString(),
      fee: 65000,
      status: PlacementStatus.AWAITING_PAYMENT,
      trackingLink: 'https://lestahub.example/track/abc123',
    },
    manager,
  );

  const secondPlacement = await createPlacement(
    {
      campaignId: campaign.id,
      bloggerId: blogger.id,
      counterpartyId: counterparty.id,
      placementType: PlacementType.VIDEO,
      pricingModel: PricingModel.FIX,
      paymentTerms: PaymentTerms.POSTPAYMENT,
      placementDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      fee: 120000,
      status: PlacementStatus.AGREED,
    },
    manager,
  );

  await updatePlacement(
    secondPlacement.id,
    {
      status: PlacementStatus.PUBLISHED,
      placementUrl: 'https://youtube.com/watch?v=promo123',
      views: 320000,
      likes: 18500,
      commentsCount: 2600,
      roi: 145,
      engagementRate: 12.5,
    },
    manager,
  );

  await prisma.comment.create({
    data: {
      body: 'Блогер подтвердил готовность дать скидку при пакетном размещении.',
      bloggerId: blogger.id,
      authorId: manager.id,
    },
  });

  await prisma.comment.create({
    data: {
      body: 'Контрагент отправил закрывающие документы за прошлый месяц.',
      counterpartyId: counterparty.id,
      authorId: admin.id,
    },
  });

  console.info('Seed completed successfully.');
};

run()
  .then(() => {
    return prisma.$disconnect();
  })
  .catch((error) => {
    console.error('Seed failed', error);
    return prisma.$disconnect().finally(() => {
      process.exit(1);
    });
  });
