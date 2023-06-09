const db = require("../models");
// Importing bulletin module
const Bulletins = db.bulletins;
/* Importing company module */
const Companies = db.companies;
/* Importing customer module */
const Customer = db.customers;
/* Importing query types */
const { QueryTypes } = require('sequelize');
const Sequelize = db.sequelize;

const commonText = require('../commons/common.text');

/* importing notification controller */
const Notification = require('../controllers/notification.controller');

const mail = require('../commons/send.email');

/* importing pagination module */
const pagination = require('../commons/pagination');

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

    const { page } = req.query;
    const { limit, offset } = pagination.getPagination(page, 10);

    try {
        /* Finding all bulletins from this particular company with company id in query */
        const response = await Bulletins.findAndCountAll({ where: { companyId: req.query.id }, limit, offset });
        res.send({
            status: 1,
            message: "All available bulletins",
            data: pagination.getPagingDataBulletins(response, page, limit)

        });
    } catch (error) {
        res.send({
            status: 0,
            message: error.message || "We faced some issue, please try again later",
            bulletins: null
        });
    }
}

/* search bulletins */
exports.searchAllBulletins = async (req, res) => {
    /* Validating company id */
    if (!req.query.id) {
        res.send({
            status: 0,
            message: "Company Id is required",
            bulletins: null
        });
    }

    if (!req.query.keyword) {
        res.send({
            status: 0,
            message: "Search keyword is required",
            bulletins: null
        });
    }
    /* Keyword send by company to search bulletins */
    const keyword = req.query.keyword;

    try {
        /* Finding all bulletins from this particular company with company id in query */
        const response = await Bulletins.findAll({ where: { companyId: req.query.id } });
        /* When keyword is available */
        let searchedBulletins = [];
        response.forEach(bulletin => {
            if (bulletin.title.toLowerCase().includes(keyword.toLowerCase())) {
                searchedBulletins.push(bulletin);
            }
        });
        res.send({
            status: 1,
            message: "All available bulletins",
            bulletins: searchedBulletins
        });
    } catch (error) {
        res.send({
            status: 0,
            message: error.message,
            bulletins: null
        })
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
        const response = await Bulletins.findAll();
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

/* Fetching bulletins for the particular customer - UPDATED */
exports.getBulletinsUpdate = async (req, res) => {
    /* Validating customer id */
    if (!req.query.id) {
        res.send({
            status: 0,
            message: "Customer id is required",
            bulletins: null
        });
    }
    /* Fetching customer details from customer table */
    const customer = await Customer.findByPk(req.query.id);
    if (!customer) {
        /* If customer not found */
        res.send({
            status: 0,
            message: "No customer found with this id",
            bulletins: null
        })
    }
    else {
        /* Found customer email */
        const email = customer.email;
        /* Raw SQL query for searching distinct companies from invoice table based on customer email*/
        const companiesSentBulletinsQuery = `SELECT DISTINCT companyId FROM invoices where billedToEmailID = '${email}'`;
        /* Performing SQL query */
        const companiesSentBulletins = await db.sequelize.query(companiesSentBulletinsQuery, { type: QueryTypes.SELECT });
        if (companiesSentBulletins.length == 0) {
            /* When there is no company associated with this email */
            res.send({
                status: 1,
                message: "All Bulletins",
                bulletins: []
            })
        }
        else {
            /* All the company  */
            let companyIds = [];
            companiesSentBulletins.forEach(company => {
                companyIds.push(company.companyId);
            });
            const response = await Bulletins.findAll({
                include: ["company"],
                where: Sequelize.or(
                    { companyId: companyIds })
            });
            res.send({
                status: 1,
                message: "Bulletins Found",
                bulletins: response
            });
        }

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
            const bulletins = await Bulletins.create(req.body);

            /* notification title */
            const notificationTitle = "A new bulletin published";
            /* noticiation body */
            const notificationBody = req.body.title;
            /* route */
            const notificationRoute = "/bulletins";

            const customerEmailsQuery = `SELECT DISTINCT billedToEmailID FROM invoices where companyId = ${id}`;
            /* performing SQL query */
            const customerEmails = await db.sequelize.query(customerEmailsQuery, { type: QueryTypes.SELECT });

            /* customer emails in array */
            let customerEmailArray = [];
            customerEmails.forEach(email => {
                customerEmailArray.push(email.billedToEmailID);

                /* sending email to respective customer - Creating invoices */
                /* create invoice mail subject */
                const createInvoiceMailSubject = `A new bulletin published`;
                /* create invoice mail text */
                const createInvoiceMailText = `Hi, We have created a bulletin for you`;
                /* Sending mail to the customers */
                mail.sendMail(createInvoiceMailSubject, createInvoiceMailText, email.billedToEmailID);

            });

            /* finding customers with the email */
            const customers = await Customer.findAll({
                where: Sequelize.or(
                    { email: customerEmailArray })
            });

            /* finding out all the push tokens */
            let pushTokens = [];

            customers.forEach(customer => {
                if (customer.pushToken != null && customer.pushToken != "") {
                    pushTokens.push(customer.pushToken)
                }
            });

            /* sending notification to the customers */
            await Notification.sendNotification(notificationTitle, notificationBody, notificationRoute, pushTokens);

            res.send({
                status: 1,
                message: "Bulletin Created",
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
        await Bulletins.update(body, { where: { id: req.body.id } });
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

