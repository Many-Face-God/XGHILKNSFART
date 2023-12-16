require("dotenv").config();
const config = {
  candidateLogin: process.env.CANDIDATE_LOGIN || "exam.proctorme.com",
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
  mongoUri: process.env.MONGODB_URI || "mongodb://localhost:27017/proctormedb",
  email: process.env.EMAIL,
  password: process.env.PASSWORD,
  saltRounds: process.env.SALTROUNDS || 12,
  smtpPort: process.env.SMTP_PORT || 587,
  authPrefix: process.env.AUTH_HEADER_PREFIX || "BEARER",
  mailServer: process.env.MAIL_SERVER,
  storageBucket: process.env.BUCKET_URL,
  clientUrl: process.env.CLIENT_URL,
};

module.exports = config;
// || "smtp.eu.mailgun.org",
