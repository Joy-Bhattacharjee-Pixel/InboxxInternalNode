// This file consists all the host, user and db details
// module.exports = {
//   HOST: "localhost",
//   USER: "root",
//   PASSWORD: "",
//   DB: "inboxx",
//   dialect: "mysql",
//   dropboxToken: "sl.BcWxzbcRC_i-cV9aJwD2PG3KF1rfj8RfuqAd1KDrdE-ofilB3aPTEVj79mY4flMSt8CNTm7PYEZ1QBRdaT-1uEZDDJotZKzAu-l5uq7_kyuaUD_XNpOp0cZHig0lOpigh3eOWqDbmmsm",
//   stripeTestKey: "sk_test_Ma7vvXxqIKxpUoHmFNFv2oYt00u1nVjNkF",
//   baseUrl: "http://localhost:8081"
// };

module.exports = {
  HOST: "db-mysql-blr1-23011-do-user-14081312-0.b.db.ondigitalocean.com",
  USER: "doadmin",
  PASSWORD: "AVNS_VjnBT3Av48jXzcJH-K9",
  DB: "defaultdb",
  PORT: 25060,
  dialect: "mysql",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  stripeTestKey: "sk_test_Ma7vvXxqIKxpUoHmFNFv2oYt00u1nVjNkF",
  baseUrl: "http://146.190.9.100:8021"
};

