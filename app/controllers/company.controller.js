const { check, validationResult } = require('express-validator');
// Importing db
const db = require("../models");
// Importing company module
const Companies = db.companies;
const PaymentKeys = db.paymentKeys;

// Importing crypto module
const cryptoAlgorithm = require('../commons/crypto.algo');

// Authentication of company login using email & password
exports.authentication = async (req, res) => {
    // Validation - email, password
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If some errors present
        res.status(400).json(errors);
    }
    // Setting up the query object
    const queryObject = {
        email: req.body.email
    };
    try {
        // Find out all the companies associated with this email & password
        const availableCompanies = await Companies.findAll({ where: queryObject });
        if (availableCompanies.length == 0) {
            // No companies found
            res.status(200).send({
                status: 0,
                message: "Credentials are not matching, please try again",
                company: null
            });
        }
        else {
            // Companies present with this email - let's check password
            const savedPassword = availableCompanies[0].password;
            const decryptedPassword = cryptoAlgorithm.decrypt(savedPassword);
            if (decryptedPassword == req.body.password) {
                if (availableCompanies[0]["verificationPending"] == 1) {
                    res.status(200).send({
                        status: 0,
                        message: "Company verification pending, please wait or contact admin",
                        company: null
                    });
                } else {
                    res.status(200).send({
                        status: 1,
                        message: "Company found with this email & password",
                        company: availableCompanies[0]
                    });
                }
            }
            else {
                res.status(200).send({
                    status: 0,
                    message: "Credentials are not matching, please try again",
                    company: null
                })
            }
        }
    } catch (error) {
        res.status(500).send({
            status: 0,
            message: error.message || "We faced some issue, please try again later",
            company: null
        });
    }
}

// Registering new company with the credentials
exports.create = async (req, res) => {
    // Validation - email, password
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If some errors present
        res.status(400).json(errors);
    }
    // Encrypting the password
    const encryptedPassword = cryptoAlgorithm.encrypt(req.body.password);
    // Setting up the company object
    const companyObject = {
        name: req.body.name,
        role: req.body.role,
        email: req.body.email,
        password: encryptedPassword,
        address: req.body.address,
        state: req.body.state,
        zip: req.body.zip,
        country: req.body.country,
        city: req.body.city,
        phoneNumber: req.body.phoneNumber
    }
    try {
        // Creating new company 
        const response = await Companies.create(companyObject);
        /* Creating payment methods for this company */
        await PaymentKeys.create({ companyId: response.id })
        if (response) {
            // Company created successfully
            res.status(200).send({
                status: 1,
                message: "Company created successfully",
                company: response
            });
        }
        else {
            // Company not created
            res.status(200).send({
                status: 0,
                message: "We faced some issue, please try again later",
                company: null
            })
        }
    } catch (error) {
        res.send({
            status: 0,
            message: error.message || "We faced some issue, please try again later",
            company: null
        })
    }
}

// Find all company list
exports.findAll = async (req, res) => {
    try {
        const response = await Companies.findAll({ where: { role: "Company" } });
        res.send({
            status: 1,
            message: "Companies found",
            companies: response
        });
    } catch (error) {
        res.send({
            status: 0,
            message: error.message || "We have found some issue, please try again later",
            companies: []
        })
    }
}

// Update company 
exports.update = async (req, res) => {
    // Validation - email, password
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If some errors present
        res.status(400).json(errors);
    }
    // Updated object
    const body = req.body;
    try {
        const response = await Companies.update(body, { where: { id: req.body.id } });
        res.send({ status: 1, message: "Company updated successfully", company: body });
    } catch (error) {
        res.send({ status: 0, message: error.message || "We faced some issue, please try again later", company: null });
    }
}

// Search company
exports.search = async (req, res) => {
    if (!req.query.keyword) {
        res.status(400).send("keyword is required");
    }
    try {
        const response = await Companies.findAll({ where: { role: "Company" } });
        // List of matched named companies
        let companies = [];
        response.forEach(company => {
            if (company.name.toLowerCase().includes(req.query.keyword.toLowerCase())) {
                companies.push(company);
            }
        });
        res.send({ status: 1, message: "Companies found", companies: companies });
    } catch (error) {
        res.send({
            status: 0,
            message: error.message || "We have found some issue, please try again later",
            companies: []
        })
    }
}