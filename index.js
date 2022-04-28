// Import Express into project
const express = require('express');

// Import multer
const multer = require('multer');

// Googleapis
const {google} = require('googleapis');

// Pull out OAuth2 from googleapis
const OAUTH2 = google.auth.OAuth2;


// Import nodemailer
const nodemailer = require("nodemailer");


// Creating an instance of express function
const app = express();

// Import dotenv configuration
const dotenv = require("dotenv");
dotenv.config()

console.log(process.env.EMAIL_ID)
// The port we want our project to run on
const PORT = 3000;

// Express should add our path
app.use(express.static("public"));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Multer file storage
const Storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, "./attachments");
    },
    filename: function (req, file, callback) {
      callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}`);
    },
  });


// Middleware to get a single attachment
const attachmentUpload = multer({
    storage: Storage,
  }).single("attachment");

  
  const createTransporter = async() => {
    // 1
    const oauth2Client = new OAUTH2(
        process.env.OAUTH_CLIENT_ID,
        process.env.OAUTH_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground"
    );

    // 2
    oauth2Client.setCredentials({
        refresh_token: process.env.OAUTH_REFRESH_TOKEN,
    });
    const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, toekn) => {
            if(err){
                reject("Falied to create access token :( " + err);
            }
            resolve(toekn);
        });
    });
    // 3
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.SENDER_EMAIL,
          accessToken,
          clientId: process.env.OAUTH_CLIENT_ID,
          clientSecret: process.env.OAUTH_CLIENT_SECRET,
          refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        },
      });
      //4
      return transporter;
    
} 

// Render the index.html when the user visit our project port
app.get('/', (req, res) => {
    res.sendFile("/index.html")
})

// Post route to handle retrieving data from HTML form to server
// Post route to handle retrieving data from HTML form to server
app.post("/send_email", (req, res) => {
    attachmentUpload(req, res, async function(error){

        if (error) {
            return res.send("Error uploading file");
          } else {
            //   Pulling out the form data from the request body
            const recipient = req.body.email;
            const mailSubject = req.body.subject;
            const mailBody = req.body.message;
            const attachmentPath = req.file?.path;
            console.log("recipient:", recipient);
            console.log("subject:", mailSubject);
            console.log("message:", mailBody);
            console.log("attachmentPath:", attachmentPath);


            // Connecting to gmail service
            // let transporter = nodemailer.createTransport({
            //     service: "gmail",
            //     auth: {
            //         type: "OAUTH2",
            //         user: "",
            //         pass:"",
            //         clientId:"",
            //         clientSecret:"",
            //         refreshToken:"",
            //     },
            // });

            // e-mail option
            let mailOptions = {
                from: process.env.SENDER_EMAIL,
                to: recipient,
                subject: mailSubject,
                text: mailBody,
                attachments: [
                    {
                        path: attachmentPath,
                    },
                ],
            };
            try {
                // Get response from the createTransport
                let emailTransporter = await createTransporter();

                // Send Email
                emailTransporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        // Failed block
                        console.log(error);
                    }else{
                        // Success Block
                        console.log("Email sent: " + info.response);
                        return res.redirect("/success.html");
                    }
                })
            } catch (error) {
                return console.log(error);
            }
            // Method to send e-mail out
            // transporter.sendMail(mailOptions, function(err, data){
            //     if(err){
            //         console.log("Error: " + err);
            //     }else{
            //         console.log("Email sent successfully");
            //     }
            // });
          }
    })
  
  });
  

// Express allows us to listen to the PORT and trigger a console.log() when you visit the port
app.listen(PORT, () => {
    console.log(`Server is 🏃‍♂️ on port ${PORT}`);
})
