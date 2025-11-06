import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { connectDB, testConnection } from './config/database.js';

// Load environment variables
dotenv.config();

// Set default timezone to Asia/Bangkok
process.env.TZ = 'Asia/Bangkok';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Lotto System API',
    version: '1.0.0',
    status: 'running'
  });
});

// API Routes
app.use('/api/v1', routes);

// Error Handlers (ต้องอยู่หลัง routes)
app.use(notFoundHandler);
app.use(errorHandler);

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Make io accessible in routes
app.set('io', io);

// Start server
httpServer.listen(PORT, async () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket server is ready`);

  // Connect to MongoDB
  await connectDB();

  // Test database connection
  await testConnection();
});

export default app;
