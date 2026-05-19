const nodemailer = require("nodemailer")
const dotenv = require("dotenv")

dotenv.config()

// ================= TRANSPORTER =================
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,

    auth: {
        user: process.env.Email_User,
        pass: process.env.Email_Pass
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
})
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

        console.log("Send mail error:", err.message)

        throw new Error("Failed to send OTP email")
    }
}