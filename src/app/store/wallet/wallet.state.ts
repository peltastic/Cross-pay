import { WalletStateModel } from "../../core/models/wallet.model";

export const initialState: WalletStateModel = {
    wallet: null,
    isCreatingWallet: false,
    isFetching: false,
    fetchWalletError: null,
    createWalletError: null,
    isDepositing: false,
    depositError: null,
    isTransferring: false,
    transferError: null,
    isSwapping: false,
    swapError: null
}