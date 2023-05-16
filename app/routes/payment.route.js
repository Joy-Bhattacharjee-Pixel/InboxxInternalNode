const { check, validationResult } = require('express-validator');

module.exports = app => {
    /* Importing payment controller */
    const Payment = require("../controllers/payment.controller");
    /* Payement Endpoint */
    const endpoint = require("../endpoints/endpoints").payments;
    /* Importing router */
    const router = require("express").Router();

    /* Add payment keys - Admin */
    router.post("/addKeys", [
        check("companyId", "companyId is required").isLength({ min: 1, max: 50 })
    ], Payment.addKeys);

    /* Calculate total invoice amount from a single company */
    router.post("/totalInvoices",[
        check("companyId", "companyId is required").isLength({ min: 1, max: 50 }),
        check("customerId", "customerId is required").isLength({ min: 1, max: 50 }),
        check("customerEmail", "customerEmail is required").isLength({ min: 1, max: 50 }),
    ], Payment.allInvoicesAmount);

    /* Available payment methods for a single company */
    router.get("/paymentMethods", Payment.paymentMethods);

    app.use(endpoint, router);

}