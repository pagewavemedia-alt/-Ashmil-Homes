require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import routes
const adminRoutes = require('./routes/admin');
const propertyRoutes = require('./routes/properties');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5000;

// ========== MIDDLEWARE ==========
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// ========== API ROUTES ==========
app.use('/api/admin', adminRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/contact', contactRoutes);

// ========== FRONTEND ROUTES ==========

// Homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Properties page
app.get('/properties', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'properties.html'));
});

// Properties with category filter
app.get('/properties/category/:category', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'properties.html'));
});

// About page
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Contact page
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Single property details page
app.get('/property/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'property-details.html'));
});

// ========== ADMIN ROUTES ==========

// Admin login page
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

// Admin dashboard
app.get('/admin/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});

// ========== TEST ROUTE ==========
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========== 404 HANDLER ==========
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ========== DATABASE CONNECTION & SERVER START ==========
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔐 Admin login: http://localhost:${PORT}/admin/login`);
    console.log(`📧 Email configured: ${process.env.EMAIL_USER ? 'Yes' : 'No'}`);
    console.log(`📁 Uploads directory: ${uploadsDir}\n`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('\n💡 Troubleshooting tips:');
  console.log('   1. Check your MONGODB_URI in .env file');
  console.log('   2. Make sure MongoDB Atlas cluster is ACTIVE (not paused)');
  console.log('   3. Add 0.0.0.0/0 to IP whitelist in MongoDB Atlas');
  console.log('   4. Verify username/password are correct\n');
  process.exit(1);
});
