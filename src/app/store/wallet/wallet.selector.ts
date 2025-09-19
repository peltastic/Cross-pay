import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WalletStateModel } from '../../core/models/wallet.model';

export const selectWalletState = createFeatureSelector<WalletStateModel>('wallet');

export const selectWallet = createSelector(
  selectWalletState,
  (state) => state.wallet
);

export const selectWalletLoading = createSelector(
  selectWalletState,
  (state) => state.isCreatingWallet
);

export const selectWalletFetching = createSelector(
  selectWalletState,
  (state) => state.isFetching
);

export const selectWalletError = createSelector(
  selectWalletState,
  (state) => state.createWalletError
);

export const selectWalletFetchError = createSelector(
  selectWalletState,
  (state) => state.fetchWalletError
);

export const selectDepositLoading = createSelector(
  selectWalletState,
  (state) => state.isDepositing
);

export const selectDepositError = createSelector(
  selectWalletState,
  (state) => state.depositError
);

export const selectTransferLoading = createSelector(
  selectWalletState,
  (state) => state.isTransferring
);

export const selectTransferError = createSelector(
  selectWalletState,
  (state) => state.transferError
);

export const selectSwapLoading = createSelector(
  selectWalletState,
  (state) => state.isSwapping
);

export const selectSwapError = createSelector(
  selectWalletState,
  (state) => state.swapError
);