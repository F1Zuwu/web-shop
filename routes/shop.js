const express = require('express')
const { pool } = require('../utils/db')

const router = express.Router()

router.get('/', (req, res, next) => {
    pool.execute("SELECT * FROM products;", (_, data) => {
        pool.query('SELECT * FROM products ORDER BY id DESC LIMIT 3', (_, results) => {
            res.render("home", { data: data, latest: results })
        });
    })
})

router.get('/products', (req, res, next) => {
    pool.execute("SELECT * FROM products;", (_, data) => {
        res.render("products", { data: data })
    })
})

router.get('/cart/:id', (req, res, next) => {
    const userId = req.params.id

    const query = `
        SELECT p.id, p.title, p.price, ci.quantity 
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.user_id = ?
    `;

    pool.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error retrieving cart items:', err);
            return res.status(500).json({ error: 'Failed to retrieve cart items' });
        }

        const total = results.reduce((sum, item) => sum + item.price * item.quantity, 0);
        res.render("cart", { items: results, total: total.toFixed(2) });
    });
})

router.post('/cart/add/:productId/:quantity/:id', (req, res) => {

    const { productId, quantity } = req.params;
    const userId = req.params.id // Retrieve user_id from the request body

    const findProductQuery = 'SELECT * FROM cart_items WHERE product_id = ? AND user_id = ?';
    pool.query(findProductQuery, [productId, userId], (err, results) => {
        if (err) {
            console.error('Error checking product in cart:', err);
            return res.status(500).json({ error: 'Failed to check product' });
        }

        if (results.length > 0) {
            const updateQuantityQuery = 'UPDATE cart_items SET quantity = quantity + ? WHERE product_id = ? AND user_id = ?';
            pool.query(updateQuantityQuery, [quantity, productId, userId], (err) => {
                if (err) {
                    console.error('Error updating product quantity:', err);
                    return res.status(500).json({ error: 'Failed to update quantity' });
                }
                res.status(200).json({ message: 'Product quantity updated successfully.' });
            });
        } else {
            const addProductQuery = 'INSERT INTO cart_items (product_id, quantity, user_id) VALUES (?, ?, ?)';
            pool.query(addProductQuery, [productId, quantity, userId], (err) => {
                if (err) {
                    console.error('Error adding product to cart:', err);
                    return res.status(500).json({ error: 'Failed to add product' });
                }
                res.status(200).json({ message: 'Product added to cart successfully.' });
            });
        }
    });
});

router.delete('/cart/clear/:id', (req, res) => {
    const userId = req.params.id // Retrieve user_id from the request body

    const clearQuery = 'DELETE FROM cart_items WHERE user_id = ?';

    pool.query(clearQuery, [userId], (err) => {
        if (err) {
            console.error('Error clearing cart:', err);
            return res.status(500).json({ error: 'Failed to clear cart' });
        }

        res.status(200).json({ message: 'Cart cleared successfully.' });
    });
});

router.delete('/cart/remove/:productId/:id', (req, res) => {
    const productId = req.params.productId;
    const userId = req.params.id // Retrieve user_id from the request body

    const deleteQuery = 'DELETE FROM cart_items WHERE product_id = ? AND user_id = ?';
    pool.query(deleteQuery, [productId, userId], (err, result) => {
        if (err) {
            console.error('Error deleting product from cart:', err);
            return res.status(500).json({ error: 'Failed to delete product' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: `Product with ID ${productId} removed from cart.` });
        } else {
            res.status(404).json({ message: `Product with ID ${productId} not found in cart.` });
        }
    });
});

router.post('/orders', (req, res) => {

    const user_id = req.body.user
    const items = JSON.parse(req.body.items)

    console.log(user_id)
    console.log(items)

    if (!user_id || !items || items.length === 0) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    // Calculate the total amount for the order
    const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Step 1: Insert a new order
    const createOrderQuery = 'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)';
    pool.query(createOrderQuery, [user_id, totalAmount], (err, result) => {
        if (err) {
            console.error('Error creating order:', err);
            return res.status(500).json({ error: 'Failed to create order' });
        }

        const orderId = result.insertId;

        // Step 2: Insert each item into the order_items table
        const orderItemsQuery = 'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?';
        const orderItemsData = items.map(item => [orderId, item.id, item.quantity, item.price]);

        pool.query(orderItemsQuery, [orderItemsData], (err) => {
            if (err) {
                console.error('Error inserting order items:', err);
                return res.status(500).json({ error: 'Failed to insert order items' });
            }

            res.status(201).json({ message: 'Order created successfully', orderId });
        });
    });
})


module.exports = router;