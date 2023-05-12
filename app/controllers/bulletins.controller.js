const db = require("../models");
// Importing bulletin module
const Bulletins = db.bulletins;
/* Importing company module */
const Companies = db.companies;


const commonText = require('../commons/common.text');

/* Fetching all bulletins from the server */
exports.getAllbulletins = async (req, res) => {
    /* Validating company id */
    if (!req.query.id) {
        res.send({
            status: 0,
            message: "Company Id is required",
            bulletins: null
        });
    }
    try {
        /* Finding all bulletins from this particular company with company id in query */
        const response = await Bulletins.findAll({ where: { company: req.query.id } });
        res.send({
            status: 1,
            message: "All available bulletins",
            bulletins: response
        });
    } catch (error) {
        res.send({
            status: 0,
            message: error.message || "We faced some issue, please try again later",
            bulletins: null
        });
    }
}

/* Fetching bulletins for the particular customer */
exports.getBulletins = async (req, res) => {
    /* Validating customer id */
    if (!req.query.id) {
        res.send({
            status: 0,
            message: "Customer id is required",
            bulletins: null
        });
    }
    const id = req.query.id;
    try {
        /* Finding out all the bulletins for this customer */
        const response = await Bulletins.findByPk(id);
        res.send({
            status: 1,
            message: `All the bulletins for customer-${id}`,
            bulletins: response
        });
    } catch (error) {
        /* When some error occurs */
        res.send({
            status: 0,
            message: error.message || commonText.errorText,
            bulletins: null
        })
    }
}

/* Creating new bulletins based on company id */
exports.createBulletins = async (req, res) => {
    /* Validating company id */
    if (!req.query.id) {
        /* When company id is null */
        res.send({
            status: 0,
            message: "Company id is required",
            bulletins: null
        });
    }
    /* Company id sent in request */
    const id = req.query.id;
    /* Checking if there is any company associated with this id */
    const company = await Companies.findByPk(id);
    if (!company) {
        /* When there is no company associated with this id */
        res.status(400).send({
            status: 0,
            message: "Company id is required",
            bulletins: null
        });
    } else {
        /* Companies found with this id */
        try {
            /* Fetching all the available bulletins from this company */
            const bulletins = await Bulletins.findAll({ where: { company: id } });
            res.send({
                status: 1,
                message: "Bulletins found",
                bulletins: bulletins
            });
        } catch (error) {
            /* When some error found */
            res.send({
                status: 0,
                message: error.message || commonText.errorText,
                bulletins: null
            })
        }
    }
}

/* Updating a bulletin */
exports.updateBulletin = async (req, res) => {
    /* Validating for bulletin id */
    if (!req.body.id) {
        /* When the bulletin is is null */
        res.send({
            status: 0,
            message: "Bulletin id is required in body",
            bulletins: null
        });
    }
    /* Creating a bulletin update body */
    const body = req.body;
    try {
        /* Updating a bulletin based on bulletin id */
        const response = await Bulletins.update(body, { where: { company: req.body.id } });
        res.send({
            status: 1,
            message: "Bulletin updated successfully",
            bulletins: body
        });
    } catch (error) {
        res.send({
            status: 0,
            message: error.message || commonText.errorText,
            bulletins: null
        })
    }
}