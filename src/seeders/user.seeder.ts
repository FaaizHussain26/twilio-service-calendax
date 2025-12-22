// src/seeders/userSeeder.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/user.schema';
import connectDB from '../config/database';

dotenv.config();

const seedUsers = async () => {
  try {
    await connectDB();
    await User.deleteMany({});
    const users = [
      { email: 'admin@example.com', password: await bcrypt.hash('admin123', 10), role: 'admin', name: 'Admin User', site: 'SiteA' },
      { email: 'researcher@example.com', password: await bcrypt.hash('researcher123', 10), role: 'researcher', name: 'Researcher User', site: 'SiteB' },
    ];
    await User.insertMany(users);
    console.log('Users seeded successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

seedUsers();