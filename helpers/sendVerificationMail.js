let nodemailer = require("nodemailer");
let config = require("../config/config");

console.log("Configuring mail server");
let transporter = nodemailer.createTransport({
  host: config.mailServer, //replace with your email provider
  port: config.smtpPort,
  secure: true,
  auth: {
    user: config.email,
    pass: config.password,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.log(error.message, "Error verifying mail transporter");
  } else {
    console.log("Success connecting to mail server", success);
  }
});

const sendMail = async (msg, subject, reciever) => {
  //2. You can configure the object however you want
  try {
    let mail = {
      from: "Noreply@proctorme.com",
      to: reciever,
      subject: subject,
      html: msg,
    };
    //3.
    let info = await transporter.sendMail(mail);
    // console.log("Message sent: %s", info.messageId);
    return info.messageId;
  } catch (err) {
    console.log(`error sending mail to user ${reciever}`);
    console.log(err);
    return false;
  }
};

module.exports = sendMail;
