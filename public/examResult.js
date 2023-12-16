module.exports = (
  firstName,
  totalQuestions,
  attemptedQuestion,
  questionSkipped,
  pointDeducted,
  totalPoints,
  percentage,
  examTitle
) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Proctorme</title>

    <style>
      /* Reset styles */
      body {
        margin: 0;
        padding: 0;
        width: 100% !important;
        height: 100% !important;
      }
    </style>
  </head>
  <body>
    <table
      width="100%"
      align="center"
      border="0"
      cellpadding="0"
      cellspacing="0"
    >
      <tbody>
        <tr>
          <td>
            <table
              border="0"
              cellpadding="10"
              cellspacing="0"
              width="100%"
              align="center"
              style="border-bottom: 3px solid #0d102e"
            >
              <tbody>
                <tr>
                  <td align="center" bgcolor="#FAFAFA">
                    <table
                      border="0"
                      align="center"
                      cellpadding="0"
                      cellspacing="0"
                    >
                      <tbody>
                        <tr>
                          <!-- <td height="30"></td> -->
                        </tr>

                        <tr>
                          <td align="center" style="height: 0px">
                            <img
                              src="https://lh6.googleusercontent.com/DPnAywDoohrZ7ZpjqV0DERrKEqdKgFJ2Alwjw1dfphnofAiZQt2YifRogi_wIoU8XRY=w2400"
                              alt="logo"
                              style="width: 150px"
                            />
                          </td>
                        </tr>

                        <tr>
                          <td
                            align="center"
                            style="
                              font-family: 'Raleway', sans-serif;
                              font-size: 14px;
                              color: #263238;
                              padding: 10px;
                              /* position: absolute;
                            top: 60px; */
                              left: 0;
                              right: 0;
                              bottom: 0;
                            "
                          >
                            ${examTitle} Result
                          </td>
                        </tr>
                        <tr>
                          <td style="height: 0px"></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              border="0"
              cellpadding="30"
              cellspacing="0"
              width="100%"
              align="center"
            >
              <tbody>
                <tr>
                  <td>
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <td height="10"></td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-family: 'Inter', sans-serif;
                              font-size: 20px;
                              font-weight: 700;
                              color: #263238;
                              padding: 10px;
                            "
                          >
                            Hi ${firstName},
                          </td>
                        </tr>
                        <tr>
                          <!-- <td height="10"></td> -->
                        </tr>

                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 16px;
                              color: #000;
                              padding: 5px 10px;
                            "
                          >
                            The analysis of your ${examTitle} result is as follows:
                          </td>
                        </tr>

                        <tr>
                          <!-- <td height="30"></td> -->
                        </tr>

                        <tr>
                          <td>
                            <table
                              cellpadding="10"
                              cellspacing="0"
                              width="100%"
                              align="center"
                            >
                              <tbody>
                                <tr>
                                  <td>
                                    <table
                                      align="center"
                                      cellpadding="0"
                                      cellspacing="0"
                                    >
                                      <tbody>
                                        <tr>
                                          <td height="30"></td>
                                        </tr>
                                        <tr>
                                          <th
                                            align="center"
                                            style="
                                              font-family: 'Roboto', sans-serif;
                                              font-size: 14px;
                                              color: #000;
                                              padding: 7px 10px;
                                              background-color: #ebebeb;
                                              border: 1px solid black;
                                              border-collapse: collapse;
                                            "
                                          >
                                            Total Questions
                                          </th>
                                          <th
                                            align="center"
                                            style="
                                              font-family: 'Roboto', sans-serif;
                                              font-size: 14px;
                                              color: #000;
                                              padding: 7px 10px;
                                              background-color: #ebebeb;
                                              border: 1px solid black;
                                              border-collapse: collapse;
                                            "
                                          >
                                            Attempted Question
                                          </th>
                                          <th
                                            align="center"
                                            style="
                                              font-family: 'Roboto', sans-serif;
                                              font-size: 14px;
                                              color: #000;
                                              padding: 7px 10px;
                                              background-color: #ebebeb;
                                              border: 1px solid black;
                                              border-collapse: collapse;
                                            "
                                          >
                                            Question Skipped
                                          </th>
                                          <th
                                            align="center"
                                            style="
                                              font-family: 'Roboto', sans-serif;
                                              font-size: 14px;
                                              color: #000;
                                              padding: 7px 10px;
                                              background-color: #ebebeb;
                                              border: 1px solid black;
                                              border-collapse: collapse;
                                            "
                                          >
                                            Point Deducted
                                          </th>
                                          <th
                                            align="center"
                                            style="
                                              font-family: 'Roboto', sans-serif;
                                              font-size: 14px;
                                              color: #000;
                                              padding: 7px 10px;
                                              background-color: #ebebeb;
                                              border: 1px solid black;
                                              border-collapse: collapse;
                                            "
                                          >
                                            Total Points
                                          </th>
                                          <th
                                            align="center"
                                            style="
                                              font-family: 'Roboto', sans-serif;
                                              font-size: 14px;
                                              color: #000;
                                              padding: 7px 25px;
                                              background-color: #ebebeb;
                                              border: 1px solid black;
                                              border-collapse: collapse;
                                            "
                                          >
                                            Score
                                          </th>
                                        </tr>
                                        <tr>
                                          <td
                                            align="center"
                                            style="
                                              font-family: 'Roboto', sans-serif;
                                              font-size: 14px;
                                              color: #000;
                                              padding: 10px;
                                              border: 1px solid black;
                                              border-collapse: collapse;
                                            "
                                          >
                                            ${totalQuestions}
                                          </td>
                                          <td
                                            align="center"
                                            style="
                                              font-family: 'Roboto', sans-serif;
                                              font-size: 14px;
                                              color: #02d323;
                                              padding: 10px;
                                              border: 1px solid black;
                                              border-collapse: collapse;
                                            "
                                          >
                                            ${attemptedQuestion}
                                          </td>

                                          <td
                                            align="center"
                                            style="
                                              font-family: 'Roboto', sans-serif;
                                              font-size: 14px;
                                              color: #d38c02;
                                              padding: 10px;
                                              border: 1px solid black;
                                              border-collapse: collapse;
                                            "
                                          >
                                            ${questionSkipped}
                                          </td>
                                          <td
                                            align="center"
                                            style="
                                              font-family: 'Roboto', sans-serif;
                                              font-size: 14px;
                                              color: #d30202;
                                              padding: 10px;
                                              border: 1px solid black;
                                              border-collapse: collapse;
                                            "
                                          >
                                            ${pointDeducted}
                                          </td>
                                          <td
                                            align="center"
                                            style="
                                              font-family: 'Roboto', sans-serif;
                                              font-size: 14px;
                                              /* color: #02d323; */
                                              padding: 10px;
                                              border: 1px solid black;
                                              border-collapse: collapse;
                                            "
                                          >
                                            ${totalPoints}
                                          </td>
                                          <td
                                            align="center"
                                            style="
                                              font-family: 'Roboto', sans-serif;
                                              font-size: 16px;
                                              color: #02d323;
                                              font-weight: 800;
                                              padding: 10px;
                                              border: 1px solid black;
                                              border-collapse: collapse;
                                            "
                                          >
                                            ${percentage}%
                                          </td>
                                        </tr>
                                        <td height="30"></td>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                        <td height="30"></td>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              border="0"
              cellpadding="30"
              cellspacing="0"
              width="100%"
              align="center"
              style="border-top: 1px solid #737373"
            >
              <tbody>
                <tr>
                  <td bgcolor="#FAFAFA">
                    <table
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                    >
                      <tbody>
                        <tr>
                          <!-- <td
                            width="50%"
                            style="
                              font-family: 'Inter', sans-serif;
                              font-size: 14px;
                              color: #737373;
                              padding: 0px 10px;
                            "
                          ></td> -->
                          <td
                            width="100%"
                            align="center"
                            style="
                              font-family: 'Inter', sans-serif;
                              font-size: 14px;
                              color: #737373;
                              padding: 0px 10px 5px 10px;
                            "
                          >
                            <img
                              src="https://lh6.googleusercontent.com/Q7Rmj9CQzEfysE4VqhJlShM0Yyam8HT5zveYyh0nHpaIE-No6iPbTiCiO5WFUeyLuBI=w2400"
                              alt="logo"
                              style="width: 14px; height: 12px"
                            />
                            +2348135598433
                          </td>
                        </tr>
                        <tr>
                          <td
                            width="100%"
                            align="center"
                            style="
                              font-family: 'Inter', sans-serif;
                              font-size: 14px;
                              color: #737373;
                              padding: 5px 10px;
                            "
                          >
                            <a
                              href="mailto:hello@proctorme.com"
                              target="_blank"
                              style="
                                font-size: 12px;
                                text-decoration: none;
                                color: #000;
                                padding: 8px;
                              "
                            >
                              hello@proctorme.com</a
                            >
                          </td>
                        </tr>
                        <tr>
                          <td width="50%" align="center">
                            <a href="https://m.facebook.com/ProctormeInc">
                              <img
                                src="https://lh4.googleusercontent.com/yoDVxvq8hq5u5GEm9ZI6z-5vf0sTe_UmpOqpqP-6Gb0IY29RTfHZR2DPDmjtXA752JQ=w2400"
                                alt="logo"
                              />
                            </a>
                            <a href="https://linkedin.com/company/proctorme"
                              ><img
                                src="https://lh5.googleusercontent.com/7Fnz4ibxOWn4THZK1RXyU7f2T-awp2yAIqIH2mq9mMvJybtjerHF7U4-MZOrwXcAV9A=w2400"
                                alt="logo"
                              />
                            </a>
                            <a href="https://mobile.twitter.com/proctorme_">
                              <img
                                src="https://lh5.googleusercontent.com/WN43Ich0org_QWr3HU-XGO_S2LkVFePcAloB_mf-kYESloeADwGdwYwUadpPordh25I=w2400"
                                alt="logo"
                            /></a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>

`;
