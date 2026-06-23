import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import tripRoutes from './routes/tripRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      /https:\/\/.*\.vercel\.app$/  // Allow any Vercel deployment
    ];
    
    if (!origin || allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? origin === allowed : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// API Route Bindings
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
