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
    router.post("/totalInvoices", [
        check("companyId", "companyId is required").isLength({ min: 1, max: 50 }),
        check("customerId", "customerId is required").isLength({ min: 1, max: 50 }),
        check("customerEmail", "customerEmail is required").isLength({ min: 1, max: 50 }),
    ], Payment.allInvoicesAmount);

    /* Available payment methods for a single company */
    router.get("/paymentMethods", Payment.paymentMethods);

    /* Creating payment intent and sending to the customer - STRIPE Payment STEP 1 */
    router.post("/stripe-payment-intent", [
        check("amount", "amount is required").isLength({ min: 1, max: 50 }),
        check("phone", "phone is required").isLength({ min: 1, max: 50 }),
        check("name", "name is required").isLength({ min: 1, max: 50 }),
        check("email", "email is required").isLength({ min: 1, max: 50 }),
        check("address", "address is required").isLength({ min: 1, max: 50 }),
    ], Payment.createStripePaymentIntent);

    /* Verfying payment id coming from front end */
    router.post("/stripe-verify-payment", [
        check("payAllInv", "payAllInv is required").isLength({ min: 1, max: 50 }),
        check("invoiceIds", "invoiceIds is required").isLength({ min: 1, max: 50 }),
        check("customerId", "customerId is required").isLength({ min: 1, max: 50 }),
        check("companyId", "companyId is required").isLength({ min: 1, max: 50 }),
        check("paymentId", "paymentId is required").isLength({ min: 1, max: 50 }),
        check("amount", "amount is required").isLength({ min: 1, max: 50 }),
        check("phone", "phone is required").isLength({ min: 1, max: 50 }),
        check("name", "name is required").isLength({ min: 1, max: 50 }),
        check("email", "email is required").isLength({ min: 1, max: 50 }),
        check("address", "address is required").isLength({ min: 1, max: 50 }),
    ], Payment.verifyPaymentId);

    app.use(endpoint, router);

}