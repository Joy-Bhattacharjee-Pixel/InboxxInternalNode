/* importing express validator */
const { check, validationResult } = require('express-validator');

module.exports = app => {
    const notifications = require("../controllers/notification.controller");
    const endpoints = require('../endpoints/endpoints');
    var router = require("express").Router();

    /* creating notification */
    router.post("/create", [
        check("companyId", "companyId is required").isLength({ min: 1, max: 50 }),
        check("title", "title is required").isLength({ min: 1, max: 50 }),
        check("message", "message is required").isLength({ min: 1, max: 50 })
    ], notifications.create);

    app.use(endpoints.notification, router);
}