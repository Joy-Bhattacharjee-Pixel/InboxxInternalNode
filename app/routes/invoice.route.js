// Importing middleware-upload
const upload = require("../middleware/upload");

const { check, validationResult } = require('express-validator');


module.exports = app => {
    // Importing invoice controller
    const Invoice = require("../controllers/invoice.controller");
    // Importing endpoints
    const Endpoints = require("../endpoints/endpoints");
    // Importing router
    const router = require("express").Router();
    // Uploading the file to the dropbox
    // router.post("/uploadSheet", upload.single("file"), Invoice.uploadCustomerSheet);
    // Uploading invoice sheet
    router.post("/uploadInvoiceSheet", upload.single("file"), Invoice.uploadInvoiceSheet);
    // router.post("/editInvoiceSheet", upload.single("file"), Invoice.editExcelSheet);
    router.post("/space", upload.single("file"), Invoice.uploadToDigitOcean);


    /* Finding out all the invoices for a customer */
    router.get("/:status", Invoice.findInvoices);

    /* Companies sent invoices to this customer */
    router.post("/companies/sent", Invoice.companiesSentInvoices);

    /* All the invoices sent to customer based on company id */
    router.post("/sent/all", Invoice.invoices);

    /* Finding out all the invoices raised by a company - Admin usage */
    router.get("/all/admin", Invoice.allInvoices);

    /* Updating a single invoice raised by a company - Admin usage */
    router.put("/all/admin", Invoice.updateAllInvoices);

    /* Searching invoice */
    router.post("/admin/search", [
        check("companyId", "companyId is required").isLength({ min: 1, max: 50 }),
        // check("invoiceDate", "invoiceDate is required").isLength({ min: 1, max: 50 }),
        // check("dateType", "dateType is required").isLength({ min: 1, max: 50 }),
        // check("invoiceAmount", "invoiceAmount is required").isLength({ min: 1, max: 50 }),
        // check("invoiceAmountType", "invoiceAmountType is required").isLength({ min: 1, max: 50 }),
        // check("customerName", "customerName is required").isLength({ min: 1, max: 50 }),
        // check("selectedStatus", "selectedStatus is required").isLength({ min: 1, max: 50 }),
    ], Invoice.searchInvoice);


    // Using router with the endpoints
    app.use(Endpoints.invoice, router);
}