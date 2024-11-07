const express = require('express')

const router = express.Router()

router.get('/' , (req, res , next) => {
    res.send('<b>Web Shop page</b>')
})

module.exports = router;