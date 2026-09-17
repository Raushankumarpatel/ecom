const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

//signup
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.json({ message: "User Registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user){
       return res.status(400).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch){
       return res.status(400).json({ message: "Wrong password" });
    }
    res.json({ message: "Login successful", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/Ecommerce")
.then(() => console.log("DB Connected"))
.catch(err => console.log(err));

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});
const Product = mongoose.model("Product", productSchema);

// Routes
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Bad request" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));