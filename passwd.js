const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


mongoose.connect('mongodb+srv://odionyejovy:Z5Fc7zOXIqkhr2Jw@cipherghostss.lpr2noh.mongodb.net/')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error: ', err));

// Admin schema definition
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

// Admin model
const Admin = mongoose.model('Admin', adminSchema);

// Function to create admin user
async function createAdmin() {
  const adminExists = await Admin.findOne({ username: 'cipheradmin' });

  if (!adminExists) {
    // Hash password
    const hashedPassword = await bcrypt.hash('c1pher@ghostss#', 10);

    const admin = new Admin({
      username: 'cipheradmin',
      password: hashedPassword,
    });

    await admin.save();
    console.log('Admin user created!');
  } else {
    console.log('Admin user already exists');
  }

  // Close the connection
  mongoose.connection.close();
}

// Run the function to create admin
createAdmin().catch((err) => console.error('Error creating admin:', err));
