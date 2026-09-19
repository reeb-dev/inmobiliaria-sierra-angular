export type PublishChannel = 'mercadolibre' | 'instagram' | 'argenprop';

export type PanelProperty = {
  id: string;
  slug: string;
  title: string;
  price: string;
  status: 'venta' | 'alquiler';
  type: string;
  location: string;
  bedrooms: number | null;
  bathrooms: number | null;
  surface: string | null;
  images: string[];
  description: string;
  published?: boolean;
  updatedAt: string;
};

export type Publication = {
  id: string;
  propertyId: string;
  channel: PublishChannel;
  status: 'simulated' | 'queued' | 'error' | 'published';
  message: string;
  at: string;
  externalUrl?: string;
  remoteId?: string;
};

export type PropertyStats = {
  propertyId: string;
  webViews: number;
  whatsappClicks: number;
  mlViews: number;
  igReach: number;
  contacts: number;
};

export type PanelSettings = {
  geminiApiKey: string;
  openaiApiKey: string;
  aiProvider: 'local' | 'gemini' | 'openai';
};
