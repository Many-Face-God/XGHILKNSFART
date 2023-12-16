const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const validateSpreadSheet = async (req, res, next) => {
  const exam_id = req.params.id;
  try {
    // Check if a file is uploaded
    if (!req.files) {
      console.log("found");
      return res
        .status(400)
        .json({ type: "failure", message: `Please upload an image` });
    }

    const file = req.files.sheet;

    // Check if the uploaded file is an excel file
    if (!file.mimetype.startsWith("application/vnd.ms-excel")) {
      if (
        !file.mimetype.startsWith(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
      ) {
        return res
          .status(400)
          .json({ type: "failure", message: `Please upload an excel file` });
      }
    }
    // check file extension
    var extension = `${path.parse(file.name).ext}`;
    if (!extension.startsWith(".xls")) {
      return res
        .status(400)
        .json({ type: "failure", message: `Please upload an excel file` });
    }

    // Rename the file
    // add a random number
    file.name = `excel_${exam_id}_${file.name}_${path.parse(file.name).ext}`;

    // await file.mv(`${"./public/uploads/excel"}/${file.name}`);

    const workbook = XLSX.readFile(file.tempFilePath);

    const wsname = workbook.SheetNames[0];
    const ws = workbook.Sheets[wsname];

    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    data.shift();

    if (data.length <= 0) {
      return res.status(400).json({
        type: "failure",
        message: "Excel sheet is empty",
      });
    }
    req.array = data;

    deleteFile(file.tempFilePath);

    next();
  } catch (err) {
    deleteFile(file.tempFilePath);
    console.log(err);
    //remove temp file or excel file
    return res.status(500).json({
      type: "success",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

module.exports = {
  validateSpreadSheet,
};

const deleteFile = (path) => {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    console.log(err);
  }
};
