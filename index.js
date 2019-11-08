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

const host = "ec2-54-213-58-16.us-west-2.compute.amazonaws.com";
const user = "root";
const pswd = "123456789";
const dbname = "app_sec";

// config db ====================================
const pool = mysql.createPool({
	host: host,
	user: user,
	password: pswd,
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

app.listen(app.get("port"), () => {
	console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
