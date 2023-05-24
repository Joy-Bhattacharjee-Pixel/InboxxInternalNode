/* importing db module */
const db = require("../models");

/* importing transaction model */
const Transactions = db.transactions;

/* importing payment keys model */
const PaymentKeys = db.paymentKeys;

/* getting all the transaction for a particular company - ADMIN */
exports.getTransactions = async (req, res) => {
    /* id in query */
    const id = req.query.id;

    /* validating company id */
    if (!id) {
        res.status(400).send({
            status: 400, message: "company id required", transactions: null
        })
    }

    try {
        const response = await Transactions.findAll({ where: { companyId: id } });
        res.send({
            status: 1,
            message: "All transactions",
            transactions: response
        })
    } catch (error) {
        res.send({
            status: 0,
            message: error.message || "Error",
            transactions: null
        })
    }
}

/* get all the keys added for the particular company */
exports.getAllKeys = async (req, res) => {
    /* id in query */
    const id = req.query.id;

    /* validating company id */
    if (!id) {
        res.status(400).send({
            status: 400, message: "company id required", response: null
        })
    }

    try {
        const response = await PaymentKeys.findAll({ where: { companyId: id } });
        if (response.length != 0) {
            res.send(response[0]);
        }
        else {
            res.send(null);
        }
    } catch (error) {
        res.send(error.message);
    }
}

/* search transactions */
exports.search = async (req, res) => {
    try {
        const response = await Transactions.findAll({ where: { companyId: req.body.companyId } });
        let transactions = [];
        response.forEach(trans => {
            if (trans.transactionId.toLowerCase().includes(req.body.transId.toLowerCase())) {
                transactions.push(trans);
            }
        });
        res.send({
            status: 1,
            message: "All transactions",
            transactions: transactions
        });
    } catch (error) {
        res.send({
            status: 0,
            message: error.message || "Error",
            transactions: null
        });
    }
}