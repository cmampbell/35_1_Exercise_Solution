/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
  }

  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    return results.rows.map(c => new Customer(c));
  }

  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }

  fullName() {
    return this.firstName + " " + this.lastName
  }

  static async findIdByName(name) {
    const nameSplit = name.split(' ');
    const firstName = nameSplit[0];
    const lastName = nameSplit[1];

    let customer;

    if (firstName && lastName) {
      const results = await db.query(`
            SELECT id FROM customers
            WHERE first_name = $1 AND last_name = $2
            `, [firstName, lastName])
      customer = results.rows[0]
    } else if (firstName) {
      const results = await db.query(`
            SELECT id FROM customers
            WHERE first_name = $1
            `, [firstName])
      customer = results.rows[0]
    } else {
      const err = new Error('Please provide a first and last name')
      err.status = 404;
      throw err
    }
    if (customer === undefined) {
      const err = new Error("Not Found");
      err.status = 404;
      throw err
    }

    return customer.id
  }

  static async retrieveTopTenCustomers() {

    const results = await db.query(`
    SELECT c.id, first_name as "firstName", last_name as "lastName", phone, c.notes as notes, COUNT(r.customer_id) as reservations FROM customers AS c
    LEFT JOIN reservations AS r ON c.id = r.customer_id
    GROUP BY c.id, first_name, last_name, phone, c.notes, r.customer_id
    ORDER BY reservations desc LIMIT 10`);
    console.log(results.rows)

    return results.rows.map(c => new Customer(c))
  }
}

module.exports = Customer;
