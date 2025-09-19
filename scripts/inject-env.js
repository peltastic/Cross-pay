const fs = require('fs');
const path = require('path');

const envProdPath = path.join(__dirname, '../src/environments/environment.prod.ts');

let content = fs.readFileSync(envProdPath, 'utf8');

if (process.env.EXCHANGE_RATE_API_URL) {
  content = content.replace(
    /exchangeRateApiUrl: ['"][^'"]*['"]/,
    `exchangeRateApiUrl: '${process.env.EXCHANGE_RATE_API_URL}'`
  );
} else {
  console.log('  EXCHANGE_RATE_API_URL not found, using default empty string');
}

if (process.env.EXCHANGE_RATE_API_KEY) {
  content = content.replace(
    /exchangerateApiKey: ['"][^'"]*['"]/,
    `exchangerateApiKey: '${process.env.EXCHANGE_RATE_API_KEY}'`
  );
} else {
  console.log('⚠️  EXCHANGE_RATE_API_KEY not found, using default empty string');
}

fs.writeFileSync(envProdPath, content);

