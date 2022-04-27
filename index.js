// Import Express into project
const express = require('express');

// Import multer
const multer = require('multer');


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

  
  

// Render the index.html when the user visit our project port
app.get('/', (req, res) => {
    res.sendFile("/index.html")
})

// Post route to handle retrieving data from HTML form to server
// Post route to handle retrieving data from HTML form to server
app.post("/send_email", (req, res) => {
    attachmentUpload(req, res, function(error){

        if (error) {
            console.log(err);
            return res.send("Error uploading file");
          } else {
            const recipient = req.body.email;
            const subject = req.body.subject;
            const message = req.body.message;
            const attachmentPath = req.file.path;
            console.log("recipient:", recipient);
            console.log("subject:", subject);
            console.log("message:", message);
            console.log("attachmentPath:", attachmentPath);


            // Connecting to gmail service
            let transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    type: "OAUTH2",
                    user: "",
                    pass:"",
                    clientId:"",
                    clientSecret:"",
                    refreshToken:"",
                },
            });

            // e-mail option
            let mailOptions = {
                from: "",
                to: "",
                subject: "",
                text: "",
            };

            // Method to send e-mail out
            transporter.sendMail(mailOptions, function(err, data){
                if(err){
                    console.log("Error: " + err);
                }else{
                    console.log("Email sent successfully");
                }
            });
          }
    })
  
  });
  

// Express allows us to listen to the PORT and trigger a console.log() when you visit the port
app.listen(PORT, () => {
    console.log(`Server is 🏃‍♂️ on port ${PORT}`);
})
