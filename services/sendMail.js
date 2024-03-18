const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "gmail",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.USER, //user and password gmail account
    pass: process.env.PASSWORD_APP,
  },
});

const mailOptions = {
  from: {
    name: "Tyson Quach",
    address: process.env.USER,
  },
  to: "quachhungtai29@gmail.com",
  subject: "Send mail from server",
  text: "Hello there",
  html: "<b>Hello Tai Quach</b>",
};
const sendMail = async (transporter, mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    console.log("send success");
  } catch (error) {
    console.log(error);
  }
};

// sendMail(transporter, mailOptions);

module.exports = { transporter, mailOptions, sendMail };
