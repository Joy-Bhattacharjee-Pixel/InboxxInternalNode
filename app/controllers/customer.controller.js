const { check, validationResult } = require('express-validator');
// Importing crypto module
const cryptoAlgorithm = require('../commons/crypto.algo');
// Importing db
const db = require("../models");
// Importing customer module
const Customers = db.customers;
// Importing invoice module
const Invoices = db.invoices;
// Verify customer with email + password
exports.authCustomer = async (req, res) => {
    // Validation - email, password
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If some errors present
        res.status(400).json(errors);
    }
    try {
        // Creating search query
        const searchQuery = {
            email: req.body.email
        };
        // Finding out all the responses with this email + password combo
        const response = await Customers.findAll({ where: searchQuery });
        if (response.length == 0) {
            // No customer present with this email & password
            res.status(200).send(
                {
                    status: "Failed",
                    message: "No customer found with this email & password",
                    customer: null
                });
        }
        else {
            // Customer present with this email - let's check password
            const savedPassword = response[0].password;
            const decryptedPassword = cryptoAlgorithm.decrypt(savedPassword);
            if (decryptedPassword == req.body.password) {
                res.status(200).send({
                    status: "Success",
                    message: "Customer found with this email & password",
                    customer: response
                });
            }
            else {
                res.status(200).send({
                    status: "Failed",
                    message: "Please check the password",
                    customer: null
                })
            }
        }
    } catch (error) {
        res.status(500).send({
            status: "Failed",
            message: error.message || "We found some issue, please try again later",
            customer: null
        })
    }
}

// Create customer with credentials
exports.create = async (req, res) => {
    // Validation for every field
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If some errors present
        res.status(400).json(errors);
    }
    // Check if this email id is present in the invoice table or not
    let availableInvoices = await Invoices.findAll({ where: { billedToEmailID: req.body.email } });

    if (availableInvoices.length != 0) {
        // Invoices available regarding this email id
        // Encrypting the password
        let encryptedPassword = cryptoAlgorithm.encrypt(req.body.password);
        // Create customer object
        const customer = {
            email: req.body.email,
            password: encryptedPassword,
            name: req.body.name,
            phone: req.body.phone,
            address: req.body.address
        }
        try {
            // Creating customer object
            const response = await Customers.create(customer);
            res.status(200).send({
                status: "Success",
                message: "Customer created successfully",
                customer: response
            });
        } catch (error) {
            // Some error happens
            res.status(500).send(error.message || "We have faced some issues, please try again later");
        }
    }
    else {
        // No invoices available regarding this email id
        res.status(400).send({
            status: "Failed",
            message: "This email is is not available for registration, please contact admin",
            customer: null
        });
    }
}

// Fetch all customers available 
exports.allCustomers = async (req, res) => {
    try {
        const response = await Customers.findAll();
        res.send({ status: 1, message: "Customers found successfully", customers: response });
    } catch (error) {
        res.send({ status: 0, message: "No customers found", customers: [] })
    }
}

// Find one customer based on id
exports.findOne = async (req, res) => {
    if (!req.query.id) {
        // When customer id is null
        res.status(400).send({
            status: 0,
            message: "Customer id is required in the URL",
            customer: null
        });
    }
    // Customer id
    const id = req.query.id;
    try {
        // Finding customer based on id
        const resposne = await Customers.findByPk(id);
        res.send({
            status: 1,
            message: `Sent id ${req.query.id}`,
            customer: resposne
        });
    } catch (error) {
        res.status(500).send({
            status: 0,
            message: error.message || "We have faced some issue, please try again later",
            customer: null
        });
    }
}

// Update customer with the id and updated body
exports.update = async (req, res) => {
    if (!req.body.id) {
        // When customer id in body is null
        res.status(400).send({
            status: 0,
            message: "id in request body is required",
            customer: null
        });
    }
    // Customer id 
    const id = req.body.id;
    // Request body
    const body = req.body;
    try {
        const response = await Customers.update(body, { where: { id: id } });
        res.send({
            status: 1,
            message: "Customer updated successfully",
            customer: req.body
        });
    } catch (error) {
        res.status(500).send({
            status: 0,
            message: error.message || "We have faced some issue, please try again later",
            customer: null
        })
    }
}