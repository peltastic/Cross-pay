import * as WalletSelectors from './wallet.selector';
import { WalletStateModel, WalletModel } from '../../core/models/wallet.model';

describe('Wallet Selectors', () => {
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

  const mockWalletState: WalletStateModel = {
    wallet: mockWallet,
    isCreatingWallet: true,
    createWalletError: 'Create wallet error',
    isFetching: true,
    fetchWalletError: 'Fetch wallet error',
    isDepositing: true,
    depositError: 'Deposit error',
    isTransferring: true,
    transferError: 'Transfer error',
    isSwapping: true,
    swapError: 'Swap error'
  };

  const mockAppState = {
    wallet: mockWalletState
  };

  describe('selectWalletState', () => {
    it('should select the wallet state', () => {
      const result = WalletSelectors.selectWalletState(mockAppState);
      expect(result).toBe(mockWalletState);
    });
  });

  describe('selectWallet', () => {
    it('should select the wallet', () => {
      const result = WalletSelectors.selectWallet.projector(mockWalletState);
      expect(result).toBe(mockWallet);
    });

    it('should return null when wallet is null', () => {
      const stateWithNullWallet = {
        ...mockWalletState,
        wallet: null
      };
      const result = WalletSelectors.selectWallet.projector(stateWithNullWallet);
      expect(result).toBeNull();
    });
  });

  describe('selectWalletLoading', () => {
    it('should select the wallet creation loading state', () => {
      const result = WalletSelectors.selectWalletLoading.projector(mockWalletState);
      expect(result).toBe(true);
    });

    it('should return false when not creating wallet', () => {
      const stateNotCreating = {
        ...mockWalletState,
        isCreatingWallet: false
      };
      const result = WalletSelectors.selectWalletLoading.projector(stateNotCreating);
      expect(result).toBe(false);
    });
  });

  describe('selectWalletFetching', () => {
    it('should select the wallet fetching state', () => {
      const result = WalletSelectors.selectWalletFetching.projector(mockWalletState);
      expect(result).toBe(true);
    });

    it('should return false when not fetching wallet', () => {
      const stateNotFetching = {
        ...mockWalletState,
        isFetching: false
      };
      const result = WalletSelectors.selectWalletFetching.projector(stateNotFetching);
      expect(result).toBe(false);
    });
  });

  describe('selectWalletError', () => {
    it('should select the wallet creation error', () => {
      const result = WalletSelectors.selectWalletError.projector(mockWalletState);
      expect(result).toBe('Create wallet error');
    });

    it('should return null when no wallet creation error', () => {
      const stateWithoutError = {
        ...mockWalletState,
        createWalletError: null
      };
      const result = WalletSelectors.selectWalletError.projector(stateWithoutError);
      expect(result).toBeNull();
    });
  });

  describe('selectWalletFetchError', () => {
    it('should select the wallet fetch error', () => {
      const result = WalletSelectors.selectWalletFetchError.projector(mockWalletState);
      expect(result).toBe('Fetch wallet error');
    });

    it('should return null when no wallet fetch error', () => {
      const stateWithoutError = {
        ...mockWalletState,
        fetchWalletError: null
      };
      const result = WalletSelectors.selectWalletFetchError.projector(stateWithoutError);
      expect(result).toBeNull();
    });
  });

  describe('selectDepositLoading', () => {
    it('should select the deposit loading state', () => {
      const result = WalletSelectors.selectDepositLoading.projector(mockWalletState);
      expect(result).toBe(true);
    });

    it('should return false when not depositing', () => {
      const stateNotDepositing = {
        ...mockWalletState,
        isDepositing: false
      };
      const result = WalletSelectors.selectDepositLoading.projector(stateNotDepositing);
      expect(result).toBe(false);
    });
  });

  describe('selectDepositError', () => {
    it('should select the deposit error', () => {
      const result = WalletSelectors.selectDepositError.projector(mockWalletState);
      expect(result).toBe('Deposit error');
    });

    it('should return null when no deposit error', () => {
      const stateWithoutError = {
        ...mockWalletState,
        depositError: null
      };
      const result = WalletSelectors.selectDepositError.projector(stateWithoutError);
      expect(result).toBeNull();
    });
  });

  describe('selectTransferLoading', () => {
    it('should select the transfer loading state', () => {
      const result = WalletSelectors.selectTransferLoading.projector(mockWalletState);
      expect(result).toBe(true);
    });

    it('should return false when not transferring', () => {
      const stateNotTransferring = {
        ...mockWalletState,
        isTransferring: false
      };
      const result = WalletSelectors.selectTransferLoading.projector(stateNotTransferring);
      expect(result).toBe(false);
    });
  });

  describe('selectTransferError', () => {
    it('should select the transfer error', () => {
      const result = WalletSelectors.selectTransferError.projector(mockWalletState);
      expect(result).toBe('Transfer error');
    });

    it('should return null when no transfer error', () => {
      const stateWithoutError = {
        ...mockWalletState,
        transferError: null
      };
      const result = WalletSelectors.selectTransferError.projector(stateWithoutError);
      expect(result).toBeNull();
    });
  });

  describe('selectSwapLoading', () => {
    it('should select the swap loading state', () => {
      const result = WalletSelectors.selectSwapLoading.projector(mockWalletState);
      expect(result).toBe(true);
    });

    it('should return false when not swapping', () => {
      const stateNotSwapping = {
        ...mockWalletState,
        isSwapping: false
      };
      const result = WalletSelectors.selectSwapLoading.projector(stateNotSwapping);
      expect(result).toBe(false);
    });
  });

  describe('selectSwapError', () => {
    it('should select the swap error', () => {
      const result = WalletSelectors.selectSwapError.projector(mockWalletState);
      expect(result).toBe('Swap error');
    });

    it('should return null when no swap error', () => {
      const stateWithoutError = {
        ...mockWalletState,
        swapError: null
      };
      const result = WalletSelectors.selectSwapError.projector(stateWithoutError);
      expect(result).toBeNull();
    });
  });

  describe('Selector composition', () => {
    it('should work with composed selectors', () => {
      const walletResult = WalletSelectors.selectWallet.projector(mockWalletState);
      const loadingResult = WalletSelectors.selectWalletLoading.projector(mockWalletState);
      const errorResult = WalletSelectors.selectWalletError.projector(mockWalletState);

      expect(walletResult).toEqual(mockWallet);
      expect(loadingResult).toBe(true);
      expect(errorResult).toBe('Create wallet error');
    });

    it('should handle empty/undefined states gracefully', () => {
      const emptyState = {
        wallet: null,
        isCreatingWallet: false,
        createWalletError: null,
        isFetching: false,
        fetchWalletError: null,
        isDepositing: false,
        depositError: null,
        isTransferring: false,
        transferError: null,
        isSwapping: false,
        swapError: null
      };

      expect(WalletSelectors.selectWallet.projector(emptyState)).toBeNull();
      expect(WalletSelectors.selectWalletLoading.projector(emptyState)).toBe(false);
      expect(WalletSelectors.selectWalletError.projector(emptyState)).toBeNull();
      expect(WalletSelectors.selectDepositLoading.projector(emptyState)).toBe(false);
      expect(WalletSelectors.selectDepositError.projector(emptyState)).toBeNull();
      expect(WalletSelectors.selectTransferLoading.projector(emptyState)).toBe(false);
      expect(WalletSelectors.selectTransferError.projector(emptyState)).toBeNull();
      expect(WalletSelectors.selectSwapLoading.projector(emptyState)).toBe(false);
      expect(WalletSelectors.selectSwapError.projector(emptyState)).toBeNull();
    });
  });

  describe('Memoization', () => {
    it('should return the same reference for identical input', () => {
      const result1 = WalletSelectors.selectWallet.projector(mockWalletState);
      const result2 = WalletSelectors.selectWallet.projector(mockWalletState);
      
      expect(result1).toBe(result2);
    });

    it('should return different references for different input', () => {
      const differentWallet = { ...mockWallet, id: '2' };
      const differentState = { ...mockWalletState, wallet: differentWallet };
      
      const result1 = WalletSelectors.selectWallet.projector(mockWalletState);
      const result2 = WalletSelectors.selectWallet.projector(differentState);
      
      expect(result1).not.toBe(result2);
    });
  });
});