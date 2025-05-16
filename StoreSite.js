require('dotenv').config();
const http = require("http");
const qString = require("querystring");
const dbManager = require('./dbManager');
const express = require("express");
const app = express();
const ObjectID = require('mongodb').ObjectId;
const path = require('path'); // Import the 'path' module

// --- Middleware ---
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// --- Session Middleware ---
const session = require('express-session');
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } 
}));

// --- View Engine Setup (Assuming Pug) ---
app.set('views', './views');
app.set('view engine', 'pug');

// --- Helper Functions (Adapt or Replace with Database Interactions) ---

async function getProductById(productId) {
    try {
        const db = await dbManager.get("practiceDB");
        const productsCollection = db.collection("products");
        return await productsCollection.findOne({ _id: ObjectID(productId) });
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}

// Homepage
app.get('/', async (req, res) => {
    try {
        const db = await dbManager.get("practiceDB");
        const productsCollection = db.collection("products");
        const products = await productsCollection.find({}).limit(20).toArray();
        console.log("Products for /:", products); // ADDED
        res.render('index', { products: products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Error loading homepage.");
    }
});

// Product Category Pages
app.get('/men', async (req, res) => {
    try {
        const db = await dbManager.get("practiceDB");
        const productsCollection = db.collection("products");
        const products = await productsCollection.find({ category: 'men' }).toArray();
        console.log("Products for /men:", products); // ADDED
        res.render('category', { title: 'Men\'s Shoes', products: products });
    } catch (error) {
        console.error("Error fetching men's shoes:", error);
        res.status(500).send("Error loading men's shoes.");
    }
});

app.get('/women', async (req, res) => {
    try {
        const db = await dbManager.get("practiceDB");
        const productsCollection = db.collection("products");
        const products = await productsCollection.find({ category: 'women' }).toArray();
        console.log("Products for /women:", products); // ADDED
        res.render('category', { title: 'Women\'s Shoes', products: products }); // Use the same category.pug
    } catch (error) {
        console.error("Error fetching women's shoes:", error);
        res.status(500).send("Error loading women's shoes.");
    }
});

app.get('/kids', async (req, res) => {
    try {
        const db = await dbManager.get("practiceDB");
        const productsCollection = db.collection("products");
        const products = await productsCollection.find({ category: 'kids' }).toArray();
        console.log("Products for /kids:", products); // ADDED
        res.render('category', { title: 'Kids\' Shoes', products: products }); // Use the same category.pug
    } catch (error) {
        console.error("Error fetching kids' shoes:", error);
        res.status(500).send("Error loading kids' shoes.");
    }
});

// Product Detail Page
app.get('/product/:productId', async (req, res) => {
    const productId = req.params.productId;
    const product = await getProductById(productId);
    if (product) {
        console.log("Product details:", product); // ADDED
        res.render('product-detail', { product: product });
    } else {
        res.status(404).send("Product not found.");
    }
});

// Shopping Cart
app.get('/cart', async (req, res) => {
    let userId = req.session.productId;
    let cartItems = [];

    if (userId) {
        try {
            const db = await dbManager.get("practiceDB");
            const cartsCollection = db.collection("carts");
            const productsCollection = db.collection("products");
            const userCart = await cartsCollection.findOne({ userId: userId });

            if (userCart && userCart.items && userCart.items.length > 0) {
                for (const item of userCart.items) {
                    const product = await productsCollection.findOne({ _id: ObjectID(item.productId) });
                    if (product) {
                        cartItems.push({ product: product, quantity: item.quantity });
                    }
                }
            }
            console.log("Cart items:", cartItems); // ADDED
        } catch (error) {
            console.error("Error fetching cart:", error);
            res.status(500).send("Error loading cart.");
        }
    }
    res.render('cart', { cartItems: cartItems });
});

// Add to Cart
app.post('/cart/add', async (req, res) => {
    const { productId, quantity } = req.body;
    let userId = req.session.productId;

    if (!userId) {
        return res.status(401).send("User not authenticated.");
    }

    if (!productId || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
        return res.status(400).send("Invalid product ID or quantity.");
    }

    try {
        const db = await dbManager.get("practiceDB");
        const cartsCollection = db.collection("carts");
        const quantityToAdd = parseInt(quantity);

        const result = await cartsCollection.updateOne(
            { userId: userId, "items.productId": productId },
            { $inc: { "items.$.quantity": quantityToAdd } },
            { upsert: true }
        );

        console.log("Cart update result:", result);
        res.redirect('/cart');
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).send("Error adding item to cart.");
    }
});

// Remove from Cart
app.get('/cart/remove/:productId', async (req, res) => {
    const productId = req.params.productId;
    let userId = req.session.productId;

    if (!userId) {
        return res.status(401).send("User not authenticated.");
    }

    try {
        const db = await dbManager.get("practiceDB");
        const cartsCollection = db.collection("carts");

        const result = await cartsCollection.updateOne(
            { userId: userId },
            { $pull: { items: { productId: productId } } }
        );

        console.log("Remove from cart result:", result);
        res.redirect('/cart');
    } catch (error) {
        console.error("Error removing from cart:", error);
        res.status(500).send("Error removing item from cart.");
    }
});

// Wishlist
app.get('/wishlist', async (req, res) => {
    let userId = req.session.productId;
    let wishlistItems = [];

    if (userId) {
        try {
            const db = await dbManager.get("practiceDB");
            const wishlistCollection = db.collection("wishlist");
            const productsCollection = db.collection("products");
            const userWishlist = await wishlistCollection.findOne({ userId: userId });

            if (userWishlist && userWishlist.productIds && userWishlist.productIds.length > 0) {
                const productDetails = await productsCollection.find({ _id: { $in: userWishlist.productIds.map(id => ObjectID(id)) } }).toArray();
                wishlistItems = productDetails.map(product => ({ product: product }));
            }
            console.log("Wishlist items:", wishlistItems); // ADDED
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            res.status(500).send("Error loading wishlist.");
        }
    }
    res.render('wishlist', { wishlistItems: wishlistItems });
});

// Add to Wishlist
app.post('/wishlist/add/:productId', async (req, res) => {
    const productId = req.params.productId;
    let userId = req.session.productId;

    if (!userId) {
        return res.status(401).send("User not authenticated.");
    }

    try {
        const db = await dbManager.get("practiceDB");
        const wishlistCollection = db.collection("wishlist");

        const result = await wishlistCollection.updateOne(
            { userId: userId },
            { $addToSet: { productIds: productId } },
            { upsert: true }
        );

        console.log("Add to wishlist result:", result);
        res.redirect('/wishlist');
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        res.status(500).send("Error adding item to wishlist.");
    }
});

// Remove from Wishlist
app.get('/wishlist/remove/:productId', async (req, res) => {
    const productId = req.params.productId;
    let userId = req.session.productId;

    if (!userId) {
        return res.status(401).send("User not authenticated.");
    }

    try {
        const db = await dbManager.get("practiceDB");
        const wishlistCollection = db.collection("wishlist");

        const result = await wishlistCollection.updateOne(
            { userId: userId },
            { $pull: { productIds: productId } }
        );

        console.log("Remove from wishlist result:", result);
        res.redirect('/wishlist');
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        res.status(500).send("Error removing item from wishlist.");
    }
});

// Contact Page
app.get('/contact', (req, res) => {
    res.render('contact');
});

// Handle Contact Form Submission
app.post('/contact/submit', async (req, res) => {
    const { name, email, message } = req.body;

    console.log("Contact form submitted:", { name, email, message });
    res.send("Thank you for your message!");
});

// Search Functionality
app.get('/search', async (req, res) => {
    res.render('search');
});

app.post('/search', async (req, res) => {
    const { query } = req.body;
    if (query) {
        try {
            const db = await dbManager.get("practiceDB");
            const productsCollection = db.collection("products");

            const results = await productsCollection.find({ name: { $regex: query, $options: 'i' } }).toArray();
            console.log("Search results:", results); // ADDED
            res.render('search-results', { query: query, results: results });
        } catch (error) {
            console.error("Search error:", error);
            res.status(500).send("Error during search.");
        }
    } else {
        res.render('search-results', { query: '', results: [] });
    }
});

// --- Error Handling (Basic) ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// --- Start the server ---
const port = 6900;
app.listen(port, async () => {
    try {
        await dbManager.get("practiceDB");
        console.log(`Server is running on http://localhost:${port}`);
    } catch (error) {
        console.error("Database connection error:", error.message);
    }
});
