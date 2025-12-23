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
  const fs = require('fs');
  
  // Try multiple possible build paths (Render might use different structure)
  const possiblePaths = [
    path.join(__dirname, '../client/build'),
    path.join(__dirname, '../../client/build'),
    path.join(process.cwd(), 'client/build'),
    path.join(process.cwd(), 'build'),
  ];
  
  let buildPath = null;
  let indexPath = null;
  
  // Find the first existing build directory
  for (const possiblePath of possiblePaths) {
    const possibleIndexPath = path.join(possiblePath, 'index.html');
    if (fs.existsSync(possibleIndexPath)) {
      buildPath = possiblePath;
      indexPath = possibleIndexPath;
      console.log(`Found build directory at: ${buildPath}`);
      break;
    }
  }
  
  if (!buildPath) {
    console.error('Build directory not found. Tried paths:');
    possiblePaths.forEach(p => console.error(`  - ${p}`));
    console.error('Current working directory:', process.cwd());
    console.error('__dirname:', __dirname);
    console.error('Make sure to run: npm run build before starting the server');
  } else {
    app.use(express.static(buildPath));
    
    // Serve React app for all non-API routes
    app.get('*', (req, res, next) => {
      // Skip API routes
      if (req.path.startsWith('/api')) {
        return next();
      }
      
      res.sendFile(indexPath);
    });
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

