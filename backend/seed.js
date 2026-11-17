// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/ProductModel');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edgistify';

const products = [
  {
    title: "CI Test T-Shirt",
    price: 25,
    images: ["https://via.placeholder.com/250"],
    sizes: ["S", "M", "L"],
    brand: "TestBrand",
    rating: 4.5,
    reviews: "10",
    description: "Nice shirt",
    originalPrice: 30,
    discount: 5,
    img1: "https://via.placeholder.com/250"
  },
  {
    title: "CI Test Jeans",
    price: 50,
    images: ["https://via.placeholder.com/250"],
    sizes: ["M", "L", "XL"],
    brand: "TestBrand",
    rating: 4.0,
    reviews: "5",
    description: "Nice jeans",
    originalPrice: 60,
    discount: 10,
    img1: "https://via.placeholder.com/250"
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding...');
    
    // Очищаем старые товары (чтобы не было дублей)
    await Product.deleteMany({});
    
    // Вставляем новые
    await Product.insertMany(products);
    console.log('Database seeded successfully!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
