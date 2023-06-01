var fetch = require('isomorphic-fetch');
var Dropbox = require('dropbox').Dropbox;
var fs = require('fs');
const sendEmail = require('../commons/send.email');


// const path = require('path');
// exports.getData = async (req, res) => {
//     var dbx = new Dropbox({ accessToken: 'sl.BbipTKwdejOdQRs9kA5a6VsBWSCz7xx422UyxI75LXvGymBu3gxrogCLpqJijdD5ELSgTIMx5HxejdrX7zaNxZcc7dj0Drp5Bd0yS-Xr5HyGNuRaY0pK3J-o3vuN9Y6CKVOzt0u2KQ3k', fetch: fetch });
//     // try {
//     // const data = await dbx.fileRequestsCreate({
//     //     "deadline": {
//     //         "allow_late_uploads": "seven_days",
//     //         "deadline": "2023-12-12T17:00:00Z"
//     //     },
//     //     "destination": "/File Requests/test",
//     //     "open": true,
//     //     "title": "Homework submission"
//     // });
//     // fs.readFile(path.resolve(path.dirname('')) + "/resources/static/assets/uploads/1680072447381-inboxx-dummy.xlsx", 'utf8', async function (err, data) {
//     //     try {
//     //         const dataResponse = await dbx.filesUpload({ path: '/File Requests/customers/' + data.name, contents: data });
//     //         console.log(dataResponse);
//     //         res.send(dataResponse);
//     //     } catch (error) {
//     //         console.log(error);
//     //         res.send(error);
//     //     }
//     // });


//     // const userDetails = fs.readFileSync("./dummy.xlsx");
//     // try {
//     //     const dataResponse = await dbx.filesUpload({ path: '/File Requests/customers/abcd.xlsx' , contents: userDetails });
//     //     res.send(dataResponse);
//     // } catch (error) {
//     //     res.send(error);
//     // }


//     const userDetails = fs.readFileSync(path.resolve(path.dirname('')) + "/resources/static/assets/uploads/dummy.xlsx");
//     try {
//         const dataResponse = await dbx.filesUpload({ path: '/File Requests/customers/abcd2.xlsx', contents: userDetails });
//         res.send(dataResponse);
//     } catch (error) {
//         res.send(error);
//     }



//     // } 
//     // catch (error) {
//     //     res.send(error)
//     // }
// }

// exports.uploadFile = async (req, res) => {
//     var dbx = new Dropbox({ accessToken: 'sl.BbipTKwdejOdQRs9kA5a6VsBWSCz7xx422UyxI75LXvGymBu3gxrogCLpqJijdD5ELSgTIMx5HxejdrX7zaNxZcc7dj0Drp5Bd0yS-Xr5HyGNuRaY0pK3J-o3vuN9Y6CKVOzt0u2KQ3k', fetch: fetch });
//     const userDetails = fs.readFileSync(path.resolve(path.dirname('')) + "/resources/static/assets/uploads/" + req.file.filename);

//     try {
//         const dataResponse = await dbx.filesUpload({ path: '/File Requests/customers/customer.xlsx', contents: userDetails });
//         res.send(dataResponse);
//     } catch (error) {
//         res.send(error);
//     }

// }

// // const stripe = require('stripe');
// const stripe = require('stripe')('sk_test_51MsfzPSGdLbLtRnAQ4gAgTL9NkE2xcCQg6a207gTBncEZjzRPMjxqCNrRVgcygUel4KssfZNLP6poURBJST56ApS009aBoC0sk');
// // const data = stripe.Stripe('sk_test_51MsfzPSGdLbLtRnAQ4gAgTL9NkE2xcCQg6a207gTBncEZjzRPMjxqCNrRVgcygUel4KssfZNLP6poURBJST56ApS009aBoC0sk')

// exports.stripePayment = async (req, res) => {
//     // const account = await stripe.accounts.create({
//     //     type: 'standard',
//     //     country: 'IN',
//     //     email: 'jenny.rosen@example.com',
//     //     external_account: {
//     //         object: "bank_account",
//     //         country: "IN",
//     //         currency: "inr",
//     //         account_holder_name: "Jane Austen",
//     //         account_holder_type: "individual",
//     //         account_number: "000123456789",
//     //         routing_number:"HDFC0000261",
//     //         bank_name: "STRIPE TEST BANK",
//     //     }
//     // });
//     // res.send(account);
//     // const transfer = await stripe.transfers.create({
//     //     amount: 400,
//     //     currency: 'inr',
//     //     destination: 'acct_1Mt21ZSI8HcvY5dj',
//     //     transfer_group: 'ORDER_95',
//     //   });
//     //   res.send(transfer);
//     const stripe = require('stripe')('sk_test_Ma7vvXxqIKxpUoHmFNFv2oYt00u1nVjNkF');


