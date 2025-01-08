const express = require('express')
const { pool } = require('../utils/db')

const router = express.Router()

router.get('/', (req, res, next) => {
    pool.execute("SELECT * FROM products;", (_, data) => {
        res.render("admin", { data: data })
    })
})

router.post('/add-product', (req, res, next) => {
    const query = 'INSERT INTO products (title, price, description, imageUrl) VALUES (?, ?, ?, ?)';
    pool.query(query, [req.body.title, req.body.price, req.body.description, req.body.imageUrl], (err, results) => {
        if (err) {
            return console.error('Error inserting data:', err.message);
        }
        console.log('Data inserted successfully, ID:', results.insertId);
        res.status(200).redirect("/admin/");
    });
})

router.get('/edit/:id', (req, res, next) => {
    const productId = req.params.id;
    const query = 'SELECT * FROM products WHERE id = ?';

    pool.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error retrieving product:', err);
            return res.status(500).json({ error: 'Failed to retrieve product' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.render("edit", {data: results[0]})
    });
})

router.post('/edit/:id', (req, res, next) => {
    const productId = req.params.id;
    const { title, price, description, imageUrl } = req.body

    const query = 'UPDATE products SET title = ?, price = ?, description = ?, imageUrl = ? WHERE id = ?';

    pool.query(query, [title, price, description, imageUrl, productId], (err, result) => {
        if (err) {
            console.error('Error updating product:', err);
            return res.status(500).json({ error: 'Failed to update product' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).redirect("/admin/");
    });
})

router.get('/add-product', (req, res, next) => {
    res.render("add-products")
})

router.delete('/delete/:id', (req, res, next) => {
    const productId = req.params.id;

    const query = 'DELETE FROM products WHERE id = ?';

    pool.query(query, [productId], (err, result) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Failed to delete product' });
        }

        if (result.affectedRows > 0) {
            res.status(200).json({ message: `Product with ID ${productId} deleted successfully.` });
        } else {
            res.status(404).json({ message: `Product with ID ${productId} not found.` });
        }
    });
})

router.get("/orders/:id" ,(req,res) => {
    pool.execute("SELECT * FROM orders WHERE user_id = ?", [req.params.id] , (_, data) => {
        console.log(data)
        res.render("admin/orders", { data: data })
    })
})

module.exports = router;