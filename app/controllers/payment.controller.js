const { check, validationResult } = require('express-validator');

/* Importing db module */
const db = require("../models");
/* Importing payment keys model */
const PaymentKeys = db.paymentKeys;
/* Importing invoice model */
const Invoices = db.invoices;
/* Importing transaction table */
const Transactions = db.transactions;

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

/* Initializing the config file */
const config = require('../configs/config');

/* Initializing stripe with stripe key */
const stripe = require('stripe')(config.stripeTestKey);

/* Creating STRIPE payment intent and sending to customer - STEP 1 */
exports.createStripePaymentIntent = async (req, res) => {
    /* Sent request body */
    const body = req.body;
    /* Sent customer name */
    const customerName = body.name;
    /* Sent customer email */
    const customerEmail = body.email;
    /* Sent customer phone */
    const customerPhone = body.phone;
    /* Send customer address */
    const customerAddress = body.address;
    /* Stripe API version object*/
    const apiVersion = { apiVersion: '2022-08-01' };

    /* Checking if any customer present in the stripe customers db with this name & email or not */
    const searchBody = { email: customerEmail };
    const foundCustomer = await stripe.customers.list(searchBody, apiVersion);

    /* Customer object */
    let customer = {};

    if (foundCustomer.data.length == 0) {
        /* No customers found with this name and email - CREATE new customer in stripe*/
        /* Customer create object */
        const createCustomerObject = {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            shipping: {
                address: { line1: customerAddress },
                name: customerName,
                phone: customerPhone
            },
            description: "Creating new customer"
        };
        /* Creating new customer */
        customer = await stripe.customers.create(createCustomerObject);
    }
    else {
        /* Customer existing */
        /* Found customer object */
        customer = foundCustomer.data[0];
    }

    /* Creating Ephemeral Key for this customer */
    const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id }, apiVersion
    );

    /* Creating a payment intent based on customer details and all */
    /* Invoice amount */
    const invoiceAmount = req.body.amount;
    /* Currency - usd default  */
    const currency = "usd";
    /* Shipping address object */
    const shippingObject = {
        name: customerName, /* shipping - customer name */
        address: {
            /* only line1 is providing */
            line1: customerAddress, /* customer address */
            country: 'US'
        }
    };
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: invoiceAmount,
            currency: currency,
            customer: customer.id,
            shipping: shippingObject,
            // Note: some payment methods have different requirements: https://stripe.com/docs/payments/payment-methods/integration-options
            payment_method_types: [
                'card',
                // 'ideal',
                // 'sepa_debit',
                // 'sofort',
                // 'bancontact',
                // 'p24',
                // 'giropay',
                // 'eps',
                // 'afterpay_clearpay',
                // 'klarna',
                // 'us_bank_account',
            ],
        });
        /* Object sending to customer */
        const responseObject = {
            paymentIntent: paymentIntent.client_secret,
            ephemeralKey: ephemeralKey.secret,
            customer: customer.id,
        };
        res.send({
            status: 1,
            message: "Payment intent created",
            response: responseObject
        });
    } catch (error) {
        res.send({
            status: 0,
            message: error.message,
            response: null
        });
    }
}

/* Verify payment id */
exports.verifyPaymentId = async (req, res) => {
    /* Sent request body */
    const body = req.body;
    /* Payment id */
    const paymentId = body.paymentId;
    /* Email */
    const customerEmail = body.email;
    /* Customer id */
    const customerId = body.customerId;
    try {
        /* Verifying payment id */
        const verifyData = await stripe.paymentIntents.retrieve(paymentId);
        /* Init response object */
        let responseObject = {};
        if (verifyData.status == "succeeded") {
            /* Transaction succeed */
            /* Transaction id */
            const transactionId = verifyData.charges.data[0].balance_transaction;
            /* Company id */
            const companyId = body.companyId;
            /* Is paying for all */
            const payAllInv = body.payAllInv;
            /* Invoice ids */
            const invoiceIds = body.invoiceIds;
            /* Invoice amount */
            const invoicesAmount = body.invoicesAmount;
            /* Transaction amount */
            const amount = verifyData.amount_received;

            if (payAllInv == true) {
                /* When paying for all invoices from a particular company */
                /* Making all invoices as paid from companyId and from customerId*/
                /* Update body */
                const updateInvBody = {
                    paid: true
                };
                console.log(companyId);
                console.log(customerEmail);

                /* Performing update invoice query */
                await Invoices.update(updateInvBody, { where: { companyId: companyId, billedToEmailID: customerEmail} });
            }
            else {
                /* When paying for single invoice */
                const updateInvBody = {
                    paid: true
                };
                /* Invoice id */
                const singleInvId = invoiceIds[0];
                /* Performing update invoice query */
                await Invoices.update(updateInvBody, { where: { companyId: companyId, billedToEmailID: customerEmail, id: singleInvId } });
            }

          
            for (let index = 0; index < invoiceIds.length; index++) {
                const invoiceId = invoiceIds[index];
                const invoiceAmount = invoicesAmount[index];
                /* Creating object for entry in transaction table */
                const createTransObject = {
                    invoiceId: invoiceId,
                    companyId: companyId,
                    transactionId: transactionId,
                    paymentId: paymentId,
                    customerId: customerId,
                    amount: invoiceAmount,
                    status: true,
                    paymentMethod: "Stripe"
                }
                /* Creating transaction object */
                await Transactions.create(createTransObject);
            }

            /* Response object */
            responseObject = {
                success: true,
                txnId: transactionId
            };
            res.send({
                status: 1,
                message: "Transaction Successful",
                response: responseObject
            })
        } else {
            /* When transaction unsuccessful */
            responseObject = {
                success: false,
                txnId: null
            }
            res.send({
                status: 0,
                message: "Transaction Failed",
                response: responseObject
            })
        }
    } catch (error) {
        res.send({
            status: 0,
            message: error.message,
            verifiedObject: null
        })
    }
}