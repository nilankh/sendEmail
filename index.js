// Import Express into project
const express = require('express');

// Creating an instance of express function
const app = express();

// The port we want our project to run on
const PORT = 3000;


// Express allows us to listen to the PORT and trigger a console.log() when you visit the port
app.listen(PORT, () => {
    console.log(`Server is 🏃‍♂️ on port ${PORT}`);
})
