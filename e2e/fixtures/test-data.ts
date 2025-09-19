export const testUsers = {
  validUser: {
    email: 'john.doe@example.com',
  },
  
  ukUser: {
    email: 'jane.smith@example.co.uk',
  },
  
  euroUser: {
    email: 'pierre.martin@example.fr',
  },

  invalidUser: {
    email: 'invalid-email',
  },

  emptyUser: {
    email: '',
  }
};

export const testWallets = {
  defaultWallet: {
    email: 'john.doe@example.com',
    walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    currencies: {
      USD: 1000.50,
      EUR: 850.75,
      GBP: 750.25
    },
    isCreatingWallet: false,
    createWalletError: null
  },
  
  emptyWallet: {
    email: 'empty@example.com',
    walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    currencies: {
      USD: 0,
      EUR: 0,
      GBP: 0
    },
    isCreatingWallet: false,
    createWalletError: null
  },

  loadingWallet: {
    email: 'loading@example.com',
    walletAddress: null,
    currencies: {},
    isCreatingWallet: true,
    createWalletError: null
  },

  errorWallet: {
    email: 'error@example.com',
    walletAddress: null,
    currencies: {},
    isCreatingWallet: false,
    createWalletError: 'Failed to create wallet'
  }
};

export const testTransactions = [
  {
    id: 'tx-1',
    type: 'deposit',
    amount: 500.00,
    currency: 'USD',
    date: '2024-09-15T10:30:00Z',
    status: 'completed',
    recipient: null
  },
  {
    id: 'tx-2',
    type: 'transfer',
    amount: 100.50,
    currency: 'EUR',
    date: '2024-09-14T15:45:00Z',
    status: 'completed',
    recipient: '0x9876543210fedcba9876543210fedcba98765432'
  },
  {
    id: 'tx-3',
    type: 'swap',
    amount: 75.25,
    currency: 'GBP',
    date: '2024-09-13T09:15:00Z',
    status: 'pending',
    recipient: null
  }
];

export const transferTestData = {
  validTransfer: {
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    amount: '100.50',
    walletAddress: '0x9876543210fedcba9876543210fedcba98765432'
  },
  
  invalidTransfer: {
    fromCurrency: '',
    toCurrency: '',
    amount: '',
    walletAddress: ''
  },

  insufficientBalanceTransfer: {
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    amount: '50000.00',
    walletAddress: '0x9876543210fedcba9876543210fedcba98765432'
  }
};

export const depositTestData = {
  validDeposit: {
    currency: 'USD',
    amount: '250.00'
  },
  
  invalidDeposit: {
    currency: '',
    amount: ''
  }
};

export const swapTestData = {
  validSwap: {
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    amount: '150.00'
  },
  
  invalidSwap: {
    fromCurrency: '',
    toCurrency: '',
    amount: ''
  }
};

export const validationMessages = {
  email: {
    required: 'Email is required',
    invalid: 'Please enter a valid email address'
  },
  
  amount: {
    required: 'Amount is required',
    insufficient: 'Insufficient balance',
    minimum: 'Amount must be greater than 0',
    invalid: 'Please enter a valid amount (e.g., 10.50)'
  },
  
  currency: {
    required: 'Currency is required'
  },
  
  walletAddress: {
    required: 'Wallet address is required',
    invalid: 'Please enter a valid wallet address'
  },

  fromCurrency: {
    required: 'From currency is required'
  },

  toCurrency: {
    required: 'To currency is required'
  }
};

export const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

export const apiEndpoints = {
  wallet: '/api/wallet',
  transactions: '/api/transactions',
  transfer: '/api/transfer',
  deposit: '/api/deposit',
  swap: '/api/swap',
  fxRates: '/api/fx-rates'
};