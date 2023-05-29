const { check, validationResult } = require('express-validator');

module.exports = app => {
    // Importing company controller
    const Companies = require("../controllers/company.controller");
    // Importing endpoints
    const Endpoints = require("../endpoints/endpoints");
    // Importing router
    const router = require("express").Router();
    // Company login
    router.post("/login", [
        check("email", "email is required").isLength({ min: 1, max: 50 }),
        check("password", "password is required").isLength({ min: 1, max: 50 })
    ], Companies.authentication);
    // Create Company
    router.post("/create", [
        check("email", "email is required").isLength({ min: 1, max: 50 }),
        check("password", "password is required").isLength({ min: 1, max: 50 }),
        check("name", "name is required").isLength({ min: 1, max: 50 }),
        check("country", "country is required").isLength({ min: 1, max: 50 }),
        check("zip", "zip is required").isLength({ min: 1, max: 50 }),
        check("state", "state is required").isLength({ min: 1, max: 50 }),
        check("city", "city is required").isLength({ min: 1, max: 50 })
    ], Companies.create);
    // Find all companies
    router.get("/all", Companies.findAll);
    // Update the company
    router.patch("/", Companies.update,
        [check("id", "company id is required").isLength({ min: 1, max: 50 })]);
    // Search company using name
    router.get("/", Companies.search);
    // Using router with the endpoints
    app.use(Endpoints.company, router);
}