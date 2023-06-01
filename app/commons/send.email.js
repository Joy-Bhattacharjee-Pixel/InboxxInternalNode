const nodemailer = require("nodemailer");

// async..await is not allowed in global scope, must use a wrapper
exports.sendMail = async (mailSubject, mailText, attachment, emails) => {
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
            attachments: attachment != null ? [{ 'filename': 'attachment.pdf', 'content': attachment }] : null,
            
        });
        console.log("Message sent: %s", info.messageId);

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))

    } catch (error) { };
}

