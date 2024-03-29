// Importing isomorphic fetch
const fetch = require('isomorphic-fetch');
// Importing dropbox module
const Dropbox = require('dropbox').Dropbox;
// Importing config file
const Config = require('../configs/config');
// Importing fs module
const fs = require('fs');
// Importing path module
const path = require('path');
// Importing xslx module
const reader = require('xlsx');
// Importing invoice module
const db = require("../models");
/* Importing query types */
const { QueryTypes } = require('sequelize');
const Sequelize = db.sequelize;

const { check, validationResult } = require('express-validator');

const { Op } = require("sequelize");

/* importing pagination module */
const pagination = require('../commons/pagination');

/* Importing create pdf module */
const pdf = require('../commons/create.pdf');

const Invoices = db.invoices;
const Customers = db.customers;
const Companies = db.companies;
const Transactions = db.transactions;

/* importing notification controller */
const Notification = require('../controllers/notification.controller');


// Importing json sheet module
const jsonSheet = require('../commons/extract.json.sheet');


const AWS = require('aws-sdk');
const multer = require("multer");
const multerS3 = require('multer-s3');

const mail = require('../commons/send.email');
const Payment = require('./payment.controller');

// Initializing dropbox class
const dbx = new Dropbox({ accessToken: Config.dropboxToken, fetch: fetch });

// This function is for upload the customer sheet in the dropbox
exports.uploadCustomerSheet = async (req, res) => {
    // Validation for the file
    if (!req.file) {
        res.status(400).send({ message: "Excel sheet with the customer data is required" });
    }
    try {
        // Uploaded file path
        const filePath = path.resolve(path.dirname('')) + "/resources/static/assets/uploads/" + req.file.filename;
        // Reading the file from the app folder
        const file = fs.readFileSync(filePath);
        // Setting up the uploaded file name
        const uploadFileName = Date.now();
        // Uploaded file path in the dropbox
        const uploadFilePath = `/File Requests/customers/${uploadFileName}.xlsx`;
        // Uploading the file to the dropbox
        // const dbxResponse = await dbx.filesUpload({ path: uploadFilePath, contents: file });
        // Sending response to the customer
        res.status(200).send({ message: "File uploaded successfully", response: "dbxResponse" });
    } catch (error) {
        // If some error happens
        res.status(500).send(error.message ?? "We have faced some issue, please try again  later");
    }
}

exports.editExcelSheet = async (req, res) => {
    const filePath = path.resolve(path.dirname('')) + "/resources/static/assets/uploads/" + req.file.filename;
    // Reading the file from the app folder
    const workBook = reader.readFile(filePath);
    const sheet = reader.utils.sheet_add_aoa(workBook.Sheets["Sheet1"], [["newww"]], { origin: "A1" });
    reader.utils.book_append_sheet(workBook, sheet)
    const dbFilepath = path.resolve(path.dirname('')) + "/resources/static/assets/uploads/dropbox-" + req.file.filename;
    reader.writeFile(workBook, dbFilepath);
    const file = fs.readFileSync(dbFilepath);
    const uploadFileName = Date.now();
    const uploadFilePath = `/File Requests/test/${uploadFileName}.xlsx`;
    try {
        const dbxResponse = await dbx.filesUpload({ path: uploadFilePath, contents: file });
        // Sending response to the customer
        res.status(200).send({ message: "File uploaded successfully", response: workBook.Sheets["Sheet1"]['!cols'] });
    } catch (error) {
        console.log(error);
        res.send(error.message || "Error")
    }
}

