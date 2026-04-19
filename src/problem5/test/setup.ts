import { execSync } from 'node:child_process';
import dotenv from 'dotenv';
import path from 'node:path';

// 1. Force load the test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

export default async () => {
  console.log('\nPreparing Test Database...');

  // 2. Sync the schema to the test database
  // Using 'db push' is faster for tests than 'migrate deploy'
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    
    console.log('Test Database schema is in sync.\n');
  } catch (error) {
    console.error('Failed to sync Test Database schema:', error);
    process.exit(1);
  }
};