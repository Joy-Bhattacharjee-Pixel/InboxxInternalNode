const { DataTypes } = require("sequelize");
const db = require("../models");

module.exports = (sequelize, _) => {
    const Bulletins = sequelize.define("bulletins", {
        enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false
        },
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "companies",
                key: "id"
            }
        }
    });
    return Bulletins;
};