const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

exports.sendOtpEmail = async (email, otp) => {
    try {
        const response = await axios.post(
            "https://api.brevo.com/v3/smtp/email",
            {
                sender: {
                    name: "chatApp",
                    email: process.env.BREVO_SENDER_EMAIL
                },
                to: [{ email: email }],
                subject: "Your OTP for Email Verification",
                htmlContent: `
                    <h2>Your OTP is: ${otp}</h2>
                    <p>OTP valid for 5 minutes</p>
                `
            },
            {
                headers: {
                    "api-key": process.env.BREVO_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("Email sent:", response.data);

    } catch (err) {
        console.log("FULL MAIL ERROR:", err.response?.data || err.message);
        throw err;
    }
};