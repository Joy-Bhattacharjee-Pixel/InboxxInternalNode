const { check, validationResult } = require('express-validator');

/* Importing db module */
const db = require("../models");
/* Importing payment keys model */
const PaymentKeys = db.paymentKeys;
/* Importing invoice model */
const Invoices = db.invoices;
/* Importing transaction table */
const Transactions = db.transactions;

/* Importing create pdf module */
const pdf = require('../commons/create.pdf');

const path = require('path');

const success = require('../commons/common.success');

/** Importing customer module */
const Customer = db.customers;

// Importing crypto module
const cryptoAlgorithm = require('../commons/crypto.algo');

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

/* Endpoints */
const endpoint = require("../endpoints/endpoints").payments;

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
    /* Send currency - usd default*/
    const currency = body.currency || "usd";
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
    // const currency = "usd";
    /* Shipping address object */
    const shippingObject = {
        name: customerName, /* shipping - customer name */
        address: {
            /* only line1 is providing */
            line1: customerAddress, /* customer address */
            country: 'US',
            postal_code: "99950"
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
                'us_bank_account',
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
                await Invoices.update(updateInvBody, { where: { companyId: companyId, billedToEmailID: customerEmail } });
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

/* Create product - Invoice number */
exports.createInvoice = async (req, res) => {
    /* required - invoice number + invoice id + invoice amount + invoice currency + 
    company id + customer name + customer email + customer phone + customer address + from mobile*/

    /* request body */
    const body = req.body;
    /* invoice number */
    const invoiceNumber = body.invoiceNumber;
    /* invoice id */
    const invoiceId = body.invoiceId;
    /* invoice amount */
    const invoiceAmount = body.invoiceAmount;
    /* invoice currency */
    const invoiceCurrency = body.invoiceCurrency;
    /* company id */
    const companyId = body.companyId;
    /* customer name */
    const customerName = body.customerName;
    /* customer email */
    const customerEmail = body.customerEmail;
    /* customer phone */
    const customerPhone = body.customerPhone;
    /* customer address */
    const customerAddress = body.customerAddress;
    /* from mobile */
    const fromMobile = body.fromMobile;

    /* product id */
    let productID = "";
    /* product price */
    let productPrice = "";
    /* price id */
    let priceId = "";

    /* created invoice name */
    const createdInvoiceName = `${invoiceNumber}-${Date.now()}`;

    try {
        /* checking if any products available with this invoice name or not */
        const tempProducts = await stripe.products.list();

        /* all products available */
        const products = tempProducts.data;

        /* finding out all the products with this name */
        const previousProduct = products.filter((item) => item.name == createdInvoiceName);

        /* no products found */
        /* creating invoice with name as - invoiceNumber_invoiceId_companyId*/
        try {
            const product = await stripe.products.create({
                name: createdInvoiceName,
                description: `Invoice created from ${companyId} with Invoice number ${invoiceNumber} & Invoice id ${invoiceId}`
            });
            /* adding productID & price */
            productID = product.id;
        } catch (error) {
            console.log(error);
        }

        /* creating price for this product */
        try {
            const price = await stripe.prices.create({
                unit_amount: invoiceAmount,
                currency: invoiceCurrency,
                product: productID,
            });
            productPrice = price.unit_amount;
            priceId = price.id;
        } catch (error) {
            console.log(error);
        }

        /* creating payment session */
        let session = await this.createPaymentSession(req, res, priceId, fromMobile, invoiceId, companyId);

        if (fromMobile == false) {
            return session;
        }
    } catch (error) {
        if (fromMobile == false) {
            return session;
        }
    }
}

/* Create payment session */
exports.createPaymentSession = async (req, res, priceId, fromMobile, invoiceId, companyId) => {
    /** Encrypting invoice id */
    const encryptedInvId = invoiceId;
    // cryptoAlgorithm.encrypt(`${invoiceId}`);
    /** Encrypting company id */
    const encryptedCompanyId = companyId;
    // cryptoAlgorithm.encrypt(`${companyId}`);

    /* base url */
    const baseUrl = config.baseUrl;
    /* endpoint */
    const addedEndpoint = endpoint + `/success?invoice=${encryptedInvId}&company=${encryptedCompanyId}&session_id={CHECKOUT_SESSION_ID}`;
    /* success url - redirect url */
    let successUrl = baseUrl + addedEndpoint;

    /* if from mobile then no success url */
    if (fromMobile == true) {
        try {
            const session = await stripe.checkout.sessions.create({
                success_url: baseUrl,
                line_items: [
                    { price: priceId, quantity: 1 }
                ],
                mode: 'payment',
            });
            res.send(session);
        } catch (error) {
            res.send(error);
        }
    }
    else {
        try {
            const session = await stripe.checkout.sessions.create({
                success_url: successUrl,
                line_items: [
                    { price: priceId, quantity: 1 }
                ],
                mode: 'payment',
            });
            // console.log(session);
            return session;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

/** API for validate the success payment */
exports.success = async (req, res) => {
    /** Retrieving invoice id from url */
    const invoiceId = req.query.invoice;
    // cryptoAlgorithm.decrypt(req.query.invoice);

    console.log(req.query.invoice);

    /** Retrieving company id from url */
    const company = req.query.company;
    // cryptoAlgorithm.decrypt(req.query.company);

    /** Invoice details */
    let invoiceDetails = {};

    /** Company details */
    let companyDetails = {};

    /** Fetching all invoice details from invoice table */
    try {
        invoiceDetails = await Invoices.findByPk(parseInt(invoiceId));

        /** Retrieving session based on session id */
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

        /** Stripe customer details */
        let stripeCustomerDetails = {};

        /** Customer email */
        let customerEmail;

        /** Customer details */
        let customerDetails;

        /** Payment id */
        let paymentId = session.payment_intent;

        /** Transaction id */
        let transactionId = "";

        /** Retrieving customer details from customer id */
        try {
            stripeCustomerDetails = await stripe.customers.retrieve(session.customer);
            customerEmail = stripeCustomerDetails.email;
        } catch (error) { console.log(error); }

        if (customerEmail) {
            /** When customer email is not null */
            /** Finding customer details */
            const allCustomers = await Customer.findAll({ where: { email: customerEmail } });
            /** Finding customer details - first customer */
            customerDetails = allCustomers[0];

            // /** Updating invoice as paid */
            // const updatedInvoice = await Invoices.update({ paid: true }, { where: { billedToEmailID: customerEmail, companyId: company, id: invoiceId } });

            try {
                /** Fetching transaction id */
                const verifyData = await stripe.paymentIntents.retrieve(paymentId);

                /** Availing transaction id */
                transactionId = verifyData.charges.data[0].balance_transaction;

                /** Transaction object */
                const transactionObject = {
                    invoiceId: parseInt(invoiceId),
                    companyId: parseInt(company),
                    transactionId: transactionId,
                    paymentId: paymentId,
                    customerId: customerDetails.id,
                    amount: invoiceDetails.invoiceValue,
                    status: true,
                    paymentMethod: "Stripe"
                }

                /** Adding in transaction table */
                const transId = await Transactions.create(transactionObject);

                /** Updating invoice as paid */
                const updatedInvoice = await Invoices.update({ paid: true, transactionId: transId.id }, { where: { billedToEmailID: customerEmail, companyId: company, id: invoiceId } });

                res.send(success.show(res, invoiceId, customerDetails.name));

            } catch (error) { console.log(error); res.send("Payment cancelled"); }
        }
    } catch (error) { }
}
