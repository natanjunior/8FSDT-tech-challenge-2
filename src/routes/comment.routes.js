'use strict';

const express = require('express');
const router = express.Router();
const { commentController, authenticate } = require('../container');
const { validate } = require('../middlewares/validate');
const {
  searchCommentsValidator, createCommentValidator, deleteCommentValidator
} = require('../validators/comment.validator');

const optionalAuth = (req, res, next) => {
  if (!req.headers.authorization) { req.user = null; return next(); }
  return authenticate(req, res, next);
};

router.get('/search', optionalAuth, searchCommentsValidator, validate, (req, res) =>
  commentController.searchComments(req, res)
);

router.post('/', authenticate, createCommentValidator, validate, (req, res) =>
  commentController.createComment(req, res)
);

router.delete('/:id', authenticate, deleteCommentValidator, validate, (req, res) =>
  commentController.deleteComment(req, res)
);

module.exports = router;
