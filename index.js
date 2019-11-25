const express = require("express");
const mysql = require("mysql");
const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(express.json());
app.set("port", process.env.PORT || 8080);

const host = "localhost";
const user = "root";
const pswd = "123456789";
const dbname = "app_sec";

// config db ====================================
const pool = mysql.createPool({
  host: host,
  user: user,
  port: "3306",
  database: dbname
});

const COLUMNS = ["name", "post"];

app.get("/api/forum", (req, res) => {
  let queryString = `SELECT * from Forum`;

  pool.query(queryString, function(err, rows, fields) {
    if (err) throw err;

    if (rows.length > 0) {
      res.json(
        rows.map(entry => {
          const e = {};
          COLUMNS.forEach(c => {
            e[c] = entry[c];
          });
          return e;
        })
      );
    } else {
      res.json([]);
    }
  });
});

app.post("/api/forum", (req, res) => {
  let queryString = `insert into Forum values('${req.body.name}','${req.body.post}')`;
  pool.query(queryString, function(err, rows, fields) {
    if (err) throw err;

    res.json({ message: "successful" });
  });
});

app.post("/user/create", (req, res) => {
  if (req.body && req.body.password && req.body.password.length < 8) {
    res.status(401).send("Password length should be greater or equal to 8");
  } else {
    let queryString = `insert into Users values('${req.body.name}','${req.body.password}')`;
    pool.query(queryString, function(err, rows, fields) {
      if (err) return res.status(400).send("User already exists!");

      res.json({ message: "successful" });
    });
  }
});

app.post("/user/login", (req, res) => {
  let queryString = `select * from Users where name='${req.body.name}' and password='${req.body.password}'`;
  pool.query(queryString, function(err, rows, fields) {
    if (err) res.status(500).send("Something went wrong");
    else if (rows.length == 0)
      res.status(401).send("Invalid username or password");
    else res.json({ message: "successfully logged in" });
  });
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
