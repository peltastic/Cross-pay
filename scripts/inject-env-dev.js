const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load .env file

// File paths
const envDevPath = path.join(__dirname, '../src/environments/environment.ts');
const envDevBackupPath = path.join(__dirname, '../src/environments/environment.backup.ts');

// Create backup of original file
if (!fs.existsSync(envDevBackupPath)) {
  fs.copyFileSync(envDevPath, envDevBackupPath);
}

let content = fs.readFileSync(envDevPath, 'utf8');

// Inject API URL
const apiUrl = process.env.EXCHANGE_RATE_API_URL || 'https://api.exchangeratesapi.io/v1';
content = content.replace(
  /exchangeRateApiUrl: ['"][^'"]*['"]/,
  `exchangeRateApiUrl: '${apiUrl}'`
);
console.log('✅ EXCHANGE_RATE_API_URL injected:', apiUrl);

// Inject API Key
const apiKey = process.env.EXCHANGE_RATE_API_KEY || 'your_dev_api_key_here';
content = content.replace(
  /exchangerateApiKey: ['"][^'"]*['"]/,
  `exchangerateApiKey: '${apiKey}'`
);
console.log('✅ EXCHANGE_RATE_API_KEY injected');

// Inject App Name
const appName = process.env.APP_NAME || 'Cross Pay Dev';
content = content.replace(
  /appName: ['"][^'"]*['"]/,
  `appName: '${appName}'`
);
console.log('✅ APP_NAME injected:', appName);

// Inject App Version
const appVersion = process.env.APP_VERSION || '1.0.0-dev';
content = content.replace(
  /version: ['"][^'"]*['"]/,
  `version: '${appVersion}'`
);
console.log('✅ APP_VERSION injected:', appVersion);

fs.writeFileSync(envDevPath, content);

console.log('✅ Development environment variables injection completed');