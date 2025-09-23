const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");
const sendEmailToResetPassword = async (username, email, link) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_APP
      }
    });

     const templatePath = path.join(__dirname, "../", "views", "resetPasswordEmail.ejs");
     const htmlContent = await ejs.renderFile(templatePath, { username, link });

    let info = await transporter.sendMail({
      from: '"My App" <taskFlow@gmail.com>',
      to: email,
      subject: "Reset password",
      html: htmlContent,
    });

    console.log("message sent successfully");
  } catch (err) {
    console.error("error", err);
  }
}

const sendEmailToVerifyAccount = async (username, email, link) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD_APP}
    });

     const templatePath = path.join(__dirname, "../", "views", "verify-email.ejs");
     const htmlContent = await ejs.renderFile(templatePath, { username, link });

    let info = await transporter.sendMail({
      from: '"My App" <taskFlow@gmail.com>',
      to: email,
      subject: "Verify Account",
      html: htmlContent,
    });

    console.log("message sent successfully");
  } catch (err) {
    console.error("error", err);
  }}

module.exports = {
    sendEmailToResetPassword,
    sendEmailToVerifyAccount,
};