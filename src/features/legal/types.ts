export interface LegalDocument {
  id: string;
  title: string;
  riskScore: number;
  status: 'pending' | 'analyzed' | 'flagged';
  summary: string;
  clauseIntelligence: Clause[];
  createdAt: Date;
}

export interface Clause {
  id: string;
  title: string;
  content: string;
  analysis: string;
  isHighRisk: boolean;
}
