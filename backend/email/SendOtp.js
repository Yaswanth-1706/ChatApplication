const nodemailer = require("nodemailer")
const dotenv = require("dotenv")

dotenv.config()

// ================= TRANSPORTER =================

const dns = require("dns")

const transporter = nodemailer.createTransport({
    host: "74.125.130.108",  // smtp.gmail.com IPv4
    port: 587,
    secure: false,
    auth: {
        user: process.env.Email_User,
        pass: process.env.Email_Pass
    },
    tls: {
        rejectUnauthorized: false,
        servername: "smtp.gmail.com"  // Required for TLS cert validation
    }
});
// ================= SEND OTP EMAIL =================
exports.sendOtpEmail = async (email, otp) => {
    try {

        const info = await transporter.sendMail({
            from: process.env.Email_User,
            to: email,
            subject: "Your OTP for Email Verification",
            html: `
                <h2>Your OTP is : ${otp}</h2>
                <p>OTP valid for 5 minutes</p>
            `
        })

        console.log("Email sent:", info.response)

    } catch (err) {

    console.log("FULL MAIL ERROR:", err)

    throw err
}
    }