// const customers = await stripe.customers.list({
//   limit: 3,
// });
// res.send(customers)
// }


const stripe = require('stripe')('sk_test_Ma7vvXxqIKxpUoHmFNFv2oYt00u1nVjNkF');

exports.createPayment = async (req, res) => {
    // Create a customer
    // const customer = await stripe.customers.create({
    //     description: 'First Customer',
    //     email: req.body.email,
    //     name: req.body.name,
    //     phone: req.body.phone
    // });
    // const ephemeralKey = await stripe.ephemeralKeys.create(
    //     { customer: customer.id },
    //     { apiVersion: '2022-11-15' }
    // );



    // // Payment intent
    // const paymentIntent = await stripe.paymentIntents.create({
    //     amount: 1099,
    //     currency: 'eur',
    //     customer: customer.id,
    //     automatic_payment_methods: {
    //         enabled: true,
    //     },
    // });

    // // // Creating stripe token
    // // const token = await stripe.tokens.create({
    // //     card: {
    // //         name: req.body.name,
    // //         number: "4242 4242 4242 4242",
    // //         exp_month: "12",
    // //         exp_year: "2034",
    // //         cvc: "444"
    // //     }
    // // });

    // // const card = await stripe.customers.createSource(customer.id, { source: `${token.id}` });

    // // // Creating charge object
    // // const charge = await stripe.charges.create({
    // //     amount: 2000,
    // //     currency: 'usd',
    // //     card: card.id,
    // //     customer: customer.id,
    // //     receipt_email: "joy.bhattacharjee@pixelconsultancy.in",
    // // });

    // // res.send(charge);
    // res.send({
    //     paymentIntent: paymentIntent.client_secret,
    //     ephemeralKey: ephemeralKey.secret,
    //     customer: customer.id
    // });

    // const product = await stripe.products.create({
    //     name: 'Gold Special',
    // });

    // const price = await stripe.prices.create({
    //     currency: 'inr',
    //     unit_amount: 2500,
    //     product: product.id,
    // });

    // const paymentLink = await stripe.paymentLinks.create({
    //     line_items: [{ price: price.id, quantity: 1 }],
    // });

    // res.send(paymentLink);






    // const newcustomer = await stripe.customers.create({
    //     email:"joy@gmail.com",
    //     description: 'My First Test Customer (created for API docs at https://www.stripe.com/docs/api)',
    //   });
    // const customers = await stripe.customers.list();

    // const customer = customers.data[0];

    // const ephemeralKey = await stripe.ephemeralKeys.create(
    //     { customer: customer.id },
    //     { apiVersion: '2022-08-01' }
    //   );

    //   const paymentIntent = await stripe.paymentIntents.create({
    //     amount: 5099,
    //     currency: 'usd',
    //     customer: customer.id,
    //     shipping: {
    //       name: 'Jane Doe',
    //       address: {
    //         state: 'Texas',
    //         city: 'Houston',
    //         line1: '1459  Circle Drive',
    //         postal_code: '77063',
    //         country: 'US',
    //       },
    //     },
    //     // Edit the following to support different payment methods in your PaymentSheet
    //     // Note: some payment methods have different requirements: https://stripe.com/docs/payments/payment-methods/integration-options
    //     payment_method_types: [
    //       'card',
    //       // 'ideal',
    //       // 'sepa_debit',
    //       // 'sofort',
    //       // 'bancontact',
    //       // 'p24',
    //       // 'giropay',
    //       // 'eps',
    //       // 'afterpay_clearpay',
    //       // 'klarna',
    //       // 'us_bank_account',
    //     ],
    //   });
    //    res.json({
    //     paymentIntent: paymentIntent.client_secret,
    //     ephemeralKey: ephemeralKey.secret,
    //     customer: customer.id,
    //   });

    // const data = await stripe.paymentIntents.retrieve(
    //     'pi_3N8KBIHI77ODInZe1Ez1TYaR'
    //   );
    //   res.send(data)
    const data = await sendEmail.sendMail(req, res);
}
const paypal = require('paypal-rest-sdk');
const mail = require('../commons/send.email');
exports.paypalPayments = async (req, res) => {
    mail.sendMail;
}

const email = require("../commons/send.email");

/* sending test email */
exports.sendEmail = async (req, res) => {
    const emails = ["joy.bhattacharjee@pixelconsultancy.in", "surajit@pixelconsultancy.in"];
    const mailSubject = "This is for testing CRON";
    const mailText = "This is the mail text for testing CRON from Digital Ocean";
    try {
        await email.sendMail(mailSubject, mailText, null, emails);
        res.send("Emails send successfully");
    } catch (error) {
        res.send(error || "Error");
    }
}