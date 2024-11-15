const express = require('express')
const { pool } = require('../utils/db')

const router = express.Router()

router.get('/login', (req, res, next) => {
    res.render("Login/Login")
})

router.get('/register', (req, res, next) => {
    res.render("Login/Register")
})

module.exports = router;