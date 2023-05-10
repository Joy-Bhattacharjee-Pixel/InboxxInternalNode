const multer = require("multer");
const path =  require('path');

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Please upload only images.", false);
  }
};


var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(path.dirname('')) + "/resources/static/assets/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-inboxx-${file.originalname}`);
  },
});

var uploadFile = multer({ storage: storage,});
module.exports = uploadFile;