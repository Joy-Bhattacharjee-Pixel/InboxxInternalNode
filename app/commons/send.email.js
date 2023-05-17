const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
exports.sendMail = async (mailSubject, mailText, emails) => {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // let testAccount = await nodemailer.createTestAccount();
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'joybhatta1000@gmail.com',
            pass: 'aeuycpjnrlfafgri'
        }
    });

    // send mail with defined transport object
    try {
        let info = await transporter.sendMail({
            from: 'joybhatta1000@gmail.com', // sender address
            to: emails, // list of receivers
            subject: mailSubject, // Subject line
            text: mailText, // plain text body
            // html: '<img alt="Post" src="https://cdn.dribbble.com/userupload/5343802/file/original-bbabbd2090da8b8b61984d0db0a265bc.jpg?compress=1&resize=1200x900" style="display: block; height: 1000; border: 0; width: 1512; max-width: 100%;" title="Post" width="270"/>', // html body
        });
        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))

    } catch (error) { };
}

