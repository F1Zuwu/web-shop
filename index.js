const express = require('express')
const bodyParser = require('body-parser')
const path = require(path)
const app = express()

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')))

const db = require('./utils/db')

db.execute('SHOW DATABASES')
    .then(result => {
        console.log(result)
    })
    .catch(error => {
        console.log(error)
    })

const adminRoutes = require('./routes/admin')
const shopRoutes = require('./routes/shop')

app.use(bodyParser.urlencoded({extended: true}))

app.use('/admin', adminRoutes)
app.use(shopRoutes)

app.use((req,res,next) => {
    res.status(404).send('<b>Page not found, give up lmao</b>')
})

app.listen(3000, () => {
    console.log("👍")
})