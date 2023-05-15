const { DataTypes } = require("sequelize");

// Importing invoice module
const db = require("../models");
Customers = db.customers;
module.exports = (sequelize, DataTypes) => {
    const Invoices = sequelize.define("invoices", {
        enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        companyId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        invoiceNumber: {
            type: DataTypes.STRING,
            allowNull: false
        },
        invoiceDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        invoiceType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        billedToName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        billedToEmailID: {
            type: DataTypes.STRING,
            allowNull: false,
            // references: {
            //     model: Customers,
            //     key: "email"
            // }
        },
        billedToPhone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        billedToCountryCode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        invoiceValue: {
            type: DataTypes.STRING,
            allowNull: false
        },
        invoiceCurrency: {
            type: DataTypes.STRING,
            allowNull: false
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        invoiceSummary: {
            type: DataTypes.STRING,
            allowNull: false
        },
        billedToZipCode: {
            type: DataTypes.STRING,
            allowNull: false
        },
        paid: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0
        }
    });

    return Invoices;
};