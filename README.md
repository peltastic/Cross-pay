# Cross-Pay: Cross-Border Payment Dashboard



**A modern, scalable cross-border payment dashboard built for the future of finance**

[Live Demo](https://cross-pay.vercel.app)

[Design Document](https://docs.google.com/document/d/1FLz-8zJkq0qL5yNAzAeMIbcFkRXWTZ89Yctb9K4w5XQ/edit?usp=sharing)


## Features

-  **Multi-currency Wallet Management** - Create and manage digital wallets
-  **Real-time Currency Exchange** - Live FX rates with seamless conversion
-  **Cross-border Transfers** - Send funds globally with real-time tracking
-  **Advanced Analytics** - Interactive charts and transaction insights
-  **Modern UI/UX** - Responsive design with dark/light mode support
-  **Secure Architecture** - Type-safe with comprehensive error handling
-  **PWA Ready** - Offline capabilities and mobile-optimized experience

## Tech Stack

- **Framework**: Angular 20 (Standalone Components)
- **State Management**: NgRx 20
- **Styling**: TailwindCSS v4
- **Charts**: Chart.js with ng2-charts
- **Testing**: karma + Playwright
- **Deployment**: Vercel

##  Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **npm** 9.x or higher
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cross-pay.git
   cd cross-pay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   - Create a .env file, below is the .env.example to follow
```
EXCHANGE_RATE_API_URL=https://api.exchangeratesapi.io/v1
EXCHANGE_RATE_API_KEY=your_api_key_here 
NODE_ENV=development
   
   ```

4. **Start the development server**
   ```bash
   npm run start
   ```

   The application will be available at `http://localhost:4200`


##  Testing Setup

### Unit Testing with Karma

This project uses **Karma** with Angular Testing Library for comprehensive unit testing.

#### Running Unit Tests

```bash
- Run all tests once
npm test

- Run tests with coverage report
npm run test:coverage
```




### E2E Testing with Playwright

This project uses **Playwright** for end-to-end testing across multiple browsers.


#### Running E2E Tests

```bash
npm run test:e2e           - Run e2e tests (headless)
npm run test:e2e:ui        - Interactive UI mode
npm run test:e2e:headed    - With visible browser
npm run test:e2e:debug     - Debug mode
npm run test:e2e:report    - View test report
```


##  Mock Backend

The application includes a comprehensive mock backend service that simulates real-world API behavior:

### Features

- **Persistent Data**: Uses localStorage to maintain state across sessions
- **Realistic Delays**: Simulates network latency (200-800ms)
- **Error Simulation**: Random failures for testing error handling
- **Live FX Integration**: Real exchange rates from exchangerate-api.com

### Mock API Endpoints

- `POST /api/users` - Create user account
- `POST /api/wallets` - Create wallet
- `GET /api/wallets/:userId` - Get user wallets
- `POST /api/deposit` - Deposit funds
- `POST /api/transfer` - Transfer funds
- `POST /api/swap` - Currency exchange
- `GET /api/transactions/:walletId` - Transaction history
- `GET /api/exchange-rates` - Current FX rates