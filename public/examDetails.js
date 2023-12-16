module.exports = (
  name = "",
  examTitle,
  examId,
  startDate,
  endDate,
  duration,
  loginLink
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
              cellpadding="0"
              cellspacing="0"
              width="100%"
              align="center"
              style="border-bottom: 3px solid #0d102e"
            >
              <tbody>
                <tr>
                  <td align="center" bgcolor="#FAFAFA">
                    <table
                      <!--
                      border="0"
                      align="center"
                      cellpadding="0"
                      cellspacing="0"
                      --
                    >
                      <tbody>
                        <!-- <tr>
                          <td height="30"></td>
                        </tr> -->

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
                            Exam Registration
                          </td>
                        </tr>
                        <tr>
                          <td style="height: 0px">
                            <!-- <img
                              src="https://lh5.googleusercontent.com/WjdEcK1RekAIpNNZtVlErAMc0qSgsxOr8J6iicuc9MFWztpvx6y0RsWrd6VTK_h7dnQ=w1200-h630-p"
                              alt="img"
                              style="width: 100%"
                            /> -->
                          </td>
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
                              padding: 5px 10px;
                            "
                          >
                            Hello ${name},
                          </td>
                        </tr>
                        <tr>
                          <td height="10"></td>
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
                            Your exam details are as follows
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 14px;
                              color: #000;
                              padding: 5px 10px;
                            "
                          >
                            A. Title: ${examTitle}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 14px;
                              color: #000;
                              padding: 5px 10px;
                            "
                          >
                            B. Assessment ID: ${examId}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 14px;
                              color: #000;
                              padding: 5px 10px;
                            "
                          >
                            C. Start Date: <span
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 14px;
                              color: #02d323;
                            "
                          >
                            ${startDate}
                          </span>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 14px;
                              color: #000;
                              padding: 5px 10px;
                            "
                          >
                            D. End Date: <span
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 14px;
                              color: #d30202;
                            "
                            >${endDate}</span
                          >
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 14px;
                              color: #000;
                              padding: 5px 10px;
                            "
                          >
                            E. Duration: ${duration}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 14px;
                              color: #000;
                              padding: 5px 10px;
                            "
                          >
                            F. Login Link: ${loginLink}
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 14px;
                              color: #000;
                              padding: 5px 10px;
                            "
                          >
                            <span style="font-weight: 700"> NB: </span> The
                            Start and End time is in GMT +000, Kindly ensure
                            that you translate the time to your timezone so as
                            not to miss your exam. Eg 13:00 GMT +000 = 14:00 GMT
                            +1/WAT = 10:00 GMT -3.
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 14px;
                              color: #000;
                              font-weight: 700;
                              padding: 10px;
                            "
                          >
                          Instruction:
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 14px;
                              color: #000;
                              padding: 10px;
                              font-weight: 700;
                            "
                          >
                          Kindly ensure that you read and understand the exam
                          rules and regulations before sitting for your exam.
                          </td>
                        </tr>
                         <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 14px;
                              color: #000;
                              font-weight: 700;
                              padding: 10px;
                            "
                          >
                            Before your exam:
                          </td>
                        </tr>
                        <tr>
                        <td
                          style="
                            font-family: 'Roboto', sans-serif;
                            font-size: 13px;
                            color: #000;
                            padding: 5px 17px;
                          "
                        >
                          • Do not take your exam in a setting with a
                          corporate firewall (including VPN). If you are
                          taking your online exam in your office, please alert
                          your Network Administrator to the Proctorme system
                          requirements.
                        </td>
                      </tr>
                      <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 13px;
                              color: #000;
                              padding: 5px 17px;
                            "
                          >
                            • Make sure you have a reliable, fast internet
                            connection to download your exam and support a
                            webcam stream.
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 13px;
                              color: #000;
                              padding: 5px 17px;
                            "
                          >
                            • Make sure your system has a functioning microphone
                            and webcam: You can login before your exam start
                            date to check your microphone and webcam.
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 14px;
                              color: #000;
                              font-weight: 700;
                              padding: 10px;
                            "
                          >
                            Prepare your testing space:
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 14px;
                              color: #000;
                              padding: 10px;
                            "
                          >
                            Find a quiet, disruption-free, well-lit space.
                            Please be aware that background light or the sun
                            rising/setting could create visibility issues for
                            the proctor.
                          </td>
                        </tr>
                        <tr>
                        <td
                          style="
                            font-family: 'Roboto', sans-serif;
                            font-size: 13px;
                            color: #000;
                            padding: 5px 17px;
                          "
                        >
                          • You may be required to take four photos of your
                          testing space during check-in. We recommend using a
                          mobile device.
                        </td>
                      </tr>
                      <tr>
                        <td
                          style="
                            font-family: 'Roboto', sans-serif;
                            font-size: 13px;
                            color: #000;
                            padding: 5px 17px;
                          "
                        >
                          • You can only use one monitor.
                        </td>
                      </tr>
                      <tr>
                      <td
                        style="
                          font-family: 'Roboto', sans-serif;
                          font-size: 13px;
                          color: #000;
                          padding: 5px 17px;
                        "
                      >
                        • Your desk should be clear.
                      </td>
                    </tr>
                    <tr>
                      <td
                        style="
                          font-family: 'Roboto', sans-serif;
                          font-size: 13px;
                          color: #000;
                          padding: 5px 17px;
                        "
                      >
                        • Your desk should be clear.• Ensure your mobile
                        phones are not within arm’s reach.
                      </td>
                    </tr>
                    <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 13px;
                              color: #000;
                              padding: 5px 17px;
                            "
                          >
                            • Turn your mobile phone’s off or activate silent
                            mode to avoid exam disruption.
                          </td>
                        </tr>

                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 14px;
                              color: #000;
                              font-weight: 700;
                              padding: 10px;
                            "
                          >
                            Exam rules during testing:
                          </td>
                        </tr>
                        <tr>
                        <td
                          style="
                            font-family: 'Roboto', sans-serif;
                            font-size: 13px;
                            color: #000;
                            padding: 5px 17px;
                          "
                        >
                          • You may not access unauthorized materials, I.e.
                          mobile devices, watches, and anything not allowed by
                          your exam sponsor.
                        </td>
                      </tr>
                      <tr>
                        <td
                          style="
                            font-family: 'Roboto', sans-serif;
                            font-size: 13px;
                            color: #000;
                            padding: 5px 17px;
                          "
                        >
                          • No one else should appear through the webcam
                          during the exam and no one else’s voice should be
                          heard.
                        </td>
                      </tr>
                      <tr>
                      <td
                        style="
                          font-family: 'Roboto', sans-serif;
                          font-size: 13px;
                          color: #000;
                          padding: 5px 17px;
                        "
                      >
                        • No speaking aloud during exam
                      </td>
                    </tr>
                    <tr>
                      <td
                        style="
                          font-family: 'Roboto', sans-serif;
                          font-size: 13px;
                          color: #000;
                          padding: 5px 17px;
                        "
                      >
                        • Do not exit full screen once the exam has started
                        (It may attract point deduction).
                      </td>
                    </tr>
                    <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 13px;
                              color: #000;
                              padding: 10px;
                            "
                          >We recommend watching this <a href="https://youtu.be/XNlW64ajvDU"> video </a> to understand how to take your assessment.
                          <br><br>
                            For questions and clarifications regarding your
                            exam, kindly reach out to
                            <a
                              href="mail:Support@proctorme.com"
                              target="_blank"
                              style="
                                font-size: 12px;
                                text-decoration: underline;
                                color: #2c6ecb;
                              "
                            >
                              support@proctorme.com
                            </a>
                            and we would be happy to assist you.
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 13px;
                              color: #000;
                              padding: 2px 10px;
                            "
                          >
                            Best regards,
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              font-family: 'Roboto', sans-serif;
                              font-size: 13px;
                              color: #000;
                              font-weight: 700;
                              padding: 2px 10px;
                            "
                          >
                            Proctorme.
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
                          <td
                            width="50%"
                            style="
                              font-family: 'Inter', sans-serif;
                              font-size: 14px;
                              color: #737373;
                              padding: 0px 10px;
                            "
                          ></td>
                          <td
                            width="50%"
                            align="end"
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
                            width="50%"
                            style="
                              font-family: 'Inter', sans-serif;
                              font-size: 14px;
                              color: #737373;
                              padding: 0px 10px;
                            "
                          >
                            <a
                              href="http://proctorme.com/"
                              target="_blank"
                              style="
                                font-size: 12px;
                                text-decoration: underline;
                                color: #2c6ecb;
                              "
                            >
                              proctorme.com</a
                            >
                            <br />
                            <span style="font-size: 12px">
                              All Right Reserved &copy; 2022
                            </span>
                          </td>
                          <td width="50%" align="end">
                            <a href="https://m.facebook.com/ProctormeInc"> <img src="https://lh4.googleusercontent.com/yoDVxvq8hq5u5GEm9ZI6z-5vf0sTe_UmpOqpqP-6Gb0IY29RTfHZR2DPDmjtXA752JQ=w2400" alt="logo" /> </a>
                            <a href="https://linkedin.com/company/proctorme"><img src="https://lh5.googleusercontent.com/7Fnz4ibxOWn4THZK1RXyU7f2T-awp2yAIqIH2mq9mMvJybtjerHF7U4-MZOrwXcAV9A=w2400" alt="logo" />
                            </a>
                            <a href="https://mobile.twitter.com/proctorme_"> <img src="https://lh5.googleusercontent.com/WN43Ich0org_QWr3HU-XGO_S2LkVFePcAloB_mf-kYESloeADwGdwYwUadpPordh25I=w2400" alt="logo" /></a>
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
</html>`;
