module.exports = app => {
    const file = require("../controllers/file.controller");
    const endpoints = require('../endpoints/endpoints');
    var router = require("express").Router();
    router.get("/:id", file.getFile);
    router.get("/uploads/:id", file.getFile2);
    app.use(endpoints.file, router);
}