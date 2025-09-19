export interface WalletModel {
  id: string;
  walletAddress: string;
  userId: string;
  balance: {
    USD: number;
    EUR: number;
    GBP: number;
    NGN: number;
    JPY: number;
    CAD: number;
    GHS: number;
    BTC: number;
  };
}

export interface WalletStateModel {
  wallet: WalletModel | null;
  isCreatingWallet: boolean;
  createWalletError: string | null;
  isFetching: boolean;
  fetchWalletError: string | null;
  isDepositing: boolean;
  depositError: string | null;
  isTransferring: boolean;
  transferError: string | null;
  isSwapping: boolean;
  swapError: string | null;
}