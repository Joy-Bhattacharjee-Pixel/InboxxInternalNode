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
db.paymentKeys = require('./payment.key.model.js')(sequelize, Sequelize); // Payment Keys model
db.transactions = require('./transaction.model.js')(sequelize, Sequelize); // Transaction model
db.notifications = require('./notification.model.js')(sequelize, Sequelize); // Notification model




/* Establishing a foreign key relation with bulletins and compaies */
db.companies.hasMany(db.bulletins, { as: "bulletins" });
db.bulletins.belongsTo(db.companies, { foreignKey: "companyId", as: "company" })

/* Establishing a foreign key relation with payment keys and companies */
db.companies.hasMany(db.paymentKeys, { as: "paymentKey" });
db.paymentKeys.belongsTo(db.companies, { foreignKey: "companyId", as: "company" });

/* Establishing a foreign key relation with transaction table and invoices */
db.transactions.hasMany(db.invoices, { as: "invoices" });
db.invoices.belongsTo(db.transactions, { foreignKey: "transactionId", as: "transaction" });


// Exporting db
module.exports = db;