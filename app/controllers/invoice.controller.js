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

const Invoices = db.invoices;
const Customers = db.customers;
const Companies = db.companies;

// Importing json sheet module
const jsonSheet = require('../commons/extract.json.sheet');


const AWS = require('aws-sdk');
const multer = require("multer");
const multerS3 = require('multer-s3');



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
                    billedToPhone: excelData["Billed To Phone"] == "undefined" ? null : excelData["Billed to Email ID"],
                    billedToCountryCode: excelData["Billed to Country Code"] == "undefined" ? null : excelData["Billed to Country Code"],
                    invoiceValue: excelData["Invoice Value"] == "undefined" ? null : excelData["Invoice Value"],
                    invoiceCurrency: excelData["Invoice Currency"] == "undefined" ? undefined : excelData["Invoice Currency"],
                    dueDate: excelData["Due Date"] == "undefined" ? null : Date(excelData["Due Date"]),
                    invoiceSummary: excelData["Invoice Summary"] == "undefined" ? null : excelData["Invoice Summary"],
                    billedToZipCode: excelData["Billed To Zip Code"] == "undefined" ? null : excelData["Billed To Zip Code"],
                    paymentStatus: excelData["Payment Status"] == "undefined" ? null : excelData["Payment Status"]
                };
                // Pushing all data into a single array
                allExcelFormattedData.push(formattedJson);
                try {
                    // Check this particular invoice id present in the database or not
                    let availableInvoices = await Invoices.findAll({ where: { invoiceNumber: formattedJson.invoiceNumber, companyId: req.body.companyId } });
                    if (availableInvoices.length == 1) {
                        // Invoices available to update
                        await Invoices.update(formattedJson, {
                            where: { invoiceNumber: formattedJson.invoiceNumber }
                        });
                    }
                    else {
                        // No invoices available to update
                        // Creating the invoice data in the invoice table
                        await Invoices.create(formattedJson);
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
    /* Trying to fetch all the invoices from this company based on query id */
    try {
        const invoices = await Invoices.findAll({ where: { companyId: req.query.id } });
        res.send({
            status: 1,
            message: `All invoices from company ${req.query.id}`,
            invoices: invoices
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








let space = new AWS.S3({
    //Get the endpoint from the DO website for your space
    endpoint: AWS.Endpoint("nyc3.digitaloceanspaces.com"),
    useAccelerateEndpoint: false,
    accessKeyId: "DO00XZUXTDDGPVAC2V4F",
    secretAccessKey: "uOxBk3Qksr5qoOjIqBlIggp7J4QHQ49lwoExBgoqsFM"
});

//Name of your bucket here
const BucketName = "inboxx";

// Upload invoice to the Digital Ocean Space
exports.uploadToDigitOcean = async (req, res) => {

    // Uploaded file path
    const filePath = path.resolve(path.dirname('')) + "/resources/static/assets/uploads/" + req.file.filename;
    // Reading the file from the app folder
    const file = fs.readFileSync(filePath);


    let uploadParameters = {
        Bucket: BucketName,
        Body: file,
        ACL: 'public-read',
        Key: req.file.filename
    };

    space.upload(uploadParameters, function (error, data) {
        if (error) {
            console.error(error);
            res.send(error);
            return;
        }
        res.sendStatus(200);
    });


    // res.send(AWS.config)

}
