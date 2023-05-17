const { DataTypes } = require("sequelize");

module.exports = (sequelize, _) => {
    const Transactions = sequelize.define("transactions", {
        companyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "companies",
                key: "id"
            }
        },
        invoiceId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            // references: {
            //     model: "invoices",
            //     key: "id"
            // }
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        paymentId:{
            type: DataTypes.STRING,
            allowNull: false
        },
        customerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "customers",
                key: "id"
            }
        },
        amount: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return Transactions;
}
