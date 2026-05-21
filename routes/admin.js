const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Property = require('../models/Property');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const router = express.Router();

// Create default admin if none exists
const initAdmin = async () => {
  try {
    const count = await Admin.countDocuments();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      const admin = new Admin({
        email: 'admin@ashmil.com',
        password: hashedPassword
      });
      await admin.save();
      console.log('✅ Default admin created: admin@ashmil.com / Admin123!');
    }
  } catch (err) {
    console.error('Error creating admin:', err.message);
  }
};
initAdmin();

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({ token, message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========== PROPERTY CRUD ==========

// Get all properties (admin)
router.get('/properties', auth, async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add property
router.post('/properties', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description, price, location, category, bedrooms, bathrooms, area, featured } = req.body;
    const images = req.files ? req.files.map(file => '/uploads/' + file.filename) : [];
    
    const property = new Property({
      title,
      description,
      price,
      location,
      category,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      area: area || '',
      featured: featured === 'true',
      images
    });
    
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Update property
router.put('/properties/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.files && req.files.length) {
      updates.images = req.files.map(f => '/uploads/' + f.filename);
    }
    if (updates.bedrooms) updates.bedrooms = Number(updates.bedrooms);
    if (updates.bathrooms) updates.bathrooms = Number(updates.bathrooms);
    if (updates.featured) updates.featured = updates.featured === 'true';
    
    const property = await Property.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete property
router.delete('/properties/:id', auth, async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;