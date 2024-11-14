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
        res.render("products", { data: data})
    })
})

router.get('/cart', (req, res, next) => {
    const query = `
        SELECT p.id, p.title, p.price, ci.quantity 
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
    `;

    pool.query(query, (err, results) => {

        if (err) {
            console.error('Error retrieving cart items:', err);
            return res.status(500).json({ error: 'Failed to retrieve cart items' });
        }

        const total = results.reduce((sum, item) => sum + item.price * item.quantity, 0);
        res.render("cart", {items: results, total: total.toFixed(2)})
    });
})

router.post('/cart/add/:productId/:quantity', (req, res) => {

    const { productId, quantity } = req.params;
    console.log(req.params)

    const findProductQuery = 'SELECT * FROM cart_items WHERE product_id = ?';
    pool.query(findProductQuery, [productId], (err, results) => {
        if (err) {
            console.error('Error checking product in cart:', err);
            return res.status(500).json({ error: 'Failed to check product' });
        }

        if (results.length > 0) {
            const updateQuantityQuery = 'UPDATE cart_items SET quantity = quantity + ? WHERE product_id = ?';
            pool.query(updateQuantityQuery, [quantity, productId], (err) => {
                if (err) {
                    console.error('Error updating product quantity:', err);
                    return res.status(500).json({ error: 'Failed to update quantity' });
                }
                res.status(200).json({ message: 'Product quantity updated successfully.' });
            });
        } else {
            const addProductQuery = 'INSERT INTO cart_items (product_id, quantity) VALUES (?, ?)';
            pool.query(addProductQuery, [productId, quantity], (err) => {
                if (err) {
                    console.error('Error adding product to cart:', err);
                    return res.status(500).json({ error: 'Failed to add product' });
                }
                res.status(200).json({ message: 'Product added to cart successfully.' });
            });
        }
    });
});

router.delete('/cart/clear', (req, res) => {
    const clearQuery = 'DELETE FROM cart_items';
    
    pool.query(clearQuery, (err) => {
        if (err) {
            console.error('Error clearing cart:', err);
            return res.status(500).json({ error: 'Failed to clear cart' });
        }

        res.status(200).json({ message: 'Cart cleared successfully.' });
    });
});

router.delete('/cart/remove/:productId', (req, res) => {
    const productId = req.params.productId;

    const deleteQuery = 'DELETE FROM cart_items WHERE product_id = ?';
    pool.query(deleteQuery, [productId], (err, result) => {
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

module.exports = router;