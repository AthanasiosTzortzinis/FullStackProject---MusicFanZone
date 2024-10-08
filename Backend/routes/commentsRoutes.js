const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { verifyToken } = require('../middleware/auth');

router.post('/:topicId', verifyToken, commentController.createComment); 
router.get('/:topicId', commentController.getAllComments);              
router.get('/:topicId/:id', commentController.getCommentById);         
router.put('/:topicId/:id', verifyToken, commentController.updateComment);
router.delete('/:topicId/:id', verifyToken, commentController.deleteComment); 

module.exports = router;
