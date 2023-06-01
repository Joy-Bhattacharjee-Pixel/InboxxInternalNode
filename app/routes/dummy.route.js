const upload = require("../middleware/upload");
const sendEmail = require('../commons/send.email');

module.exports = app => {
    const dummy = require("../controllers/dummy.controller");
    const endpoints = require('../endpoints/endpoints');
    var router = require("express").Router();
    // router.post("/", dummy.getData);
    // router.post("/upload", upload.single("file"), dummy.uploadFile);
    // router.post("/stripe",sendEmail.sendMail);
    // router.post("/email", dummy.paypalPayments);

    /* this api only for testing - sending email */
    router.get("/test-email", dummy.sendEmail);

    app.use(endpoints.dummyEndpoint, router);
}