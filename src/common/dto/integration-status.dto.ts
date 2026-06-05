export interface IntegrationStatusDto {
  available: boolean;
  mode: 'live' | 'fallback' | 'pending';
  baseUrl?: string;
  checkedAt: string;
  error?: string;
}
