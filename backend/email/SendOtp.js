const Brevo = require("@getbrevo/brevo");
const dotenv = require("dotenv");
dotenv.config();

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

exports.sendOtpEmail = async (email, otp) => {
    try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();

        sendSmtpEmail.subject = "Your OTP for Email Verification";
        sendSmtpEmail.htmlContent = `
            <h2>Your OTP is: ${otp}</h2>
            <p>OTP valid for 5 minutes</p>
        `;
        sendSmtpEmail.sender = { 
            name: "chatApp", 
            email: process.env.BREVO_SENDER_EMAIL
        };
        sendSmtpEmail.to = [{ email: email }];

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log("Email sent:", data);

    } catch (err) {
        console.log("FULL MAIL ERROR:", err);
        throw err;
    }
};