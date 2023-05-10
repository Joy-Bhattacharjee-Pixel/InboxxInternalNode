// Importing middleware-upload
const upload = require("../middleware/upload");

module.exports = app => {
    // Importing invoice controller
    const Invoice = require("../controllers/invoice.controller");
    // Importing endpoints
    const Endpoints = require("../endpoints/endpoints");
    // Importing router
    const router = require("express").Router();
    // Uploading the file to the dropbox
    router.post("/uploadSheet", upload.single("file"), Invoice.uploadCustomerSheet);
    // Uploading invoice sheet
    router.post("/uploadInvoiceSheet", upload.single("file"), Invoice.uploadInvoiceSheet);
    router.post("/editInvoiceSheet", upload.single("file"), Invoice.editExcelSheet);

    // Using router with the endpoints
    app.use(Endpoints.invoice, router);
}