exports.uploadInvoiceSheet = async (req, res) => {
    if (!req.file) {
        res.status(400).send({ message: "Excel sheet with the customer data is required" });
    }
    if (!req.body.companyId) {
        res.status(400).send({ message: "Company Id is required" });
    }
    try {
        // Uploaded file path
        const filePath = path.resolve(path.dirname('')) + "/resources/static/assets/uploads/" + req.file.filename;

        const dbFilepath = path.resolve(path.dirname('')) + "/resources/static/assets/uploads/dropbox-" + req.file.filename;

        // All the data available in the excel sheet
        let allExcelFormattedData = [];
        // Extracting json from the uploaded sheet
        const allExcelData = jsonSheet.extractJsonFromSheet(filePath, dbFilepath);
        // Validating the excel sheet for every fields 
        allExcelData.forEach(async (excelData) => {
            if (!excelData["Invoice Number"]) {
                // Invoice number header is missing or some of the invoice number is null
                res.status(400).send("Invoice Number is missing in excel sheet");
            }
            if (!excelData["Invoice Date"]) {
                // Invoice date header is missing or some of the Invoice Date is null
                res.status(400).send("Invoice Date is missing in excel sheet");
            }
            if (!excelData["Invoice Type"]) {
                // Invoice Type header is missing or some of the Invoice Type is null
                res.status(400).send("Invoice Type is missing in excel sheet");
            }
            if (!excelData["Billed To Name"]) {
                // Billed To Name header is missing or some of the Billed To Name is null
                res.status(400).send("Billed To Name is missing in excel sheet");
            }
            if (!excelData["Billed to Email ID"]) {
                // Billed to Email ID header is missing or some of the Billed to Email ID is null
                res.status(400).send("Billed to Email ID is missing in excel sheet");
            }
            if (!excelData["Billed To Phone"]) {
                // Billed To Phone header is missing or some of the Billed To Phone is null
                res.status(400).send("Billed To Phone is missing in excel sheet");
            }
            if (!excelData["Billed to Country Code"]) {
                // Billed to Country Code header is missing or some of the Billed to Country Code is null
                res.status(400).send("Billed to Country Code is missing in excel sheet");
            }
            if (!excelData["Invoice Value"]) {
                // Invoice Value header is missing or some of the Invoice Value is null
                res.status(400).send("Invoice Value is missing in excel sheet");
            }
            if (!excelData["Invoice Currency"]) {
                // Invoice Currency header is missing or some of the Invoice Currency is null
                res.status(400).send("Invoice Currency is missing in excel sheet");
            }
            if (!excelData["Due Date"]) {
                // Due Date header is missing or some of the Due Date is null
                res.status(400).send("Due Date is missing in excel sheet");
            }
            if (!excelData["Invoice Summary"]) {
                // Invoice Summary header is missing or some of the Invoice Summary is null
                res.status(400).send("Invoice Summary is missing in excel sheet");
            }
            if (!excelData["Billed To Zip Code"]) {
                // Billed To Zip Code header is missing or some of the Billed To Zip Code is null
                res.status(400).send("Billed To Zip Code is missing in excel sheet");
            }
            else {
                let formattedJson = {
                    companyId: req.body.companyId,
                    invoiceNumber: excelData["Invoice Number"] == "undefined" ? null : excelData["Invoice Number"],
                    invoiceDate: excelData["Invoice Date"] == "undefined" ? null : Date(excelData["Invoice Date"]),
                    invoiceType: excelData["Invoice Type"] == "undefined" ? null : excelData["Invoice Type"],
                    billedToName: excelData["Billed To Name"] == "undefined" ? null : excelData["Billed To Name"],
                    billedToEmailID: excelData["Billed to Email ID"] == "undefined" ? null : excelData["Billed to Email ID"],
                    billedToPhone: excelData["Billed To Phone"] == "undefined" ? null : excelData["Billed To Phone"],
                    billedToCountryCode: excelData["Billed to Country Code"] == "undefined" ? null : excelData["Billed to Country Code"],
                    invoiceValue: excelData["Invoice Value"] == "undefined" ? null : excelData["Invoice Value"],
                    invoiceCurrency: excelData["Invoice Currency"] == "undefined" ? undefined : excelData["Invoice Currency"],
                    dueDate: excelData["Due Date"] == "undefined" ? null : Date(excelData["Due Date"]),
                    invoiceSummary: excelData["Invoice Summary"] == "undefined" ? null : excelData["Invoice Summary"],
                    billedToZipCode: excelData["Billed To Zip Code"] == "undefined" ? null : excelData["Billed To Zip Code"],
                };
                // Pushing all data into a single array
                allExcelFormattedData.push(formattedJson);
                /* Getting company from company id */
                const company = await Companies.findByPk(req.body.companyId);

                /* Company name */
                const companyName = company.name;
                /* Invoice number */
                const invoiceNumber = formattedJson.invoiceNumber;

                /** Customer available with this email */
                let customer = null;

                /** All customers available with this email */
                const allCustomers = await Customers.findAll({
                    where: { email: formattedJson.billedToEmailID }
                });

                /** Checking if customers are not empty - take first customer */
                if (allCustomers.length != 0) {
                    customer = allCustomers[0];
                }

                /** Created pdf name */
                let pdfName = null;

                /** Create pdf path */
                let createdPdfPath = null;

                /** Created pdf content */
                let pdfFile = null;

                /** Created payment link */
                let stripeLink = "";

                if (customer != null) {
                    /** Creating UNPAID pdf for this customer */
                    /** PDF name */
                    pdfName = `${customer.name}-${Date.now()}.pdf`;

                    /** Creating pdf and extracting path */
                    createdPdfPath = await pdf.createPdf(pdfName, customer.name, companyName, invoiceNumber, 'http://google.com/');

                    /** Attaching unpaid pdf name in the json */
                    formattedJson.unpaidPdf = pdfName;
                }

                try {
                    // Check this particular invoice id present in the database or not
                    let availableInvoices = await Invoices.findAll({ where: { invoiceNumber: formattedJson.invoiceNumber, companyId: req.body.companyId } });
                    if (availableInvoices.length != 0) {
                        // Invoices available to update
                        await Invoices.update(formattedJson, {
                            where: { invoiceNumber: formattedJson.invoiceNumber, paid: false }
                        });

                        if (customer) {
                            /** Attaching invoice id */
                            formattedJson.invoiceId = availableInvoices[0].id;

                            /** Stripe payment link */
                            stripeLink = await this.createStripePaymentLink(formattedJson, customer);

                            /** Extracting customer push token */
                            const pushToken = customer.pushToken;

                            /** Created pdf file content */
                            pdfFile = fs.readFileSync(createdPdfPath);

                            /* Update invoice mail subject */
                            const updateInvoiceMailSubject = `Invoice ${formattedJson.invoiceNumber} updated`;
                            /* Update invoice mail text */
                            const updateInvoiceMailText = `Hi, ${formattedJson.billedToName} we have updated your previous invoice ${formattedJson.invoiceNumber}\n\nThis is the payment link: ${stripeLink}`;
                            /* Sending mail to the customers */
                            mail.sendMail(updateInvoiceMailSubject, updateInvoiceMailText, pdfFile, formattedJson.billedToEmailID);

                            /* sending notification to the eligible customers */
                            /* notification title */
                            const notificationTitle = `Invoice ${formattedJson.invoiceNumber} updated`;
                            /* noticiation body */
                            const notificationBody = `Now the invoice value is ${formattedJson.invoiceValue}`;
                            /* route */
                            const notificationRoute = "/invoices";

                            if (pushToken != null) {
                                await Notification.sendNotification(notificationTitle, notificationBody, notificationRoute, [pushToken]);
                            }
                        }
                    }
                    else {
                        // No invoices available to update
                        // Creating the invoice data in the invoice table
                        const createdInvoice = await Invoices.create(formattedJson);

                        if (customer) {
                            /** Attaching invoice id */
                            formattedJson.invoiceId = createdInvoice.id;

                            /** Stripe payment link */
                            stripeLink = this.createStripePaymentLink(formattedJson, customer);
                            console.log(stripeLink);

                            /** Created pdf file content */
                            pdfFile = fs.readFileSync(createdPdfPath);

                            /* sending email to respective customer - Creating invoices */
                            /* create invoice mail subject */
                            const createInvoiceMailSubject = `Invoice ${formattedJson.invoiceNumber} created`;
                            /* create invoice mail text */
                            const createInvoiceMailText = `Hi, ${formattedJson.billedToName} we have created a new invoice ${formattedJson.invoiceNumber}\n\nThis is the payment link: ${stripeLink}`;
                            /* Sending mail to the customers */
                            mail.sendMail(createInvoiceMailSubject, createInvoiceMailText, pdfFile, formattedJson.billedToEmailID);

                            /* sending notification to the eligible customers */
                            /* notification title */
                            const notificationTitle = `Invoice ${formattedJson.invoiceNumber} created`;
                            /* noticiation body */
                            const notificationBody = `The invoice value is ${formattedJson.invoiceValue}`;
                            /* route */
                            const notificationRoute = "/invoices";

                            const pushToken = customer.pushToken;
                            if (pushToken != null) {
                                await Notification.sendNotification(notificationTitle, notificationBody, notificationRoute, [pushToken]);
                            }
                        }
                    }
                } catch (error) {
                    console.log(error.message || "Error occurs");
                }
            }
        });
        res.status(200).send(allExcelFormattedData);
    } catch (error) {
        res.send(error.message ?? "We have faced some issue, please try again later");
    }
}

