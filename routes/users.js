const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware')
const fileMiddleware = require('../middleware/fileMiddleware')

const authController = require('../controller/authController')
const postController = require('../controller/postController')

router.post('/login', authController.login)
router.post('/register', authController.register)
router.post('/verifyEmail', authController.verifyEmail)

//post router
router.post('/showPost', authMiddleware.authCheck, postController.showPost)
router.post('/addPost', fileMiddleware.uploadPost.array('image', 10), authMiddleware.authCheck, postController.addPost)
router.post('/addComment', authMiddleware.authCheck, postController.addComment)
router.post('/replyComment', authMiddleware.authCheck, postController.replyComment)
router.post('/editCaption', authMiddleware.authCheck, postController.editCaption)
router.post('/showComment', authMiddleware.authCheck, postController.showComment)
router.post('/showReply', authMiddleware.authCheck, postController.showReply)
router.post('/deleteComment', authMiddleware.authCheck, postController.deleteComment)
router.post('/deletePost', authMiddleware.authCheck, postController.deletePost)
router.post('/deleteReply', authMiddleware.authCheck, postController.deleteReply)

module.exports = router;
