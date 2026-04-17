import { prisma } from './common/configs/prisma';
import { env } from './common/configs/env';
import app from './app';

// Function checks database connection before starting the server
const checkDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ [Database]: Connected successfully!');
  } catch (error) {
    console.error('❌ [Database]: Failed to connect. Error:', error);
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    await checkDatabaseConnection();

    const port = parseInt(env.PORT, 10);

    app.listen(port, () => {
      console.log(`=================================`);
      console.log(`🚀 API Server is running at: http://localhost:${port}`);
      console.log(`🛡️ Accepting connections from: ${env.CLIENT_URL}`);
      console.log(`=================================`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();

