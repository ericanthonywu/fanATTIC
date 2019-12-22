const {post: Post, user: User} = require('../model')

exports.addPost = (req, res) => {
    const {caption} = req.body
    const imgName = [];
    for (let i = 0; i < req.files.length; i++) {
        imgName.push(req.files[i].filename)
    }
    new Post({
        caption: caption,
        image: imgName,
        user: req.userData.id
    }).save().then(() => res.status(201).json()).catch(err => res.status(500).json(err))
}

exports.addComment = (req, res) => {
    const {postId, comments} = req.body
    Post.findByIdAndUpdate(postId, {
        $push: {
            comments: {
                user: req.userData.id,
                comments: comments,
            }
        },
        $inc: {"commentsCount": 1},
    }).then(() => res.status(201).json()).catch(err => res.status(500).json(err))
}

exports.replyComment = (req, res) => {
    const {postId, commentId, reply} = req.body
    Post.findOneAndUpdate({
        _id: postId,
        "comments._id": commentId
    }, {
        $push: {
            "comments.reply": {
                user: req.userData.id,
                comments: reply,
            }
        }
    })
        .then(() => res.status(200).json())
        .catch(err => res.status(500).json(err))
}

exports.editCaption = (req, res) => {
    const {postId, caption} = req.body
    Post.findByIdAndUpdate(postId, {caption: caption})
        .then(() => res.status(202).json())
        .catch(err => res.status(500).json(err))
}

exports.showPost = (req, res) => {
    const {offset} = req.body
    Post.find({})
        //option
        .sort('createdAt', -1) //desc
        .populate('user', 'username profilepicture') //inner join
        .select("user image caption likeCount createdAt") //select data
        .skip(offset) //offset
        .limit(10)

        .then(post => res.status(200).json(post))
        .catch(err => res.status(500).json(err))
}

exports.showComment = (req, res) => {
    const {offset, post} = req.body
    Post.findById(post)
        .sort("likeCount", 1)
        .populate("comments.user", "username profilepicture")
        .select("comments.user comments.comments comments.likeCount comments.replyCount time")
        .limit(10)
        .skip(offset)

        .then(comment => res.status(200).json(comment))
        .catch(err => res.status(500).json(err))
}

exports.showReply = (req, res) => {
    const {offset, post, comment} = req.body
    Post.findOne({
        _id: post,
        "comments._id": comment
    })
        .sort("createdAt", -1)
        .populate("comments.reply.user", "username profilepicture")
        .select("comments.reply.user comments.reply.comments comments.reply.likeCount comments.reply.time")
        .limit(3)
        .skip(offset)

        .then(reply => res.status(200).json(reply))
        .catch(err => res.status(500).json(err))
}

exports.deleteReply = (req, res) => {
    const {post, comment, reply} = req.body
    Post.findOneAndUpdate({
        _id: post,
        "comments._id": comment,
        "comments.user": res.userData.id,
    }, {
        $pull: {
            "comments.reply": {
                _id: reply
            }
        }
    }).then(() => res.status(202).json())
        .catch(err => res.status(500).json(err))
}

exports.deleteComment = (req, res) => {
    const {post, comment} = req.body
    Post.findByIdAndUpdate(post, {
        $pull: {
            "comments": {
                _id: comment
            }
        }
    }).then(() => res.status(202).json())
        .catch(err => res.status(500).json(err))
}

exports.deletePost = (req, res) => {
    const {post} = req.body
    Post.findByIdAndDelete(post).then(() => res.status(202).json()).catch(err => res.status(500).json(err))
}
