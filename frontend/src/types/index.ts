export type UserRole = 'ADMIN' | 'MANAGER';
export type UserStatus = 'INVITED' | 'ACTIVE' | 'DEACTIVATED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED';
export type ProductCode = 'TANKS' | 'SHIPS' | 'BLITZ';

export interface CampaignSummary {
  id: number;
  name: string;
  product: ProductCode;
  status: CampaignStatus;
  goal?: string | null;
  type?: string | null;
  budgetPlanned?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  owner: User;
  _count?: {
    placements: number;
  };
  spend?: string | null;
}

export interface CampaignDetail extends CampaignSummary {
  placements: Placement[];
}

export type CounterpartyType = 'SELF_EMPLOYED' | 'SOLE_PROPRIETOR' | 'LEGAL_ENTITY';
export type CounterpartyRelationship = 'DIRECT' | 'AGENCY' | 'CPA_NETWORK';

export interface Counterparty {
  id: number;
  name: string;
  type: CounterpartyType;
  relationshipType: CounterpartyRelationship;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  inn?: string | null;
  kpp?: string | null;
  ogrn?: string | null;
  ogrnip?: string | null;
  legalAddress?: string | null;
  registrationAddress?: string | null;
  checkingAccount?: string | null;
  bankName?: string | null;
  bik?: string | null;
  correspondentAccount?: string | null;
  taxPhone?: string | null;
  paymentDetails?: string | null;
  isActive: boolean;
}

export type ContactChannel = 'EMAIL' | 'TELEGRAM' | 'WHATSAPP' | 'PHONE';

export interface Blogger {
  id: number;
  name: string;
  profileUrl: string;
  socialPlatform?: string | null;
  followers?: number | null;
  averageReach?: number | null;
  primaryChannel?: ContactChannel | null;
  primaryContact?: string | null;
  counterparties?: Array<{
    counterparty: Counterparty;
  }>;
}

export type PlacementStatus =
  | 'PLANNED'
  | 'AGREED'
  | 'DECLINED'
  | 'AWAITING_PAYMENT'
  | 'AWAITING_PUBLICATION'
  | 'PUBLISHED'
  | 'OVERDUE'
  | 'CLOSED';

export type PlacementType =
  | 'POST'
  | 'VIDEO'
  | 'SHORT_FORM'
  | 'STREAM'
  | 'STORIES'
  | 'INTEGRATION'
  | 'ANNOUNCEMENT';

export type PricingModel = 'FIX' | 'CPA' | 'REVSHARE' | 'BARTER';
export type PaymentTerms = 'PREPAYMENT' | 'POSTPAYMENT' | 'PARTIAL';

export interface Placement {
  id: number;
  campaignId: number;
  bloggerId: number;
  counterpartyId: number;
  status: PlacementStatus;
  placementType: PlacementType;
  pricingModel: PricingModel;
  paymentTerms: PaymentTerms;
  placementDate?: string | null;
  fee?: string | null;
  placementUrl?: string | null;
  screenshotUrl?: string | null;
  trackingLink?: string | null;
  views?: number | null;
  likes?: number | null;
  commentsCount?: number | null;
  shares?: number | null;
  roi?: string | null;
  engagementRate?: string | null;
  campaign?: CampaignSummary;
  blogger?: Blogger;
  counterparty?: Counterparty;
}

export interface PricePreset {
  id: number;
  bloggerId: number;
  title: string;
  description?: string | null;
  cost: string;
}

export interface Comment {
  id: number;
  body: string;
  isSystem: boolean;
  author: User;
  blogger?: Blogger | null;
  counterparty?: Counterparty | null;
  placementId?: number | null;
  createdAt: string;
}

export interface DashboardSummary {
  summary: {
    totalCampaigns: number;
    activeCampaigns: number;
    plannedBudget: number;
    totalSpend: number;
  };
  topBloggers: Array<{
    bloggerId: number;
    name: string;
    placements: number;
    spend: number;
    views: number;
    averageCpv: number | null;
  }>;
  spendByCounterpartyType: Array<{
    type: CounterpartyType;
    spend: number;
  }>;
}
