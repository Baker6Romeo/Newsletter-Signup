require('dotenv').config();
const bodyParser = require("body-parser");
const express = require("express");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const request = require("request");

const app = express();

const apiKey = process.env.MAILCHIMP_API_KEY;
const audienceId = process.env.MAILCHIMP_TEST_AUDIENCE_ID;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
})

app.post("/", function(req, res) {

  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  const data = {
    members: [{
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    }]
  };

  const jsonData = JSON.stringify(data);

  mailchimp.setConfig({
    apiKey: apiKey,
    server: "us13",
  });

  const run = async () => {
    const response = await mailchimp.lists.batchListMembers(audienceId, jsonData);
    if (response.errors.length > 0){
      res.sendFile(__dirname + "/failure.html");
    } else {
      res.sendFile(__dirname + "/success.html");
    }
  };
  run();
});

app.post("/failure", function(req, res){
  res.redirect("/");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Listening on port 3000.");
})
