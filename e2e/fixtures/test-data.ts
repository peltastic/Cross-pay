export const testUsers = {
  validUser: {
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    country: 'US',
    currency: 'USD'
  },
  
  ukUser: {
    email: 'jane.smith@example.co.uk',
    firstName: 'Jane',
    lastName: 'Smith',
    country: 'GB',
    currency: 'GBP'
  },
  
  euroUser: {
    email: 'pierre.martin@example.fr',
    firstName: 'Pierre',
    lastName: 'Martin',
    country: 'FR',
    currency: 'EUR'
  }
};

export const testWallets = {
  usdWallet: {
    currency: 'USD',
    balance: '1000.00',
    address: '0x1234567890abcdef1234567890abcdef12345678'
  },
  
  gbpWallet: {
    currency: 'GBP',
    balance: '750.00',
    address: '0xabcdef1234567890abcdef1234567890abcdef12'
  },
  
  eurWallet: {
    currency: 'EUR',
    balance: '850.00',
    address: '0x567890abcdef1234567890abcdef1234567890ab'
  }
};

export const testTransactions = {
  transfer: {
    amount: '100.00',
    recipientAddress: '0x9876543210fedcba9876543210fedcba98765432',
    description: 'Test transfer payment'
  },
  
  exchange: {
    fromCurrency: 'USD',
    toCurrency: 'EUR',
    amount: '200.00'
  }
};

export const validationMessages = {
  email: {
    required: 'Email is required',
    invalid: 'Please enter a valid email address'
  },
  
  firstName: {
    required: 'First name is required',
    minLength: 'First name must be at least 2 characters'
  },
  
  lastName: {
    required: 'Last name is required',
    minLength: 'Last name must be at least 2 characters'
  },
  
  amount: {
    required: 'Amount is required',
    insufficient: 'Insufficient balance',
    minimum: 'Minimum amount is 0.01'
  },
  
  address: {
    required: 'Recipient address is required',
    invalid: 'Please enter a valid wallet address'
  }
};