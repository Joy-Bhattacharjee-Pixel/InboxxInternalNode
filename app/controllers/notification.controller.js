/* importing db module */
const db = require("../models");

/* import sequealize */
const Sequelize = db.Sequelize;

/* importing notification module */
const Notification = db.notifications;

/* importing company controller */
const Company = require('../controllers/company.controller');

/* importing customer module */
const Customer = db.customers;

/* importing admin module */
const admin = require("firebase-admin");

/* importing fcm module */
var fcm = require('fcm-notification');

/* importing service account json */
const serviceAccount = require("../configs/inboxx-1a3ae-firebase-adminsdk-8ye54-c3d2d4731e.json");

/* creating cert path */
const certPath = admin.credential.cert(serviceAccount);

/* importing fcm module */
var FCM = new fcm(certPath);

/* sending notification to the customers */
exports.sendNotification = async (title, body, route, tokens) => {
    /* notification message */
    const message = {
        data: {
            title: title,
            body: body,
            route: route
        },
        notification: {
            title: null,
            body: null
        }
    };

    try {
        /* sending notifications to multiple tokens at once */
        FCM.sendToMultipleToken(message, tokens, function (err, response) {
            if (err) {
                console.log('err--', err);
            } else {
                console.log('response-----', response);
            }

        });
    } catch (error) {
        console.log('err--', error);
    }
}

/* creating notification from admin panel - ADMIN */
exports.create = async (req, res) => {
    /* notification body */
    const body = req.body;

    /* company id */
    const companyId = body.companyId;

    /* notification title */
    const title = body.title;

    /* notification message */
    const message = body.message;

    /* notification route */
    const route = body.route;

    /* sending notification to customers */
    const customerEmails = await Company.customers(companyId);

    /* all push tokens available */
    let allTokens = [];

    /* looping through every customer */
    let customerEmailArray = [];

    customerEmails.forEach(cust => {
        customerEmailArray.push(cust.billedToEmailID);
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

    /* sending notification to customer */
    this.sendNotification(title, message, route, pushTokens);

    try {
        /* creating notification to notification table */
        const response = await Notification.create(body);
        res.send("response");
    } catch (error) {
        res.send(error.message);
    }
}