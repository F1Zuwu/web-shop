const express = require('express')

const router = express.Router()

router.get('/' , (req, res , next) => {
    res.send('<b>Admin page</b>')
})

module.exports = router;