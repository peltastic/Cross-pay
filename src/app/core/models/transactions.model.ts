export interface TransactionModel {
  id: string;
  email: string;
  walletAddress: string;
  destinationAddress?: string;
  amount: number;
  transactionType: 'deposit' | 'transfer' | 'swap';
  direction: 'debit' | 'credit' | 'swap';
  currency: 'USD' | 'EUR' | 'GBP' | 'NGN' | 'JPY' | 'CAD' | 'GHS' | 'BTC';
  createdAt: string;
}

