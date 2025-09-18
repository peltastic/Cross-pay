import { userReducer } from "./user/user.reducer";
import { walletReducer } from "./wallet/wallet.reducer";
import { transactionReducer } from "./transaction/transaction.reducer";
import { exchangeRateReducer } from "./exchange-rate/exchange-rate.reducer";
import { errorReducer } from "./error/error.reducer";

export const appState = {
  user: userReducer,
  wallet: walletReducer,
  transaction: transactionReducer,
  exchangeRate: exchangeRateReducer,
  error: errorReducer,
};