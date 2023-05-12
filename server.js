const express = require("express");
const app = express();
const cors = require('cors');
// This is required for parsing body from POST
app.use(cors());
app.use(express.json());
// Required for url encoding
app.use(express.urlencoded({ extended: true }));
// Importing db details
const db = require("./app/models");
// Syncing with db - alter true - altered the table
db.sequelize.sync({ alter: true })
    .then(() => {
        console.log("Synced db.");
    })
    .catch((err) => {
        console.log("Failed to sync db: " + err.message);
    });
// Dummy checking
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Inboxx Application" });
});
// Defining all the routes
require("./app/routes/dummy.route")(app); // Customer route
require("./app/routes/customer.route")(app); // Customer route
require("./app/routes/invoice.route")(app); // Invoice route
require("./app/routes/company.route")(app); // Company route
require("./app/routes/setting.route")(app); // Settings route
require("./app/routes/file.routes")(app); // File route
require("./app/routes/bulletin.route")(app); // File route




// Defining port
const PORT = process.env.PORT || 8045;
// Listenning to port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});