import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { handleStudentError } from './controllers/studentController';
import studentRoutes from './routes/studentRoutes';

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/placementos';

app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ message: 'PlacementOS API is running' });
});

app.use('/api/students', studentRoutes);
app.use(handleStudentError);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong' });
});

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error: Error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