/** Creating stripe payment link to complete the payment */
exports.createStripePaymentLink = async (invoice, customer) => {
    let req = {};
    let res = {};

    /** Preparing request body */
    req.body = {
        invoiceNumber: invoice.invoiceNumber,
        invoiceId: invoice.invoiceId,
        invoiceAmount: invoice.invoiceValue,
        invoiceCurrency: invoice.invoiceCurrency,
        companyId: invoice.companyId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        fromMobile: false
    };

    try {
        const response = await Payment.createInvoice(req, res);
        return response.url;
    } catch (error) {
        console.log(error);
        return error;
    }
}

/* Finding out all the due invoices available for a customer from a single compnay */
exports.findInvoices = async (req, res) => {
    /* Validating the customer id is sent through the req query or not */
    if (!req.query.id) {
        res.status(400).send({
            status: 0,
            message: "Customer Id is required",
            invoices: null
        });
    }
    /* Customer id sent in query */
    const id = req.query.id;
    const paymentStatus = req.params.status.toLowerCase();
    console.log(paymentStatus);
    try {
        /* Finding out the customer email associated with this id */
        const customer = await Customers.findByPk(id);
        if (customer) {
            /* Finding out all the invoices from invoice table */
            const invoices = await Invoices.findAll({ where: { billedToEmailID: customer.email } });
            /* Finding out all the companies from companies table */
            const companies = await Companies.findAll({ where: { role: "Company" } });

            /* Initializing an array for the companies including the invoices */
            let invoicesForCustomer = [];
            companies.forEach(company => {
                /* Initializing an array for storing the temp list*/
                let tempArray = [];
                invoices.forEach(invoice => {
                    /* Current indexed invoice */
                    if (company.id == invoice.companyId && invoice.paymentStatus.toLowerCase() == paymentStatus) {
                        /* When company id matched with invoice company id */
                        tempArray.push(invoice);
                    }
                });
                /* Adding temp array in the primary array */
                invoicesForCustomer.push({
                    company: company,
                    invoices: tempArray
                });
            });
            res.send(invoicesForCustomer);
        }
        else {
            res.send({
                status: 0,
                message: `Customer not found with id=${id}`,
                invoices: null
            });
        }
    } catch (error) {
        res.send(error);
    }
}

