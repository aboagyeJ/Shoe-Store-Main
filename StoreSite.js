const http = require("http"); 
const qString = require("querystring"); 
const dbManager = require('./dbManager');
const express = require("express");
const app = express();
const ObjectID = require('mongodb').ObjectId;

// --- Middleware ---
app.use(express.urlencoded({ extended: false })); 
app.use(express.json()); 

// --- View Engine Setup (Assuming Pug) ---
app.set('views', './views');
app.set('view engine', 'pug');

// --- Helper Functions (Adapt or Replace with Database Interactions) ---

async function getProductById(productId) {
    try {
        const productsCollection = dbManager.get().collection("products");
        return await productsCollection.findOne({ _id: ObjectID(productId) });
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
}



// Homepage
app.get('/', async (req, res) => {
    try {
        const productsCollection = dbManager.get().collection("products");
        const products = await productsCollection.find({}).limit(20).toArray(); 
        res.render('index', { products: products }); 
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Error loading homepage.");
    }
});

// Product Category Pages
app.get('/men', async (req, res) => {
    try {
        const productsCollection = dbManager.get().collection("products");
        const products = await productsCollection.find({ category: 'men' }).toArray();
        res.render('category', { title: 'Men\'s Shoes', products: products }); 
    } catch (error) {
        console.error("Error fetching men's shoes:", error);
        res.status(500).send("Error loading men's shoes.");
    }
});

app.get('/women', async (req, res) => {
    try {
        const productsCollection = dbManager.get().collection("products");
        const products = await productsCollection.find({ category: 'women' }).toArray();
        res.render('category', { title: 'Women\'s Shoes', products: products }); // Use the same category.pug
    } catch (error) {
        console.error("Error fetching women's shoes:", error);
        res.status(500).send("Error loading women's shoes.");
    }
});

app.get('/kids', async (req, res) => {
    try {
        const productsCollection = dbManager.get().collection("products");
        const products = await productsCollection.find({ category: 'kids' }).toArray();
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
        res.render('product-detail', { product: product }); 
    } else {
        res.status(404).send("Product not found.");
    }
});

// Shopping Cart
app.get('/cart', async (req, res) => {
    
    res.render('cart', { cartItems: [] }); 
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
        const cartsCollection = dbManager.get().collection("carts"); 
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
        const cartsCollection = dbManager.get().collection("carts");
        
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
    
    res.render('wishlist', { wishlistItems: [] }); // Create a wishlist.pug file
});

// Add to Wishlist
app.post('/wishlist/add/:productId', async (req, res) => {
    const productId = req.params.productId;
    let userId = req.session.productId;

    if (!userId) {
        return res.status(401).send("User not authenticated.");
    }

    try {
        const wishlistCollection = dbManager.get().collection("wishlist"); 
        
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
        const wishlistCollection = dbManager.get().collection("wishlist");
        
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
            const productsCollection = dbManager.get().collection("products");
            
            const results = await productsCollection.find({ name: { $regex: query, $options: 'i' } }).toArray();
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