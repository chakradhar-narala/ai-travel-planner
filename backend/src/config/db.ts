import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('MONGO_URI is not defined in environment variables');
    process.exit(1);
  }

  let retries = 5;
  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  while (retries > 0) {
    try {
      await mongoose.connect(mongoUri);
      console.log('✅ MongoDB connected successfully');
      return;
    } catch (error) {
      retries -= 1;
      console.error(`❌ MongoDB connection failed. Retries left: ${retries}`);
      if (retries === 0) {
        console.error('Could not connect to MongoDB. Exiting.');
        process.exit(1);
      }
      await delay(3000);
    }
  }
};

export default connectDB;
