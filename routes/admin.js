const express = require('express')
const { pool } = require('../utils/db')

const router = express.Router()

router.get('/', (req, res, next) => {
    pool.execute("SELECT * FROM products;", (_, data) => {
        res.render("admin", { data: data })
    })
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

module.exports = router;