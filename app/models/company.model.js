const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Companies = sequelize.define("companies", {
        enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        verificationPending: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: "Company"
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false
        },
        zip: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phoneNumber: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });
    return Companies;
};