const jwt = require('jsonwebtoken')
const fs = require('fs')

exports.authCheck = (req, res, next) => {
    if (req.body.token) {
        jwt.verify(req.body.token, process.env.JWTTOKEN, (err, data) => {
            if (err) {
                if (req.files) {
                    for (let i = 0; i < req.files.length; i++) {
                        fs.unlinkSync(path.join(__dirname, `../uploads/${req.dest}/${req.files[i].filename}`))
                    }
                    return res.status(419).json({
                        message: err.message,
                    });
                } else if (req.file) {
                    fs.unlink(path.join(__dirname, `../uploads/${req.dest}/${req.file.filename}`), () => res.status(419).json({message: err.message}));
                } else {
                    return res.status(419).json({
                        message: err.message,
                    });
                }
            }
            req.userData = data
            console.log(data)
            next()
        })
    } else {
        res.status(400).json()
    }
}
