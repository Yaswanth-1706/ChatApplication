const { TransactionalEmailsApi, SendSmtpEmail, ApiClient } = require("@getbrevo/brevo");
const dotenv = require("dotenv");
dotenv.config();

const apiClient = ApiClient.instance;
apiClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new TransactionalEmailsApi();

exports.sendOtpEmail = async (email, otp) => {
    try {
        const sendSmtpEmail = new SendSmtpEmail();

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