import { walletReducer } from './wallet.reducer';
import { initialState } from './wallet.state';
import * as WalletActions from './wallet.actions';
import { WalletModel, WalletStateModel } from '../../core/models/wallet.model';

describe('WalletReducer', () => {
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

  describe('Initial State', () => {
    it('should return the initial state', () => {
      const action = { type: 'Unknown' } as any;
      const state = walletReducer(undefined, action);

      expect(state).toBe(initialState);
    });
  });

  describe('Create Wallet Actions', () => {
    it('should handle createWallet action', () => {
      const action = WalletActions.createWallet({ email: 'test@example.com' });
      const state = walletReducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        isCreatingWallet: true,
        createWalletError: null
      });
    });

    it('should handle createWalletSuccess action', () => {
      const previousState: WalletStateModel = {
        ...initialState,
        isCreatingWallet: true,
        createWalletError: 'Some error'
      };
      const action = WalletActions.createWalletSuccess();
      const state = walletReducer(previousState, action);

      expect(state).toEqual({
        ...previousState,
        isCreatingWallet: false,
        createWalletError: null
      });
    });

    it('should handle createWalletFailure action', () => {
      const previousState: WalletStateModel = {
        ...initialState,
        isCreatingWallet: true
      };
      const error = 'Failed to create wallet';
      const action = WalletActions.createWalletFailure({ error });
      const state = walletReducer(previousState, action);

      expect(state).toEqual({
        ...previousState,
        isCreatingWallet: false,
        createWalletError: error
      });
    });
  });

  describe('Get Wallet Actions', () => {
    it('should handle getWallet action', () => {
      const action = WalletActions.getWallet({ email: 'test@example.com' });
      const state = walletReducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        isFetching: true,
        fetchWalletError: null
      });
    });

    it('should handle getWalletSuccess action', () => {
      const previousState: WalletStateModel = {
        ...initialState,
        isFetching: true,
        fetchWalletError: 'Some error'
      };
      const action = WalletActions.getWalletSuccess({ wallet: mockWallet });
      const state = walletReducer(previousState, action);

      expect(state).toEqual({
        ...previousState,
        wallet: mockWallet,
        isFetching: false,
        fetchWalletError: null
      });
    });

    it('should handle getWalletFailure action', () => {
      const previousState: WalletStateModel = {
        ...initialState,
        isFetching: true
      };
      const error = 'Failed to get wallet';
      const action = WalletActions.getWalletFailure({ error });
      const state = walletReducer(previousState, action);

      expect(state).toEqual({
        ...previousState,
        isFetching: false,
        fetchWalletError: error
      });
    });
  });

  describe('Deposit Actions', () => {
    it('should handle deposit action', () => {
      const action = WalletActions.deposit({
        email: 'test@example.com',
        amount: 100,
        currency: 'USD'
      });
      const state = walletReducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        isDepositing: true,
        depositError: null
      });
    });

    it('should handle depositSuccess action', () => {
      const previousState: WalletStateModel = {
        ...initialState,
        isDepositing: true,
        depositError: 'Some error'
      };
      const action = WalletActions.depositSuccess({
        wallet: mockWallet,
        message: 'Deposit successful'
      });
      const state = walletReducer(previousState, action);

      expect(state).toEqual({
        ...previousState,
        wallet: mockWallet,
        isDepositing: false,
        depositError: null
      });
    });

    it('should handle depositFailure action', () => {
      const previousState: WalletStateModel = {
        ...initialState,
        isDepositing: true
      };
      const error = 'Failed to deposit';
      const action = WalletActions.depositFailure({ error });
      const state = walletReducer(previousState, action);

      expect(state).toEqual({
        ...previousState,
        isDepositing: false,
        depositError: error
      });
    });

    it('should handle clearDepositError action', () => {
      const previousState: WalletStateModel = {
        ...initialState,
        depositError: 'Some error'
      };
      const action = WalletActions.clearDepositError();
      const state = walletReducer(previousState, action);

      expect(state).toEqual({
        ...previousState,
        depositError: null
      });
    });
  });

  describe('Transfer Actions', () => {
    it('should handle transfer action', () => {
      const action = WalletActions.transfer({
        fromEmail: 'sender@example.com',
        toWalletAddress: 'recipient-address',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      });
      const state = walletReducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        isTransferring: true,
        transferError: null
      });
    });

    it('should handle transferSuccess action', () => {
      const previousState: WalletStateModel = {
        ...initialState,
        isTransferring: true,
        transferError: 'Some error'
      };
      const action = WalletActions.transferSuccess({
        senderWallet: mockWallet,
        message: 'Transfer successful'
      });
      const state = walletReducer(previousState, action);

      expect(state).toEqual({
        ...previousState,
        wallet: mockWallet,
        isTransferring: false,
        transferError: null
      });
    });

    it('should handle transferFailure action', () => {
      const previousState: WalletStateModel = {
        ...initialState,
        isTransferring: true
      };
      const error = 'Failed to transfer';
      const action = WalletActions.transferFailure({ error });
      const state = walletReducer(previousState, action);

      expect(state).toEqual({
        ...previousState,
        isTransferring: false,
        transferError: error
      });
    });

    it('should handle clearTransferError action', () => {
      const previousState: WalletStateModel = {
        ...initialState,
        transferError: 'Some error'
      };
      const action = WalletActions.clearTransferError();
      const state = walletReducer(previousState, action);

      expect(state).toEqual({
        ...previousState,
        transferError: null
      });
    });
  });

  describe('Swap Actions', () => {
    it('should handle swap action', () => {
      const action = WalletActions.swap({
        fromEmail: 'user@example.com',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      });
      const state = walletReducer(initialState, action);

      expect(state).toEqual({
        ...initialState,
        isSwapping: true,
        swapError: null
      });
    });

    it('should handle swapSuccess action', () => {
      const previousState: WalletStateModel = {
        ...initialState,
        isSwapping: true,
        swapError: 'Some error'
      };
      const action = WalletActions.swapSuccess({
        wallet: mockWallet,
        message: 'Swap successful'
      });
      const state = walletReducer(previousState, action);

      expect(state).toEqual({
        ...previousState,
        wallet: mockWallet,
        isSwapping: false,
        swapError: null
      });
    });

    it('should handle swapFailure action', () => {
      const previousState: WalletStateModel = {
        ...initialState,
        isSwapping: true
      };
      const error = 'Failed to swap';
      const action = WalletActions.swapFailure({ error });
      const state = walletReducer(previousState, action);

      expect(state).toEqual({
        ...previousState,
        isSwapping: false,
        swapError: error
      });
    });

    it('should handle clearSwapError action', () => {
      const previousState: WalletStateModel = {
        ...initialState,
        swapError: 'Some error'
      };
      const action = WalletActions.clearSwapError();
      const state = walletReducer(previousState, action);

      expect(state).toEqual({
        ...previousState,
        swapError: null
      });
    });
  });

  describe('State Preservation', () => {
    it('should preserve wallet data across different operations', () => {
      let state = walletReducer(initialState, WalletActions.getWalletSuccess({ wallet: mockWallet }));
      
      state = walletReducer(state, WalletActions.deposit({
        email: 'test@example.com',
        amount: 100,
        currency: 'USD'
      }));

      expect(state.wallet).toEqual(mockWallet);
      expect(state.isDepositing).toBe(true);
    });

    it('should handle multiple error clearances', () => {
      let state: WalletStateModel = {
        ...initialState,
        depositError: 'Deposit error',
        transferError: 'Transfer error',
        swapError: 'Swap error'
      };

      state = walletReducer(state, WalletActions.clearDepositError());
      expect(state.depositError).toBeNull();
      expect(state.transferError).toBe('Transfer error');
      expect(state.swapError).toBe('Swap error');

      state = walletReducer(state, WalletActions.clearTransferError());
      expect(state.transferError).toBeNull();
      expect(state.swapError).toBe('Swap error');

      state = walletReducer(state, WalletActions.clearSwapError());
      expect(state.swapError).toBeNull();
    });

    it('should reset errors when starting new operations', () => {
      const stateWithErrors: WalletStateModel = {
        ...initialState,
        depositError: 'Previous deposit error',
        transferError: 'Previous transfer error',
        swapError: 'Previous swap error'
      };

      let state = walletReducer(stateWithErrors, WalletActions.deposit({
        email: 'test@example.com',
        amount: 100,
        currency: 'USD'
      }));
      expect(state.depositError).toBeNull();

      state = walletReducer(stateWithErrors, WalletActions.transfer({
        fromEmail: 'sender@example.com',
        toWalletAddress: 'recipient-address',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      }));
      expect(state.transferError).toBeNull();

      state = walletReducer(stateWithErrors, WalletActions.swap({
        fromEmail: 'user@example.com',
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        convertedAmount: 85,
        exchangeRate: 0.85
      }));
      expect(state.swapError).toBeNull();
    });
  });
});