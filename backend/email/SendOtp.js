const { Resend } = require("resend");
const dotenv = require("dotenv");
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOtpEmail = async (email, otp) => {
    try {
        const data = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Your OTP for Email Verification",
            html: `
                <h2>Your OTP is: ${otp}</h2>
                <p>OTP valid for 5 minutes</p>
            `
        });
        console.log("Email sent:", data);
    } catch (err) {
        console.log("FULL MAIL ERROR:", err);
        throw err;
    }
};