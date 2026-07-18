export interface AilaMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface AilaWorkspace {
  id: string;
  name: string;
  productType: 'intelligence' | 'legal' | 'business' | 'automation' | 'sites' | 'apps';
}
