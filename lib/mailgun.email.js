const mailgun = require("mailgun-js");
const formData = require("form-data");
const Mailgun = require("mailgun.js");

module.exports.mailgun1 = async () => {
  const DOMAIN = "YOUR_DOMAIN_NAME";
  const mg = mailgun({ apiKey: api_key, domain: DOMAIN });
  const data = {
    from: "Excited User <me@samples.mailgun.org>",
    to: "bar@example.com, YOU@YOUR_DOMAIN_NAME",
    subject: "Hello",
    text: "Testing some Mailgun awesomness!",
  };
  mg.messages().send(data, function (error, body) {
    console.log(body);
  });
};

module.exports.mailgun2 = async () => {
  const API_KEY = "YOUR_API_KEY";
  const DOMAIN = "YOUR_DOMAIN_NAME";

  const mailgun = new Mailgun(formData);
  const client = mailgun.client({ username: "api", key: API_KEY });

  const messageData = {
    from: "Excited User <me@samples.mailgun.org>",
    to: "foo@example.com, bar@example.com",
    subject: "Hello",
    text: "Testing some Mailgun awesomeness!",
  };

  client.messages
    .create(DOMAIN, messageData)
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    });
};

//exampicture.name = `photoExam_${exam.id}${path.parse(file.name).ext};
