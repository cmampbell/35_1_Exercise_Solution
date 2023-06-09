/** Database for lunchly */

const pg = require("pg");
require("dotenv").config();

let DB_URI = (process.env.NODE_ENV === 'test') 
        ? `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/lunchly_test` : `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/lunchly`;

const db = new pg.Client({connectionString: DB_URI})

db.connect();

module.exports = db;
