const { DataTypes } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    const Customers = sequelize.define("customers", {
        enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        name: {
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
        phone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: {
            type: DataTypes.STRING,
            allowNull: false
        },
        pushToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false
        },
    });
    return Customers;
};