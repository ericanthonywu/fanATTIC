const {user: User, post: Post} = require('../model')

exports.showProfile = (req, res) => {
    const {user} = req.body
    User.findById(user)
        .select("username email bio nickname")
        .then(data => res.status(200).json(data))
        .catch(err => res.status(500).json(err))
}

exports.showPostProfile = (req, res) => {
    const {user} = req.body
    Post.find({user: user}).select("image likeCount commentsCount")
        .then(data => res.status(200).json(data))
        .catch(err => res.status(500).json(err))
}
