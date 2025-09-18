export interface TransactionModel {
  id: string;
  email: string;
  walletAddress: string;
  destinationAddress?: string;
  amount: number;
  transactionType: 'deposit' | 'transfer';
  direction: 'debit' | 'credit';
  currency: 'USD' | 'EUR' | 'GBP' | 'NGN' | 'JPY' | 'CAD' | 'GHS' | 'BTC';
  createdAt: string;
}

