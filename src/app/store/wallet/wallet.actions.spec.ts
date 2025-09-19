import * as WalletActions from './wallet.actions';
import { WalletModel } from '../../core/models/wallet.model';

describe('Wallet Actions', () => {
  const mockWallet: WalletModel = {
    id: '1',
    walletAddress: 'test-address',
    userId: 'user-1',
    balance: {
      USD: 1000,
      EUR: 800,
      GBP: 600,
      JPY: 50000,
      NGN: 100000,
      CAD: 1200,
      GHS: 5000,
      BTC: 0.5
    }
  };

  describe('Create Wallet Actions', () => {
    it('should create createWallet action', () => {
      const email = 'test@example.com';
      const action = WalletActions.createWallet({ email });

      expect(action.type).toBe(WalletActions.CREATE_WALLET);
      expect(action.email).toBe(email);
    });

    it('should create createWalletSuccess action', () => {
      const action = WalletActions.createWalletSuccess();

      expect(action.type).toBe(WalletActions.CREATE_WALLET_SUCCESS);
    });

    it('should create createWalletFailure action', () => {
      const error = 'Failed to create wallet';
      const action = WalletActions.createWalletFailure({ error });

      expect(action.type).toBe(WalletActions.CREATE_WALLET_FAILURE);
      expect(action.error).toBe(error);
    });
  });

  describe('Get Wallet Actions', () => {
    it('should create getWallet action', () => {
      const email = 'test@example.com';
      const action = WalletActions.getWallet({ email });

      expect(action.type).toBe(WalletActions.GET_WALLET);
      expect(action.email).toBe(email);
    });

    it('should create getWalletSuccess action', () => {
      const action = WalletActions.getWalletSuccess({ wallet: mockWallet });

      expect(action.type).toBe(WalletActions.GET_WALLET_SUCCESS);
      expect(action.wallet).toEqual(mockWallet);
    });

    it('should create getWalletFailure action', () => {
      const error = 'Failed to get wallet';
      const action = WalletActions.getWalletFailure({ error });

      expect(action.type).toBe(WalletActions.GET_WALLET_FAILURE);
      expect(action.error).toBe(error);
    });
  });

  describe('Deposit Actions', () => {
    it('should create deposit action', () => {
      const email = 'test@example.com';
      const amount = 100;
      const currency = 'USD';
      const action = WalletActions.deposit({ email, amount, currency });

      expect(action.type).toBe(WalletActions.DEPOSIT);
      expect(action.email).toBe(email);
      expect(action.amount).toBe(amount);
      expect(action.currency).toBe(currency);
    });

    it('should create depositSuccess action', () => {
      const message = 'Deposit successful';
      const action = WalletActions.depositSuccess({ wallet: mockWallet, message });

      expect(action.type).toBe(WalletActions.DEPOSIT_SUCCESS);
      expect(action.wallet).toEqual(mockWallet);
      expect(action.message).toBe(message);
    });

    it('should create depositFailure action', () => {
      const error = 'Failed to deposit';
      const action = WalletActions.depositFailure({ error });

      expect(action.type).toBe(WalletActions.DEPOSIT_FAILURE);
      expect(action.error).toBe(error);
    });

    it('should create clearDepositError action', () => {
      const action = WalletActions.clearDepositError();

      expect(action.type).toBe(WalletActions.CLEAR_DEPOSIT_ERROR);
    });
  });

  describe('Transfer Actions', () => {
    it('should create transfer action', () => {
      const transferData = {
        fromEmail: 'sender@example.com',
        toWalletAddress: 'recipient-address',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      };
      const action = WalletActions.transfer(transferData);

      expect(action.type).toBe(WalletActions.TRANSFER);
      expect(action.fromEmail).toBe(transferData.fromEmail);
      expect(action.toWalletAddress).toBe(transferData.toWalletAddress);
      expect(action.amount).toBe(transferData.amount);
      expect(action.fromCurrency).toBe(transferData.fromCurrency);
      expect(action.toCurrency).toBe(transferData.toCurrency);
      expect(action.convertedAmount).toBe(transferData.convertedAmount);
      expect(action.exchangeRate).toBe(transferData.exchangeRate);
    });

    it('should create transferSuccess action', () => {
      const message = 'Transfer successful';
      const action = WalletActions.transferSuccess({ senderWallet: mockWallet, message });

      expect(action.type).toBe(WalletActions.TRANSFER_SUCCESS);
      expect(action.senderWallet).toEqual(mockWallet);
      expect(action.message).toBe(message);
    });

    it('should create transferFailure action', () => {
      const error = 'Failed to transfer';
      const action = WalletActions.transferFailure({ error });

      expect(action.type).toBe(WalletActions.TRANSFER_FAILURE);
      expect(action.error).toBe(error);
    });

    it('should create clearTransferError action', () => {
      const action = WalletActions.clearTransferError();

      expect(action.type).toBe(WalletActions.CLEAR_TRANSFER_ERROR);
    });
  });

  describe('Swap Actions', () => {
    it('should create swap action', () => {
      const swapData = {
        fromEmail: 'user@example.com',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      };
      const action = WalletActions.swap(swapData);

      expect(action.type).toBe(WalletActions.SWAP);
      expect(action.fromEmail).toBe(swapData.fromEmail);
      expect(action.amount).toBe(swapData.amount);
      expect(action.fromCurrency).toBe(swapData.fromCurrency);
      expect(action.toCurrency).toBe(swapData.toCurrency);
      expect(action.convertedAmount).toBe(swapData.convertedAmount);
      expect(action.exchangeRate).toBe(swapData.exchangeRate);
    });

    it('should create swapSuccess action', () => {
      const message = 'Swap successful';
      const action = WalletActions.swapSuccess({ wallet: mockWallet, message });

      expect(action.type).toBe(WalletActions.SWAP_SUCCESS);
      expect(action.wallet).toEqual(mockWallet);
      expect(action.message).toBe(message);
    });

    it('should create swapFailure action', () => {
      const error = 'Failed to swap';
      const action = WalletActions.swapFailure({ error });

      expect(action.type).toBe(WalletActions.SWAP_FAILURE);
      expect(action.error).toBe(error);
    });

    it('should create clearSwapError action', () => {
      const action = WalletActions.clearSwapError();

      expect(action.type).toBe(WalletActions.CLEAR_SWAP_ERROR);
    });
  });

  describe('Action Constants', () => {
    it('should have correct action type constants', () => {
      expect(WalletActions.CREATE_WALLET).toBe('[Wallet] Create Wallet');
      expect(WalletActions.CREATE_WALLET_SUCCESS).toBe('[Wallet] Create Wallet Success');
      expect(WalletActions.CREATE_WALLET_FAILURE).toBe('[Wallet] Create Wallet Failure');

      expect(WalletActions.GET_WALLET).toBe('[Wallet] Get Wallet');
      expect(WalletActions.GET_WALLET_SUCCESS).toBe('[Wallet] Get Wallet Success');
      expect(WalletActions.GET_WALLET_FAILURE).toBe('[Wallet] Get Wallet Failure');

      expect(WalletActions.DEPOSIT).toBe('[Wallet] Deposit');
      expect(WalletActions.DEPOSIT_SUCCESS).toBe('[Wallet] Deposit Success');
      expect(WalletActions.DEPOSIT_FAILURE).toBe('[Wallet] Deposit Failure');
      expect(WalletActions.CLEAR_DEPOSIT_ERROR).toBe('[Wallet] Clear Deposit Error');

      expect(WalletActions.TRANSFER).toBe('[Wallet] Transfer');
      expect(WalletActions.TRANSFER_SUCCESS).toBe('[Wallet] Transfer Success');
      expect(WalletActions.TRANSFER_FAILURE).toBe('[Wallet] Transfer Failure');
      expect(WalletActions.CLEAR_TRANSFER_ERROR).toBe('[Wallet] Clear Transfer Error');

      expect(WalletActions.SWAP).toBe('[Wallet] Swap');
      expect(WalletActions.SWAP_SUCCESS).toBe('[Wallet] Swap Success');
      expect(WalletActions.SWAP_FAILURE).toBe('[Wallet] Swap Failure');
      expect(WalletActions.CLEAR_SWAP_ERROR).toBe('[Wallet] Clear Swap Error');
    });
  });
});