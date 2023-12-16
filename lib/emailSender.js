const nodemailer = require("nodemailer");
require("dotenv").config();
const { EMAIL_USER, EMAIL_PASSWORD, EMAIL_SERVER } = process.env;

exports.sendMail = async (msg, subject, receiver) => {
  try {
    const transporter = nodemailer.createTransport({
      host: EMAIL_SERVER,
      port: 465,
      secure: true,
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: '"Proctorme" <hr@proctorme.com>',
      subject: subject,
      html: msg,
      to: receiver,
    });

    return `Message sent', ${nodemailer.getTestMessageUrl(info)}`;
  } catch (err) {
    return responseHandler(res, 500, "Server Error");
  }
};
