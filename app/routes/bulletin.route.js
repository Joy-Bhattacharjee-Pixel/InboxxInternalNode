module.exports = app => {
    const bulletins = require("../controllers/bulletins.controller");
    const endpoints = require('../endpoints/endpoints');
    var router = require("express").Router();

    /* Fetching all bulletins from a company - Admin */
    router.get("/all", bulletins.getAllbulletins);

    /* Searching all bulletins from a company - Admin */
    router.get("/all/search", bulletins.searchAllBulletins);

    /* Getting bulletins for a single customer based on customer id */
    router.get("/", bulletins.getBulletinsUpdate);
    
    /* Adding new bulletins data */
    router.post("/create", bulletins.createBulletins);

    // Updating bulletins data
    router.put("/update", bulletins.updateBulletin);
    
    app.use(endpoints.bulletins, router);
}