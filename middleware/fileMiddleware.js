const multer = require('multer')
const path = require('path')

const postStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        req.dest = "post";
        cb(null, path.join(__dirname, `../uploads/${req.dest}`))
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname.trim())
    }
});

exports.uploadPost = multer({
    storage: postStorage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
});
