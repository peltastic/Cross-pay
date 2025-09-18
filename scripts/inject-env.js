const fs = require('fs');
const path = require('path');

// File paths - go up one directory from scripts folder
const envProdPath = path.join(__dirname, '../src/environments/environment.prod.ts');

let content = fs.readFileSync(envProdPath, 'utf8');

// Inject API URL if provided
if (process.env.EXCHANGE_RATE_API_URL) {
  content = content.replace(
    /exchangeRateApiUrl: ['"][^'"]*['"]/,
    `exchangeRateApiUrl: '${process.env.EXCHANGE_RATE_API_URL}'`
  );
  console.log('✅ EXCHANGE_RATE_API_URL injected');
} else {
  console.log('⚠️  EXCHANGE_RATE_API_URL not found, using default empty string');
}

// Inject API Key if provided
if (process.env.EXCHANGE_RATE_API_KEY) {
  content = content.replace(
    /exchangerateApiKey: ['"][^'"]*['"]/,
    `exchangerateApiKey: '${process.env.EXCHANGE_RATE_API_KEY}'`
  );
  console.log('✅ EXCHANGE_RATE_API_KEY injected');
} else {
  console.log('⚠️  EXCHANGE_RATE_API_KEY not found, using default empty string');
}

fs.writeFileSync(envProdPath, content);

console.log('✅ Environment variables injection completed');
