const fs = require('fs');
const path = require('path');

// The API key provided
const API_KEY = '5b3ce3597851110001cf624841e5a7aaf63e4aaf876c285ef0f15e30';

// Create the .env file content
const envContent = `# OpenRouteService API Key
OPENROUTE_API_KEY=${API_KEY}

# Other environment variables
PORT=3000
NODE_ENV=development
`;

// Write to .env file
fs.writeFileSync(path.join(__dirname, '.env'), envContent);

console.log('Environment setup complete!');
console.log('.env file created with API key.');
console.log('You can now start the application with: npm run start:dev'); 