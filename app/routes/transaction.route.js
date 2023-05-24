module.exports = app => {
    const transaction = require("../controllers/transaction.controller");
    const endpoint = require('../endpoints/endpoints').transaction;
    var router = require("express").Router();
    
    /* fetching all transactions for a particular company */
    router.get("/admin", transaction.getTransactions);

    /* fetching all keys for a particular company */
    router.get("/keys", transaction.getAllKeys);
    
    app.use(endpoint, router);
}