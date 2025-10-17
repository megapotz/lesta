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

  const additionalBloggers = [
    {
      name: 'SteelBear',
      profileUrl: 'https://youtube.com/steelbear',
      socialPlatform: 'YouTube',
      followers: 420000,
      averageReach: 260000,
      primaryChannel: ContactChannel.EMAIL,
      primaryContact: 'steelbear@mediahub.ru',
      placement: {
        type: PlacementType.VIDEO,
        fee: 90000,
        views: 410000,
        engagementRate: 7.2,
      },
    },
    {
      name: 'MarinaWaves',
      profileUrl: 'https://t.me/marinawaves',
      socialPlatform: 'Telegram',
      followers: 180000,
      averageReach: 120000,
      primaryChannel: ContactChannel.TELEGRAM,
      primaryContact: '@marina_waves',
      placement: {
        type: PlacementType.STREAM,
        fee: 75000,
        views: 280000,
        engagementRate: 9.1,
      },
    },
    {
      name: 'TankAce',
      profileUrl: 'https://vk.com/tankace',
      socialPlatform: 'VK',
      followers: 250000,
      averageReach: 165000,
      primaryChannel: ContactChannel.PHONE,
      primaryContact: '+7 495 555-14-14',
      placement: {
        type: PlacementType.POST,
        fee: 68000,
        views: 210000,
        engagementRate: 6.7,
      },
    },
    {
      name: 'BlitzQueen',
      profileUrl: 'https://youtube.com/blitzqueen',
      socialPlatform: 'YouTube',
      followers: 540000,
      averageReach: 330000,
      primaryChannel: ContactChannel.EMAIL,
      primaryContact: 'queen@blitzchannel.tv',
      placement: {
        type: PlacementType.SHORT_FORM,
        fee: 82000,
        views: 360000,
        engagementRate: 8.8,
      },
    },
    {
      name: 'HarborHero',
      profileUrl: 'https://t.me/harborhero',
      socialPlatform: 'Telegram',
      followers: 95000,
      averageReach: 64000,
      primaryChannel: ContactChannel.TELEGRAM,
      primaryContact: '@harborhero',
      placement: {
        type: PlacementType.POST,
        fee: 47000,
        views: 150000,
        engagementRate: 5.4,
      },
    },
    {
      name: 'ArcticFox',
      profileUrl: 'https://youtube.com/arcticfox',
      socialPlatform: 'YouTube',
      followers: 310000,
      averageReach: 205000,
      primaryChannel: ContactChannel.EMAIL,
      primaryContact: 'fox@northstudio.dev',
      placement: {
        type: PlacementType.VIDEO,
        fee: 99000,
        views: 430000,
        engagementRate: 10.3,
      },
    },
    {
      name: 'StreamerNova',
      profileUrl: 'https://twitch.tv/streamernova',
      socialPlatform: 'Twitch',
      followers: 670000,
      averageReach: 420000,
      primaryChannel: ContactChannel.EMAIL,
      primaryContact: 'nova@streamline.gg',
      placement: {
        type: PlacementType.STREAM,
        fee: 120000,
        views: 520000,
        engagementRate: 11.8,
      },
    },
    {
      name: 'CaptainIlya',
      profileUrl: 'https://youtube.com/captainilya',
      socialPlatform: 'YouTube',
      followers: 390000,
      averageReach: 240000,
      primaryChannel: ContactChannel.EMAIL,
      primaryContact: 'ilya@captainstudio.ru',
      placement: {
        type: PlacementType.VIDEO,
        fee: 88000,
        views: 340000,
        engagementRate: 7.5,
      },
    },
    {
      name: 'DroneMaster',
      profileUrl: 'https://rutube.ru/channel/dronemaster',
      socialPlatform: 'RuTube',
      followers: 145000,
      averageReach: 90000,
      primaryChannel: ContactChannel.EMAIL,
      primaryContact: 'hello@dronemaster.io',
      placement: {
        type: PlacementType.VIDEO,
        fee: 56000,
        views: 190000,
        engagementRate: 6.1,
      },
    },
  ];

  for (const seed of additionalBloggers) {
    const created = await prisma.blogger.create({
      data: {
        name: seed.name,
        profileUrl: seed.profileUrl,
        socialPlatform: seed.socialPlatform,
        followers: seed.followers,
        averageReach: seed.averageReach,
        primaryChannel: seed.primaryChannel,
        primaryContact: seed.primaryContact,
        createdById: manager.id,
        counterparties: {
          create: [{ counterparty: { connect: { id: counterparty.id } } }],
        },
      },
    });

    await createPlacement(
      {
        campaignId: campaign.id,
        bloggerId: created.id,
        counterpartyId: counterparty.id,
        placementType: seed.placement.type,
        pricingModel: PricingModel.FIX,
        paymentTerms: PaymentTerms.POSTPAYMENT,
        placementDate: new Date().toISOString(),
        fee: seed.placement.fee,
        status: PlacementStatus.PUBLISHED,
        views: seed.placement.views,
        engagementRate: seed.placement.engagementRate,
      },
      manager,
    );
  }

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
