require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Product = require("../models/productModel");

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");

    // Check if products already exist
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`Products already exist (${count} products). Skipping seed.`);
      process.exitCode = 0;
      return;
    }

    // Initial product data
    const seedData = [
      { productId: 1, name: "Gummy Bears", description: "Colorful gummy bears", price: 3.99, stock: 50, image: "candies/gummybears.jpg" },
      { productId: 2, name: "Chocolate Bar", description: "Rich chocolate bar", price: 2.49, stock: 75, image: "candies/chocolate.jpeg" },
      { productId: 3, name: "Sour Worms", description: "Sour gummy worms", price: 4.25, stock: 30, image: "candies/sourworm.webp" },
      { productId: 4, name: "Lollipops", description: "Classic lollipops", price: 1.99, stock: 100, image: "candies/lollipop.jpeg" },
      { productId: 5, name: "Jelly Beans", description: "Assorted jelly beans", price: 3.49, stock: 60, image: "candies/jellybeans.jpg" },
      { productId: 6, name: "Caramel Chews", description: "Chewy caramel candy", price: 4.29, stock: 40, image: "candies/caramelchew.jpg" },
      { productId: 7, name: "Rainbow Belts", description: "Rainbow sour belts", price: 5.49, stock: 25, image: "candies/rainbowbelts.jpg" },
      { productId: 8, name: "Peanut Butter Cups", description: "Peanut butter cups", price: 4.99, stock: 35, image: "candies/pbcups.jpg" },
      { productId: 9, name: "Rock Candy", description: "Rock candy sticks", price: 2.99, stock: 55, image: "candies/rockcandy.jpg" },
      { productId: 10, name: "Marshmallow Twists", description: "Twisted marshmallows", price: 3.79, stock: 45, image: "candies/marshmallowtwists.jpg" }
    ];

    await Product.insertMany(seedData);
    console.log(`Successfully seeded ${seedData.length} products`);
    process.exitCode = 0;
  } catch (err) {
    console.error("Error seeding products:", err.message || err);
    process.exitCode = 1;
  } finally {
    try { await mongoose.disconnect(); } catch (e) {}
  }
}

seedProducts();
