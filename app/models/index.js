const dbConfig = require("../configs/config")
const Sequelize = require("sequelize");

// Configuring sequelize with db details
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    port: dbConfig.PORT,
    dialectOptions: dbConfig.dialectOptions
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// All the models defined here
db.invoices = require("./invoices.model.js")(sequelize, Sequelize); // Invoices model
db.customers = require('./customer.model.js')(sequelize, Sequelize); // Customer model
db.companies = require('./company.model.js')(sequelize, Sequelize); // Company model
db.settings = require('./setting.model.js')(sequelize, Sequelize); // Settings model
db.bulletins = require('./bulletin.model.js')(sequelize, Sequelize); // Bulletin model



// Exporting db
module.exports = db;