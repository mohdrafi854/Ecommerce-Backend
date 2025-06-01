const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./db/db.connect");
const Product = require("./models/Products");
const Categories = require("./models/Category");
const Cart = require("./models/Cart");
const Wishlist = require("./models/Wishlist");
const Country = require("./models/Country");
const City = require("./models/City");
const Address = require("./models/Address");
const Category = require("./models/Category");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

initializeDatabase();

app.get("/", (req, res) => {
  res.send("Hello server");
});

app.post("/api/products", async (req, res) => {
  const { name, price, imageUrl, Category } = req.body;

  try {
    const product = new Product({ name, price, imageUrl, Category });
    await product.save();
    res
      .status(200)
      .json({ message: "Product list created successful", product });
  } catch (error) {
    res.status(500).json({ error: "Product list error" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { categoryName, rating, sort, search } = req.query;

    let filter = {};
    if (categoryName) {
      const category = await Category.findOne({ name: categoryName });
      filter.Category = category._id;
    }

    if (rating) {
      filter.rating = rating;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    let sortOption = {};
    if (sort === "lowtohigh") {
      sortOption.price = 1;
    } else if (sort === "hightolow") {
      sortOption.price = -1;
    }

    const product = await Product.find(filter)
      .sort(sortOption)
      .populate("Category")
      .exec();
    if (product.length != 0) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

app.get("/api/products/:productId", async (req, res) => {
  try {
    const product = await Product.findById({ _id: req.params.productId });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product by id" });
  }
});

app.patch("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "product ID does not exist" });
    }

    const updateProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updateProduct) {
      res.status(404).json({ error: "Product not update" });
    }

    res.status(200).json(updateProduct);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/categories", async (req, res) => {
  const { name, imageUrl } = req.body;
  try {
    const category = new Categories({ name, imageUrl });
    await category.save();
    res.status(200).json({ message: "Category create successful." });
  } catch (error) {
    res.status(500).json({ error: "Category create error." });
  }
});

app.get("/api/categories", async (req, res) => {
  try {
    const category = await Categories.find();
    if (category.length != 0) {
      res.status(200).json({ message: "Fetch category", category });
    } else {
      res.status(400).json({ error: "Error fetch category" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

app.get("/api/categories/:categoryId", async (req, res) => {
  try {
    const category = await Categories.findById({ _id: req.params.categoryId });
    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ error: "Error to fetch category" });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const deleteCategory = await Category.findByIdAndDelete(req.params.id);
    if (!deleteCategory) {
      res.status(400).json({ error: "Category not found." });
    }
    res.status(200).json({ message: "Category delete successful" });
  } catch (error) {
    res.status(500).json({ error: "Server error while delete category" });
  }
});

app.post("/api/cart", async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne();

    if (cart) {
      let itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      await cart.save();
      const populateCart = await cart.populate("items.productId");
      res.status(200).json(populateCart);
    } else {
      const newCart = await Cart.create({ items: [{ productId, quantity }] });
      const populatedCart = await newCart.populate("items.productId");
      res.status(200).json(populatedCart);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/api/cart", async (req, res) => {
  try {
    const cart = await Cart.find().populate("items.productId").exec();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

app.delete("/api/cart/item/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const cart = await Cart.findOne();
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item.id !== id);

    await cart.save();

    res.status(200).json({ message: "Cart item delete successfully" });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

app.post("/api/wishlist", async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: "Wishlist item does not exist" });
  }

  try {
    const existing = await Wishlist.findOne({ productId });

    if (existing) {
      return res
        .status(200)
        .json({ message: "Product already in wishlist", wishlist: existing });
    }

    const wishlist = new Wishlist({ productId });
    await wishlist.save();
    res.status(200).json({ message: "Added item in wishlist cart", wishlist });
  } catch (error) {
    res.status(500).json({ error: "Failed add to item in wishlist" });
  }
});

app.get("/api/wishlist", async (req, res) => {
  try {
    const wishlist = await Wishlist.find().populate("productId").exec();
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch wishlist items" });
  }
});

app.delete("/api/wishlist/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const item = await Wishlist.findByIdAndDelete(id);
    if (!item) {
      res.status(400).json({ error: "Item does exist" });
    }

    res.status(200).json({ message: "Item delete successful." });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/country", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: "Country name is required" });
  }
  try {
    const existingCountry = await Country.findOne({ name });
    if (existingCountry) {
      res.status(404).json({ error: "Country already exist" });
    }

    const country = new Country({ name });
    await country.save();
    res.status(201).json({ message: "Country created successful" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/country", async (req, res) => {
  try {
    const country = await Country.find();
    res.status(201).json(country);
  } catch (error) {
    res.status(500).json({ error: `server error` });
  }
});

app.delete("/api/country/:id", async (req, res) => {
  try {
    const deleteCountry = await Country.findByIdAndDelete(req.params.id);
    if (!deleteCountry) {
      return res.status(404).json({ error: "Country not found" });
    }
    res.status(200).json({ message: "Country deleted", deleteCountry });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

app.post("/api/city", async (req, res) => {
  const { name, country } = req.body;
  if (!name || !country) {
    return res.status(404).json({ error: "City name and country required" });
  }
  try {
    const existCity = await City.findOne({ name, country });
    if (existCity) {
      res.status(404).json({ error: "City already exist" });
    }
    const city = new City({ name, country });
    await city.save();
    res.status(201).json({ message: "City created successful." });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/city/:id", async (req, res) => {
  try {
    const deleteCity = await City.findByIdAndDelete(req.params.id);
    if (deleteCity) {
      res.status(200).json({ message: "City delete successful" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/city", async (req, res) => {
  try {
    const city = await City.find().populate("country").exec();
    res.status(200).json(city);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/city/:countryId", async (req, res) => {
  const { countryId } = req.params;
  try {
    const cities = await City.find({ country: countryId });
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ error: "Server error while fetching cities." });
  }
});

app.post("/api/address", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    addresses,
    country,
    city,
    zipcode,
  } = req.body;
  try {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !addresses ||
      !country ||
      !city ||
      !zipcode
    ) {
      res.status(400).json({ error: "All fields are required" });
    }

    const address = new Address({
      firstName,
      lastName,
      email,
      phone,
      addresses,
      country,
      city,
      zipcode,
    });
    await address.save();
    res.status(200).json({ message: "Address created successful." });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

app.get("/api/address", async (req, res) => {
  try {
    const address = await Address.find().populate(["country", "city"]).exec();
    res.status(200).json(address);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

app.patch("/api/address/:id/edit", async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      res.status(404).json({ error: "Address ID is required" });
    }
    const updatedAddress = await Address.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedAddress) {
      res.status(400).json({ error: "Address not updated." });
    }
    res.status(200).json(updatedAddress);
  } catch (error) {
    res.status(500).json({ error: "Server error while updated address" });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
