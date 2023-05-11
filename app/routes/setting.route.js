module.exports = app => {
    const settings = require("../controllers/settings.controller");
    const endpoints = require('../endpoints/endpoints');
    var router = require("express").Router();
    // Getting settings data 
    router.get("/", settings.getSettings);
    // Adding settings data
    router.post("/", settings.addSettings);
    // Updating settings data
    router.put("/", settings.updateSettings);
    
    app.use(endpoints.settings, router);
}