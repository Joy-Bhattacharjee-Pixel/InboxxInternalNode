const { check, validationResult } = require('express-validator');

/* Importing db module */
const db = require("../models");
/* Importing payment keys model */
const PaymentKeys = db.paymentKeys;
/* Importing invoice model */
const Invoices = db.invoices;

/* Adding keys to the payment keys table based on company id */
exports.addKeys = async (req, res) => {
    /* Validating the request body */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If some errors present
        res.status(400).json(errors);
    }

    const companyId = req.body.companyId;
    const stripeKey = req.body.stripeKey;
    const paypalKey = req.body.paypalKey;

    const body = {
        stripeKey: stripeKey,
        paypalKey: paypalKey
    }

    /* Checking if there is any company present with this id */
    try {
        const companies = await PaymentKeys.findAll({ where: { companyId: companyId } });
        if (companies.length != 0) {
            /* Companies present with this id - Update previous data*/
            await PaymentKeys.update(body, { where: { companyId: companyId } });
            res.send({
                status: 1,
                message: "Payment keys updated",
                response: body
            })
        }
        else {
            /* No companies present with this id - Create new record */
            try {
                /* Creating new keys attached with company id */
                const response = await PaymentKeys.create({
                    companyId: companyId,
                    stripeKey: stripeKey,
                    paypalKey: paypalKey
                });
                res.send({
                    status: 1,
                    message: "Payment Keys added",
                    response: response
                })
            } catch (error) {
                res.send({
                    status: 0,
                    message: error.message,
                    response: null
                })
            }
        }
    } catch (error) {
        res.send({
            status: 0,
            message: error.message,
            response: null
        })
    }

}

/* Calculate all invoices amount from a single company*/
exports.allInvoicesAmount = async (req, res) => {
    /* Validating the request body */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If some errors present
        res.status(400).json(errors);
    }

    const companyId = req.body.companyId;
    const customerEmail = req.body.customerEmail;

    /* Trying to find all the invoices from the company with this company id for this customer */
    try {
        const invoices = await Invoices.findAll({ where: { companyId: companyId, billedToEmailID: customerEmail } });
        /* Going through every invoices found and calculating total invoice amount */
        let totalAmount = 0;
        invoices.forEach(invoice => {
            let stringAmount = invoice.invoiceValue;
            totalAmount += parseFloat(stringAmount);
        });
        res.send({
            status: 1,
            message: `Total amount for all invoices from company ${companyId}`,
            totalAmount: totalAmount
        })
    } catch (error) {
        res.send({
            status: 0,
            message: error.message,
            totalAmount: null
        })
    }
}

/* Available payment methods for a single company */
exports.paymentMethods = async (req, res) => {
    /* Validating company id */
    if (!req.query.id) {
        /* Company id missing */
        res.status(400).send({
            status: 0,
            message: "Company id is required in URL",
            paymentKeys: null
        })
    }

    try {
        /* Finding out the keys from the payment keys table */
        const resposne = await PaymentKeys.findAll({ where: { companyId: req.query.id } });
        if (resposne.length == 0) {
            /* No comapnies present in payment keys table with this id */
            res.send({
                status: 1,
                message: `No Payment methods available for company ${req.query.id}`,
                paymentKeys: null
            })
        }
        else {
            res.send({
                status: 1,
                message: `Payment methods for company ${req.query.id}`,
                paymentKeys: resposne
            })
        }
    } catch (error) {
        res.send({
            status: 0,
            message: error.message,
            paymentKeys: null
        })
    }
}