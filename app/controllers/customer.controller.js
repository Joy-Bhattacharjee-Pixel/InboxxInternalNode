const { check, validationResult } = require('express-validator');
// Importing crypto module
const cryptoAlgorithm = require('../commons/crypto.algo');
// Importing db
const db = require("../models");
const dbConfig = require("../configs/config")

// Importing customer module
const Customers = db.customers;
// Importing invoice module
const Invoices = db.invoices;

const path = require('path');

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
                    status: 0,
                    message: "No customer found with this email & password",
                    customer: null
                });
        }
        else {
            // Customer present with this email - let's check password
            const savedPassword = response[0].password;
            const decryptedPassword = cryptoAlgorithm.decrypt(savedPassword);
            if (decryptedPassword == req.body.password) {
                let customerObject = response[0];
                if (customerObject.image != null && customerObject.image != "") {
                    let image = customerObject.image;

                    let baseUrl = "";
                    if (dbConfig.HOST == "localhost") {
                        baseUrl = "http://localhost:8081";
                    }
                    else {
                        baseUrl = "http://142.93.209.188:8045";
                    }
                    image = baseUrl + "/api/v1/file/uploads/" + image
                    customerObject.image = image;
                }
                res.status(200).send({
                    status: 1,
                    message: "Customer found with this email & password",
                    customer: customerObject
                });
            }
            else {
                res.status(200).send({
                    status: 0,
                    message: "Please check the password",
                    customer: null
                })
            }
        }
    } catch (error) {
        res.status(500).send({
            status: 0,
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
    // Check if this email address & phone is already present in the customer table or not
    let availableCustomersWithEmail = await Customers.findAll({ where: { email: req.body.email } });
    let availableCustomersWithPhone = await Customers.findAll({ where: { email: req.body.phone } });

    if (availableCustomersWithEmail.length == 0 && availableCustomersWithPhone.length == 0) {
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
                    status: 1,
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
            res.status(200).send({
                status: 0,
                message: "This email is is not available for registration, please contact admin",
                customer: null
            });
        }
    }
    else {
        res.send({
            status: 0,
            message: "This email id or phone number is already registered",
            customer: null
        })
    }
}

// Fetch all customers available 
exports.allCustomers = async (req, res) => {
    try {
        const response = await Customers.findAll();
        if (req.query.keyword != null) {
            let searchedCustomers = [];
            response.forEach(customer => {
                if (customer.email.toLowerCase().includes(req.query.keyword.toLowerCase())) {
                    searchedCustomers.push(customer);
                }
            });
            res.send({ status: 1, message: "Customers found successfully", customers: searchedCustomers });
        } else {
            res.send({ status: 1, message: "Customers found successfully", customers: response });
        }
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
        let customerObject = resposne;

        if (resposne.image != null) {
            let image = customerObject.image;
            let baseUrl = "";
            if (dbConfig.HOST == "localhost") {
                baseUrl = "http://localhost:8081";
            }
            else {
                baseUrl = "http://142.93.209.188:8045";
            }
            image = baseUrl + "/api/v1/file/uploads/" + image
            customerObject.image = image;
        }

        res.send({
            status: 1,
            message: `Sent id ${req.query.id}`,
            customer: customerObject
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

/* add push token or device id to customer table */
exports.addPushToken = async (req, res) => {
    /* validation for every expected field */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If some errors present
        res.status(400).json(errors);
    }
    /* request body */
    const body = req.body;
    /* update body */
    const updateBody = {
        pushToken: body.token
    }
    try {
        /* updating push token to customer table in push token column */
        await Customers.update(updateBody, { where: { id: body.customerId } });
        res.send({
            status: 1,
            message: "push token updated",
            token: req.body.token
        });
    } catch (error) {
        res.send({
            status: 0,
            message: error.message,
            token: null
        })
    }
}

/* delete push token or device id from customer table */
exports.removePushToken = async (req, res) => {
    /* validation for every expected field */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If some errors present
        res.status(400).json(errors);
    }
    /* request body */
    const body = req.body;
    /* update body */
    const updateBody = {
        pushToken: null
    }
    try {
        /* updating push token to customer table in push token column */
        await Customers.update(updateBody, { where: { id: body.customerId } });
        res.send({
            status: 1,
            message: "push token removed",
            token: req.body.customerId
        });
    } catch (error) {
        res.send({
            status: 0,
            message: error.message,
            token: null
        })
    }
}

/* update profile image */
exports.updateProfileImage = async (req, res) => {
    if (!req.file) {
        res.status(400).send({ message: "Customer image is required" });
    }
    if (!req.body.customerId) {
        res.status(400).send({ message: "Customer Id is required" });
    }
    try {
        /* uploaded file path */
        const filePath = path.resolve(path.dirname('')) + "/resources/static/assets/uploads/" + req.file.filename;
        /* uploading image path to the customer table */
        await Customers.update({ image: req.file.filename }, { where: { id: req.body.customerId } });
        res.send({
            status: 1,
            message: "Image uploaded successfully",
            file: req.file.filename
        });
    } catch (error) {
        res.send({
            status: 0,
            message: error.message || "Error",
            file: null
        });
    }
}
