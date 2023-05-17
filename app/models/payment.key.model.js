const { DataTypes } = require("sequelize");

module.exports = (sequelize, _) => {
    const PaymentKeys = sequelize.define("paymentKeys", {
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "companies",
                key: "id"
            }
        },
        stripeKey: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paypalKey: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    });
    return PaymentKeys;
}
