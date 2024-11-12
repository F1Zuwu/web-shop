const express = require('express')
const { pool } = require('../utils/db')

const router = express.Router()

router.get('/', (req, res, next) => {
    pool.execute("SELECT * FROM products;", (_, data) => {
        pool.query('SELECT * FROM products ORDER BY id DESC LIMIT 2', (_, results) => {
            res.render("home", { data: data, latest: results })
        });
    })
})

router.get('/add-product', (req, res, next) => {
    res.render("add-products")
})

router.post('/add-product', (req, res, next) => {
    const query = 'INSERT INTO products (title, price, description, imageUrl) VALUES (?, ?, ?, ?)';
    pool.query(query, [req.body.title, req.body.price, req.body.description, req.body.imageUrl], (err, results) => {
        if (err) {
            return console.error('Error inserting data:', err.message);
        }
        console.log('Data inserted successfully, ID:', results.insertId);
        res.status(200)
    });
})

module.exports = router;