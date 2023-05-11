const { DataTypes } = require("sequelize");

module.exports = (sequelize, _) => {
    const Settings = sequelize.define("settings", {
        androidAppVersion: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "1.0.0"
        },
        iOSAppVersion: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "1.0.0"
        },
        androidForceUpdate: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        iOSForceUpdate: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
        privacyPolicy: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: "http://142.93.209.188:8045/api/v1/file/privacy-policy.pdf"
        },
        termsCondition: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });
    return Settings;
}
