var http = require("http");
var qString = require("querystring");
let dbManager = require('./dbManager');
let express = require("express");
let StoreSite = express();

// --- Helper Functions ---

/**
 * Renders the Home page (User Info Form). 
 */
function userInfoForm(res) {
    var page = `
    <html>
    <head>
        <title>THE BEST SHOE STORE IN THE WORLD</title>
    </head>
    <body>
        <form method="post">
            <h1>THE BEST SHOE STORE IN THE WORLD</h1>
            <nav>
                <a href="/men">Men</a> |
                <a href="/women">Women</a> |
                <a href="/kids">Kids</a> |
                <a href="/cart">Cart</a> |
                <a href="/wishlist">Wishlist</a> |
                <a href="/">Home</a> |
                <a href="/contact">Contact</a>
            </nav>
            Shoe Size <select name="shoeSize">
                <option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option><option>11</option><option>12</option><option>13</option><option>14</option><option>15</option>
            </select><br>
            <input type="submit" value="checkout">
            Name <input name="name"><br>
            Address <input name="address"><br>
            Zipcode <input name="zipcode"><br>
            Number <input name="number"><br>
            <section class="categories">
                <h2>Shop by Category</h2>
                <a href="/men">Men's Shoes</a> |
                <a href="/women">Women's Shoes</a> |
                <a href="/kids">Kids' Shoes</a>
            </section>
            <a href="/cart">Cart</a>
            <a href="/wishlist">Wishlist</a>
            <a href="/">Home</a>
            <a href="/add">Add</a>  <a href="/remove">Remove</a> <a href="/contact">Contact</a>
            <a href="/submit">Submit</a>  <input type="submit" value="Proceed to checkout">
            <input type="submit" value="Order">
        </form>
        <footer>
            <p>&copy; 2025 The Best Shoe Store in the World</p>
        </footer>
    </body>
    </html>
    `;
    res.end(page);
}

/**
 * Renders a category page (Men's, Women's, Kids').
 */
function renderCategoryPage(res, title) {
    var page = `
    <html>
    <head>
        <title>${title}</title>
    </head>
    <body>
        <form method="post">
            <h1>${title}</h1>
            <nav>
                <a href="/men">Men</a> |
                <a href="/women">Women</a> |
                <a href="/kids">Kids</a> |
                <a href="/cart">Cart</a> |
                <a href="/wishlist">Wishlist</a> |
                <a href="/">Home</a> |
                <a href="/contact">Contact</a>
            </nav>
            Shoe Size <select name="size">
                <option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option><option>11</option><option>12</option><option>13</option><option>14</option><option>15</option>
            </select><br>
            <footer>
                <p>&copy; 2025 The Best Shoe Store in the World</p>
            </footer>
        </form>
    </body>
    </html>
    `;
    res.end(page);
}

function renderMensPage(res) {
    renderCategoryPage(res, "MENS");
}

function renderWomensPage(res) {
    renderCategoryPage(res, "WOMENS");
}

function renderKidsPage(res) {
    renderCategoryPage(res, "KIDS");
}

/**
 * Handles search results.
 */
async function searchResp(result, response) {
    let page = `
    <html>
    <head>
        <title>Search Results</title>
    </head>
    <body>
        <h1>Search Results</h1>
        <nav>
            <a href="/men">Men</a> |
            <a href="/women">Women</a> |
            <a href="/kids">Kids</a> |
            <a href="/cart">Cart</a> |
            <a href="/wishlist">Wishlist</a> |
            <a href="/">Home</a> |
            <a href="/contact">Contact</a>
        </nav>
    `;

    if (result && result.data) { 
        page += `<h2>Results for ${result.prop}: ${result[result.prop]}</h2>`;
        try {
            await result.data.forEach((item) => {
                
                page += `<p>Shoe Name: ${item.name}, Price: $${item.price}</p>`; 
            });
        } catch (e) {
            page += `<p>Error: ${e.message}</p>`;
        }
    } else {
        page += `<p>No results found.</p>`; 
    }

    page += `
        <br><br><a href="/">Back to Home</a>
    </body>
    </html>
    `;
    response.end(page);
}



