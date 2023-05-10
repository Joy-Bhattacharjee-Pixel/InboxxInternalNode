const upload = require("../middleware/upload");
module.exports = app => {
    const dummy = require("../controllers/dummy.controller");
    const endpoints = require('../endpoints/endpoints');
    var router = require("express").Router();
    // router.post("/", dummy.getData);
    // router.post("/upload", upload.single("file"), dummy.uploadFile);
    router.post("/stripe", dummy.createPayment);
    router.post("/email", dummy.paypalPayments);

    app.use(endpoints.dummyEndpoint, router);
}