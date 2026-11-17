require('dotenv').config();
const mongoose = require('mongoose');
const ProductModel = require('./models/ProductModel'); // Убедитесь, что путь правильный!

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edgistify';

const products = [
  {
    title: "CI Test T-Shirt",
    category: "clothing",
    description: "Nice shirt",
    brand: "TestBrand",
    price: 25,
    rating: 4.5,
    images: ["https://via.placeholder.com/250"],
    quantity: 10,
    size: "M",
    // Поля ниже нужны фронтенду, даже если их нет в схеме:
    sizes: ["S", "M", "L"], 
    reviews: "10",
    originalPrice: 30,
    discount: 5,
    img1: "https://via.placeholder.com/250"
  },
  {
    title: "CI Test Jeans",
    category: "clothing",
    description: "Nice jeans",
    brand: "TestBrand",
    price: 50,
    rating: 4.0,
    images: ["https://via.placeholder.com/250"],
    quantity: 5,
    size: "L",
    sizes: ["M", "L", "XL"],
    reviews: "5",
    originalPrice: 60,
    discount: 10,
    img1: "https://via.placeholder.com/250"
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding...');
    
    // Очищаем старые товары
    await ProductModel.deleteMany({});
    
    // Вставляем новые
    await ProductModel.insertMany(products);
    console.log('Database seeded successfully!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
