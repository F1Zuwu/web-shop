const mysql = require("mysql2")

var pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "qwerty",
    database: "epood"
});

module.exports = pool.promise();