/* Finding out all the invoices rasied from a particular company */
exports.allInvoices = async (req, res) => {
    /* Validating company id */
    if (!req.query.id) {
        /* When company id is null */
        res.status(400).send({
            status: 0,
            message: "Company Id is required",
            invoices: null
        })
    }

    const { page } = req.query;
    const { limit, offset } = pagination.getPagination(page, 10);

    /* Trying to fetch all the invoices from this company based on query id */
    try {
        const invoices = await Invoices.findAndCountAll({ where: { companyId: req.query.id }, limit, offset });
        res.send({
            status: 1,
            message: `All invoices from company ${req.query.id}`,
            data: pagination.getPagingDataInvoices(invoices, page, limit)
        });
    } catch (error) {
        /* When some error occurs */
        res.send({
            status: 0,
            message: error.message || "We have faced some issue, please try again later",
            invoices: null
        });
    }
}

/* Finding out all the companies sent invoices available for a customer from a single compnay - UPDATED */
exports.companiesSentInvoices = async (req, res) => {
    /* Validating customer id */
    if (!req.body.customerId) {
        /* When customer id is null */
        res.status(400).send({
            status: 0,
            message: "Customer Id is required",
            invoices: null
        })
    }
    if (req.body.paid == null) {
        /* When the payment status is null */
        res.status(400).send({
            status: 0,
            message: "Payment status - paid is required",
            invoices: null
        })
    }
    /* Fetching customer details from customer table */
    const customer = await Customers.findByPk(req.body.customerId);
    if (!customer) {
        /* If customer not found */
        res.send({
            status: 0,
            message: "No customer found with this id",
            companies: null
        })
    }
    else {
        /* Paid or Unpaid invoices */
        let paid = req.body.paid;
        /* Found customer email */
        const email = customer.email;
        /* Fetching companies list from invoice table which have sent me invoices */
        try {
            /* Raw SQL query for searching distinct companies from invoice table */
            const companiesSentInvoicesQuery = `SELECT DISTINCT companyId FROM invoices where billedToEmailID='${email}' AND paid=${paid}`;
            // Performing raw SQL query
            const companiesSentInvoices = await db.sequelize.query(companiesSentInvoicesQuery, { type: QueryTypes.SELECT });
            /* Companies sent invoices list */
            /* All the company  */
            let companyIds = [];
            companiesSentInvoices.forEach(company => {
                companyIds.push(company.companyId);
            });
            const response = await Companies.findAll({
                where:
                    Sequelize.or({ id: companyIds })
            });
            res.send({
                status: 1,
                message: "Companies sent invoices",
                companies: response
            });
        } catch (error) {
            res.send({
                status: 0,
                message: error.message,
                companies: null
            });
        }
    }
}

