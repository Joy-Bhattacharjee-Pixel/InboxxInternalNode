/* importing db module */
const db = require("../models");

/* importing notification module */
const Notification = db.notifications;

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
            title: "null",
            body: "null"
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
        console.log('err--', err);
    }
}