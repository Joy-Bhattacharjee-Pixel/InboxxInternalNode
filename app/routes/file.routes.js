module.exports = app => {
    const file = require("../controllers/file.controller");
    const endpoints = require('../endpoints/endpoints');
    var router = require("express").Router();
    router.get("/:id", file.getFile);
    app.use(endpoints.file, router);
}