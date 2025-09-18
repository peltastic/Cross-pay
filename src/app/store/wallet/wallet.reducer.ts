import { Action, createReducer, on } from '@ngrx/store';
import { initialState } from './wallet.state';
import {
  createWallet,
  createWalletSuccess,
  createWalletFailure,
  getWallet,
  getWalletSuccess,
  getWalletFailure,
  deposit,
  depositSuccess,
  depositFailure,
  clearDepositError,
  transfer,
  transferSuccess,
  transferFailure,
  clearTransferError,
} from './wallet.actions';
import { WalletStateModel } from '../../core/models/wallet.model';

const _walletReducer = createReducer(
  initialState,
  on(createWallet, (state) => ({ ...state, isCreatingWallet: true, createWalletError: null })),
  on(createWalletSuccess, (state) => ({
    ...state,
    isCreatingWallet: false,
    createWalletError: null,
  })),
  on(createWalletFailure, (state, { error }) => ({
    ...state,
    isCreatingWallet: false,
    createWalletError: error,
  })),
  on(getWallet, (state) => ({ ...state, isFetching: true, fetchWalletError: null })),
  on(getWalletSuccess, (state, { wallet }) => ({
    ...state,
    wallet,
    isFetching: false,
    fetchWalletError: null,
  })),
  on(getWalletFailure, (state, { error }) => ({
    ...state,
    isFetching: false,
    fetchWalletError: error,
  })),
  on(deposit, (state) => ({ 
    ...state, 
    isDepositing: true, 
    depositError: null 
  })),
  on(depositSuccess, (state, { wallet }) => ({
    ...state,
    wallet,
    isDepositing: false,
    depositError: null,
  })),
  on(depositFailure, (state, { error }) => ({
    ...state,
    isDepositing: false,
    depositError: error,
  })),
  on(clearDepositError, (state) => ({
    ...state,
    depositError: null,
  })),
  on(transfer, (state) => ({ 
    ...state, 
    isTransferring: true, 
    transferError: null 
  })),
  on(transferSuccess, (state, { senderWallet }) => ({
    ...state,
    wallet: senderWallet,
    isTransferring: false,
    transferError: null,
  })),
  on(transferFailure, (state, { error }) => ({
    ...state,
    isTransferring: false,
    transferError: error,
  })),
  on(clearTransferError, (state) => ({
    ...state,
    transferError: null,
  }))
);

export function walletReducer(state: WalletStateModel | undefined, action: Action) {
  return _walletReducer(state, action);
}