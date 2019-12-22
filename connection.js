const mongoose = require('mongoose');
exports.mongoose = mongoose.connect('mongodb://localhost/sosmed', {
    useNewUrlParser: true,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    useFindAndModify: false,
    useCreateIndex: true
});
