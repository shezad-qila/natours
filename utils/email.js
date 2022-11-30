const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url){
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Shehzad <${process.env.EMAIL_FROM}>`;
    }

    newTransport(){
        if(process.env.NODE_ENV === 'production'){
            // Sendgrid
            return 1;
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    async send(template, subject){
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.fromString(html)
        };
        
        await this.newTransport().sendMail(mailOptions);
    }


    async sendWelcome(){
        await this.send('welcome', 'Welcome to the Natours Family');
    }

    async sendResetPassword(){
        await this.send('passwordReset', 'reset Password only valid for 10 minutes.');
    }
}

// const sendEmail = async params => {

//     // var transport = nodemailer.createTransport({
//     //     host: "smtp.mailtrap.io",
//     //     port: 2525,
//     //     auth: {
//     //         user: "a7ee2db2981e50",
//     //         pass: "5eaf29fe72c458"
//     //     }
//     // });

//     // set params
//     const mailOptions = {
//         from: 'Shehzad <mohdshahzad95@gmail.com>',
//         to: params.email,
//         subject: params.subject,
//         text: params.message
//     };

//     // send mail
//     await transport.sendMail(mailOptions);
// };

// module.exports = sendEmail;