require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const weightRoutes = require('./routes/weight');
const userRoutes = require('./routes/user');
const { initDatabase } = require('./database');
const { setupEmailReminder } = require('./services/emailReminder');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// In production, CORS is handled by serving static files from same origin
const corsOptions = process.env.NODE_ENV === 'production' 
  ? { origin: false } // Same origin in production (static files served from same server)
  : { origin: 'http://localhost:3000', credentials: true };
app.use(cors(corsOptions));
app.use(express.json());

// Initialize database
initDatabase().then(() => {
  // Setup email reminder cron job after database is ready
  setupEmailReminder();
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/weight', weightRoutes);
app.use('/api/user', userRoutes);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../client/build');
  const indexPath = path.join(buildPath, 'index.html');
  
  // Check if build directory exists
  const fs = require('fs');
  if (!fs.existsSync(buildPath)) {
    console.error(`Build directory not found at: ${buildPath}`);
    console.error('Make sure to run: npm run build before starting the server');
  }
  
  app.use(express.static(buildPath));
  
  // Serve React app for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(500).send('Build files not found. Please ensure the frontend is built.');
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

