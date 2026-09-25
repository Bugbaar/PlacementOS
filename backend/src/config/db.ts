import mongoose from 'mongoose';

export async function connectToDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // eslint-disable-next-line no-console
    console.warn('MONGODB_URI not set, skipping DB connection (results will not persist)');
    return;
  }
  await mongoose.connect(uri);
}
