const { check, validationResult } = require('express-validator');

// Importing middleware-upload
const upload = require("../middleware/upload");

module.exports = app => {
    // Importing customer controller
    const Customer = require("../controllers/customer.controller");
    // Importing endpoints
    const Endpoints = require("../endpoints/endpoints");
    // Importing router
    const router = require("express").Router();
    // Customer login
    router.post("/login", [
        check("email", "email is required").isLength({ min: 1, max: 50 }),
        check("password", "password is required").isLength({ min: 1, max: 50 })
    ], Customer.authCustomer);
    // Create customer
    router.post("/create", [
        check("email", "email is required").isLength({ min: 1, max: 50 }),
        check("password", "password is required").isLength({ min: 1, max: 50 }),
        check("name", "name is required").isLength({ min: 1, max: 50 }),
        check("phone", "phone is required").isLength({ min: 1, max: 50 })
    ], Customer.create);
    // Find all customers
    router.get("/all", Customer.allCustomers);
    // Find single customer
    router.get("/", Customer.findOne);
    // Update customer
    router.put("/", Customer.update);

    /* update push token for a customer */
    router.post("/add-token", [
        check("customerId", "customerId is required").isLength({ min: 1, max: 50 }),
        check("token", "token is required"),
    ], Customer.addPushToken);

    /* remove push token for a customer */
    router.post("/remove-token", [
        check("customerId", "customerId is required").isLength({ min: 1, max: 50 }),
        check("token", "token is required"),
    ], Customer.removePushToken);

    /* update customer profile image */
    router.post("/upload-image", upload.single("file"), Customer.updateProfileImage);

    /* requesting OTP to the email address for password update */
    router.post("/request-otp", Customer.getOtpMail);

    /* update password after OTP verification */
    router.post("/update-password", Customer.updatePassword);

    // Using router with the endpoints
    app.use(Endpoints.customer, router);
}