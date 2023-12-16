const XLSX = require("xlsx");

const exportSheet = (aoa) => {
  /* generate a worksheet from a collection */
  aoa.forEach((x) => delete x._id);
  const ws = XLSX.utils.json_to_sheet(aoa);
  return ws;
};

module.exports = { exportSheet };

// //Export in Excel format,csv or pdf format
// const fs = require("fs");
// const resultCsv = fs.createWriteStream("candidateList.csv");

// fastcsv
//   .write(examCandidate, { headers: true })
//   .on("finish", () => {
//     console.log(`Export Complete!`);
//   })
//   .pipe(resultCsv);
