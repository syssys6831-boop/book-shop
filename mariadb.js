const mariadb = require("mysql2");

const connection = mariadb.createConnection({
  host: "localhost",
  user: "root",
  password: "1q2w3e4r",
  database: "Bookshop",
  dateStrings: true,
});

module.exports = connection;
