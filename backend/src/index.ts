import 'dotenv/config';
import { createApp } from './app';
import { connectToDatabase } from './config/db';

const PORT = process.env.PORT ?? 4000;

async function main() {
  await connectToDatabase();
  const app = createApp();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`PlacementOS backend listening on port ${PORT}`);
  });
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error);
  process.exit(1);
});
