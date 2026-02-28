import mysql from "mysql2";

export const db = mysql.createPool({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'todo',
	waitForConnections: true, 
	connectionLimit: 10,
	queueLimit: 0
}).promise();