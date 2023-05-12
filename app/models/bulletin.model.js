const { DataTypes } = require("sequelize");

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
        company: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });
    return Bulletins;
};