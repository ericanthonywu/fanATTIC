const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/fanattic', {
    useNewUrlParser: true,
    keepAlive: true,
    keepAliveInitialDelay: 300000,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(r => {
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
}).catch(err => console.error(err));

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true, trim: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true, select: false},
    email_status: {type: Boolean, default: false},
    email_token: {type: Number},
    email_token_expire: {type: Date},
    phone: {type: String},
    phone_token: {type: Number},
    phone_token_expire: {type: Date},
    nickname: {type: String},
    profilepicture: {type: String, default: "default.jpg"},
    bio: {type: String},
    block: {type: Boolean, default: false},
    suspendTime: {type: Date},
    loginWithFacebook: {type: Boolean, default: false},
    loginWithGoogle: {type: Boolean, default: false}
}, {timestamps: true})

exports.user = mongoose.model('user', userSchema);

const postSchema = new mongoose.Schema({
    image: [{type: String, required: true, unique: true}],
    comments: [{
        id: {type: mongoose.Schema.Types.ObjectId},
        user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
        comments: {type: String},
        like: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
        likeCount: {type: Number, default: 0},
        time: {type: Date, default: Date.now},
        replyCount: {type: Number, default: 0},
        reply: [{
            id: {type: mongoose.Schema.Types.ObjectId},
            user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
            comments: {type: String},
            like: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
            likeCount: {type: Number},
            time: {type: Date, default: Date.now},
        }]
    }],
    commentsCount: {type: Number, default: 0},
    caption: {type: String},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
    like: [{type: mongoose.Schema.Types.ObjectId, ref: 'user'}],
    likeCount: {type: Number, default: 0},
    ban: {type: Boolean, default: false},
}, {timestamps: true})

exports.post = mongoose.model('post', postSchema);

const chatSchema = new mongoose.Schema({
    participans: [{type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true}],
    message: [{
        sender: {type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
        message: {type: String, required: true},
        read: {type: Boolean, default: false},
        time: {type: Date, default: Date.now()}
    }]
});

exports.chat = mongoose.model('chat', chatSchema);

