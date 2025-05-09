// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('practiceDB');

// Create a new document in the collection.
db.getCollection('products').insertOne({
    "name": "Asics",
    "price": 81.24,
    "category": "men",
    "image": "asics-gel-1130-black-silver.JPG"
});

db.getCollection('products').insertOne({
    "name": "Coach",
    "price": 89.00,
    "category": "men",
    "image": "coa-ch.JPG"
});

db.getCollection('products').insertOne({
    "name": "CoachOulet",
    "price": 139.00,
    "category": "men",
    "image": "coach-outlet-sport-sneaker-mens.JPG"
});

db.getCollection('products').insertOne({
    "name": "CoachWomen",
    "price": 129.00,
    "category": "women",
    "image": "coach-w.jpg"
});

db.getCollection('products').insertOne({
    "name": "Court",
    "price": 100.00,
    "category": "kids",
    "image": "court-k.JPG"
});

db.getCollection('products').insertOne({
    "name": "Dior",
    "price": 790.00,
    "category": "women",
    "image": "dior-w.jpg"
});

db.getCollection('products').insertOne({
    "name": "Gucci",
    "price": 750.00,
    "category": "women",
    "image": "gucci-w.jpg"
});

db.getCollection('products').insertOne({
    "name": "Jordan1",
    "price": 55.00,
    "category": "kids",
    "image": "jordan-k-1.jpg"
});

db.getCollection('products').insertOne({
    "name": "Jordan2",
    "price": 87.00,
    "category": "kids",
    "image": "jordan-k.jpg"
});

db.getCollection('products').insertOne({
    "name": "News",
    "price": 69.99,
    "category": "kids",
    "image": "new-k.jpg"
});

db.getCollection('products').insertOne({
    "name": "Puma",
    "price": 49.99,
    "category": "kids",
    "image": "puma-k.jpg"
});

db.getCollection('products').insertOne({
    "name": "saucony",
    "price": 60.00,
    "category": "kids",
    "image": "saucony-k.jpg"
});

db.getCollection('products').insertOne({
    "name": "Shoes",
    "price": 23.99,
    "category": "kids",
    "image": "shoe-k-1.jpg"
});

db.getCollection('products').insertOne({
    "name": "Timbs",
    "price": 198.00,
    "category": "men",
    "image": "timb-s.JPG"
});

db.getCollection('products').insertOne({
    "name": "Valentino",
    "price": 1450.00,
    "category": "women",
    "image": "valentinow.jpg"
});