http.createServer(
    async (req, res) => {
        console.log(req.method);
        let baseURL = 'http://' + req.headers.host;
        var urlOBJ = new URL(req.url, baseURL);

        if (req.method == "POST") {
            var postData = '';
            req.on('data', (data) => {
                postData += data;
            });

            req.on('end', async () => {
                console.log(postData);
                let responseMessage = ''; 
                let proceed = true;
                var postParams = qString.parse(postData);

               
                for (property in postParams) {
                    if (postParams[property].toString().trim() == '') {
                        responseMessage = "Error! All Fields must have Data";
                        proceed = false;
                        break; 
                    }
                }
                if (proceed) {
                    let col = dbManager.get().collection("home");  

                    if (urlOBJ.pathname == "/cart/add") {
                        try {
                            //  Get parameters
                            const productId = postParams.productId;
                            const quantity = parseInt(postParams.quantity);
                            const userId = postParams.userId;  

                            
                            if (!productId || isNaN(quantity) || quantity <= 0) {
                                responseMessage = "Error: Invalid product ID or quantity";
                                proceed = false;
                            }
                            if (proceed) {
                                
                                const userId = 1;
                                const result = await col.updateOne( 
                                    { userId: userId, "items.productId": productId },  
                                    { $inc: { "items.$.quantity": quantity } },
                                    { upsert: true }  
                                );
                                if (result.modifiedCount > 0 || result.upsertedCount>0) {
                                      responseMessage = "Product added to cart";
                                }
                                else{
                                    responseMessage = "Could not add product to cart";
                                    proceed = false;
                                }
                                
                            }


                        } catch (err) {
                            responseMessage = "ERROR! Could not add product to cart";
                            console.error(err);
                            proceed = false;

                        } finally {
                            if (proceed) {
                                res.writeHead(302, {
                                    'Location': '/cart'
                                }); // redirect
                                res.end();
                            }
                            else{
                                res.writeHead(400, {
                                    'Content-Type': 'text/plain'
                                });
                                res.end(responseMessage); //send error message
                            }
                        }
                    } else if (urlOBJ.pathname == "/checkout") {
                        //handle checkout
                    } else if (urlOBJ.pathname == "/wishlist") {
                        //handle wishlist
                    } else if (urlOBJ.pathname == "/contact/submit") {
                       //handle contact form
                    } else if (urlOBJ.pathname == "/wishlist/add/:productID") {
                        //handle add to wishlist
                    } else if (urlOBJ.pathname == "/wishlist/remove/:productID") {
                       // handle remove from wishlist
                    } else {
                        res.writeHead(404);
                        res.end("<html><body><h1> ERROR 404. Page NOT FOUND</h1><br>");
                    }
                } else {
                    res.writeHead(400, {
                        'Content-Type': 'text/plain'
                    }); 
                    res.end(responseMessage); //send the error message
                }
            });
        } else { //GET section

            if (urlOBJ.pathname == "/home" || urlOBJ.pathname=="/") {
                //initial GET to insert returns
                userInfoForm(res);
            } else if (urlOBJ.pathname == "/womens") {

                renderWomensPage(res);
            } else if (urlOBJ.pathname == "/kids") {

                renderKidsPage(res);
            } else if (urlOBJ.pathname == "/cart/remove/:productID") {

                renderCartPage(res);
            } else if (urlOBJ.pathname == "/checkout/:productID") {

                userInfoForm(res); 
            } else if (urlOBJ.pathname == "/contact") {

                renderContactPage(res);
            } else {
                res.writeHead(404);
                res.end("<h1> ERROR 404. Page NOT FOUND</h1><br><br>");
            }
        }
    }).on('close', async () => { 
        console.log("Closing DB Connection");
        await dbManager.close();
    }).listen(3000, async () => {
        
        try {
            await dbManager.get("practiceDB");
        } catch (e) {
            console.log(e.message);
        }

        console.log("Server is running...");
    }); 