/* List of invoices sent from a single company */
exports.invoices = async (req, res) => {
    /* Validating company id & customer id */
    if (!req.body.companyId) {
        /* Company id is missing from body */
        res.send({
            status: 0,
            message: "Company Id is required in body",
            invoices: null
        })
    }
    if (!req.body.customerId) {
        /* Customer id is missing from the body */
        res.send({
            status: 0,
            message: "Customer id is required in body",
            invoices: null
        })
    }
    if (req.body.paid == null) {
        /* When the payment status is null */
        res.status(400).send({
            status: 0,
            message: "Payment status - paid is required",
            invoices: null
        })
    }
    /* Fetching customer details from customer table */
    const customer = await Customers.findByPk(req.body.customerId);
    if (!customer) {
        /* If customer not found */
        res.send({
            status: 0,
            message: "No customer found with this id",
            invoices: null
        })
    }
    else {
        /* Paid or Unpaid invoices */
        let paid = req.body.paid;
        /* Found customer email */
        const email = customer.email;

        try {
            const response = await Invoices.findAll({
                include: ["transactions"],
                where: { companyId: req.body.companyId, billedToEmailID: email, paid: paid }
            });
            res.send(response);
        } catch (error) {
            res.send(error)
        }
    }

}

/* Update all invoices */
exports.updateAllInvoices = async (req, res) => {
    /* Validating company id */
    if (!req.body.companyId) {
        /* When company id is null */
        res.status(400).send({
            status: 0,
            message: "Company Id is required in body",
            invoice: null
        })
    }
    /* Validating invoice id */
    if (!req.body.invoiceId) {
        /* When invoice id is null */
        res.status(400).send({
            status: 0,
            message: "Invoice Id is required in body",
            invoice: null
        })
    }
    /* Creating a body object */
    const body = {
        invoiceSummary: req.body.invoiceSummary,
        invoiceValue: req.body.invoiceValue,
        paid: req.body.paid
    }
    try {
        /* Updating invoice based on invoice id in the invoice table */
        await Invoices.update(body, { where: { id: req.body.invoiceId } });
        res.send({
            status: 1,
            message: "Invoice updated successfully",
            invoice: req.body
        });
    } catch (error) {
        res.send({
            status: 0,
            message: error.message,
            invoice: null
        })
    }

}

/* search invoice */
exports.searchInvoice = async (req, res) => {
    /* Validating the request body */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // If some errors present
        res.status(400).json(errors);
    }

    const companyId = req.body.companyId;

    const body = {
        invoiceDate: req.body.invoiceDate,
        dateType: req.body.dateType,
        invoiceAmount: req.body.invoiceAmount,
        invoiceAmountType: req.body.invoiceAmountType,
        customerName: req.body.customerName,
        selectedStatus: req.body.selectedStatus
    };

    let foundInvoices = [];

    try {
        const response = await Invoices.findAll({
            where: {
                [Op.and]: [
                    body.invoiceDate && body.dateType == "Before" && {
                        createdAt: {
                            [Op.lt]: body.invoiceDate
                        }
                    },
                    body.invoiceDate && body.dateType == "Equals" && {
                        createdAt: body.invoiceDate
                    },
                    body.invoiceDate && body.dateType == "After" && {
                        createdAt: {
                            [Op.gt]: body.invoiceDate
                        }
                    }
                ]
            }
        });
        res.send(response);
    } catch (error) {
        res.send(error);
    }

}


/** Fetching invoice history data */
exports.invoiceHistory = async (req, res) => {
    /** Validating customer id */
    if (!req.query.id) {
        res.status(400).send({
            status: 0,
            message: "Customer Id required",
            history: null
        });
    }
    /** Customer id coming in query */
    const customerId = req.query.id;
    try {
        /** Fetching all transaction from transaction table for this customer */
        const transactions = await Transactions.findAll({
            include: ["company", "invoice"],
            where: { customerId: customerId }
        });
        res.send(transactions);
    } catch (error) {
        res.send(error)
    }
}




// Name of your bucket here
const BucketName = "inboxxspace";
// Load dependencies
const aws = require('aws-sdk');

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com');
const s3 = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: "DO00QYENYQBU8GTLRZ69",
    secretAccessKey: "ytdvU9D7vYkZxCRNbhnr6TANzOcdvS1CRiQkuPPASu8"
});

// Change bucket property to your Space name
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: `${BucketName}/Excel_Invoice`,
        key: (request, file, cb) => {
            cb(null, file.originalname);
        }
    })
}).array('upload', 1);

exports.uploadToDigitalOcean = async (request, response) => {
    console.log(request.body);
    upload(request, response, function (error) {
        if (error) {
            console.log(error);
            return response.redirect("/error");
        }
        console.log('File uploaded successfully.');
        response.send("success");
    });
}