const { DataTypes } = require("sequelize");

module.exports = (sequelize, _) => {
    const Notification = sequelize.define("notifications", {
        enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: 1
        },
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false
        },
        route: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });
    return Notification;
}