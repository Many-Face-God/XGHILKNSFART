// Imports
// Libraries and Frameworks
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const compress = require("compression");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");

// Files
const config = require("./config/config");

// Routes
const userRoutes = require("./routes/user.routes");
const examRoutes = require("./routes/exam.routes");
const pictureRoutes = require("./routes/picture.routes");
const verificationRoute = require("./routes/verification.routes");
const flagRoutes = require("./routes/flag.routes");
const resultRoutes = require("./routes/result.routes");
const planRoutes = require("./routes/plan.routes");
const transactionRoutes = require("./routes/transaction.routes");
const paymentRoutes = require("./routes/payment.routes");
const selfEnrollmentRoutes = require("./routes/selfEnrollment.routes");
const theoryRoutes = require("./routes/theory.routes");
const markRoutes = require("./routes/mark.routes");
//end

const CURRENT_WORKING_DIR = process.cwd();
const app = express();

// Mongodb Connection
mongoose.Promise = global.Promise;
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
mongoose.connection.on("error", () => {
  throw new Error(`unable to connect to database: ${config.mongoUri}`);
});

//development logs
app.use(morgan("dev"));
// parse body params and attache them to req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// allow file upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, "temp"),
  })
);

app.get("/", (req, res) => {
  res.status(200).json({
    type: "Success",
    message: "The operation was successful",
  });
});

app.use("/", express.static(path.join(CURRENT_WORKING_DIR, "public")));

// Mount Routes

app.use("/api/user", userRoutes);
app.use("/api/exam", examRoutes);
app.use("/verify", verificationRoute);
app.use("/api/photo", pictureRoutes);
app.use("/api/flags", flagRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/selfenrollment", selfEnrollmentRoutes);
app.use("/api/theory", theoryRoutes);
app.use("/api/mark", markRoutes);

app.use("/api/health", (req, res) => {
  return res.status(200).json({
    type: "Success",
    message: "The operation was successful",
  });
});

// Catch unauthorised errors
app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ error: err.name + ": " + err.message });
  } else if (err) {
    res.status(400).json({ error: err.name + ": " + err.message });
    console.log(err);
  }
});

const server = app.listen(config.port, (err) => {
  if (err) {
    console.log(err);
  }
  console.info("Server started on port %s.", config.port);
});

module.exports = app;
