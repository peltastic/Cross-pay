import { createAction, props } from '@ngrx/store';
import { WalletModel } from '../../core/models/wallet.model';

export const CREATE_WALLET_SUCCESS = '[Wallet] Create Wallet Success';
export const CREATE_WALLET_FAILURE = '[Wallet] Create Wallet Failure';
export const CREATE_WALLET = '[Wallet] Create Wallet';

export const GET_WALLET_SUCCESS = '[Wallet] Get Wallet Success';
export const GET_WALLET_FAILURE = '[Wallet] Get Wallet Failure';
export const GET_WALLET = '[Wallet] Get Wallet';

export const DEPOSIT_SUCCESS = '[Wallet] Deposit Success';
export const DEPOSIT_FAILURE = '[Wallet] Deposit Failure';
export const DEPOSIT = '[Wallet] Deposit';
export const CLEAR_DEPOSIT_ERROR = '[Wallet] Clear Deposit Error';

export const TRANSFER_SUCCESS = '[Wallet] Transfer Success';
export const TRANSFER_FAILURE = '[Wallet] Transfer Failure';
export const TRANSFER = '[Wallet] Transfer';
export const CLEAR_TRANSFER_ERROR = '[Wallet] Clear Transfer Error';

export const createWallet = createAction(CREATE_WALLET, props<{ email: string }>());
export const createWalletSuccess = createAction(CREATE_WALLET_SUCCESS);
export const createWalletFailure = createAction(CREATE_WALLET_FAILURE, props<{ error: string }>());

export const getWallet = createAction(GET_WALLET, props<{ email: string }>());
export const getWalletSuccess = createAction(
  GET_WALLET_SUCCESS,
  props<{ wallet: WalletModel }>()
);
export const getWalletFailure = createAction(GET_WALLET_FAILURE, props<{ error: string }>());

export const deposit = createAction(
  DEPOSIT, 
  props<{ email: string; amount: number; currency: string }>()
);
export const depositSuccess = createAction(
  DEPOSIT_SUCCESS,
  props<{ wallet: WalletModel; message: string }>()
);
export const depositFailure = createAction(
  DEPOSIT_FAILURE, 
  props<{ error: string }>()
);
export const clearDepositError = createAction(CLEAR_DEPOSIT_ERROR);

export const transfer = createAction(
  TRANSFER,
  props<{ fromEmail: string; toWalletAddress: string; amount: number; fromCurrency: string; toCurrency: string; convertedAmount: number; exchangeRate: number }>()
);
export const transferSuccess = createAction(
  TRANSFER_SUCCESS,
  props<{ senderWallet: WalletModel; message: string }>()
);
export const transferFailure = createAction(
  TRANSFER_FAILURE,
  props<{ error: string }>()
);
export const clearTransferError = createAction(CLEAR_TRANSFER_ERROR);