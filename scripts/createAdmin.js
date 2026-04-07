const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sequelize = require('../config/database');

const seedAdmin = async () => {
  try {
    // Authenticate and sync the database first
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('MySQL Connected for Seed');

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('Admin user already exists! Username: admin');
      process.exit(0);
    }

    // Create default admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      username: 'admin',
      password: hashedPassword
    });

    console.log('----------------------------------------------------');
    console.log('DEFAULT MYSQL ADMIN CREATED SUCCESSFULLY!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Important: Change this password in the database or update the script before production.');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedAdmin();
