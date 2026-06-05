'use strict';

const express = require('express');
const router = express.Router();
const { studentController, authenticate } = require('../container');
const { authorize } = require('../middlewares/authorize');
const { validate } = require('../middlewares/validate');
const {
  createStudentValidator, updateStudentValidator,
  idStudentValidator, listStudentsValidator
} = require('../validators/student.validator');

const optionalAuth = (req, res, next) => {
  if (!req.headers.authorization) { req.user = null; return next(); }
  return authenticate(req, res, next);
};

router.get('/me', authenticate, (req, res) => studentController.me(req, res));

router.get('/', authenticate, authorize(['TEACHER']), listStudentsValidator, validate, (req, res) =>
  studentController.list(req, res)
);

router.get('/:id', authenticate, authorize(['TEACHER']), idStudentValidator, validate, (req, res) =>
  studentController.getById(req, res)
);

router.post('/', optionalAuth, createStudentValidator, validate, (req, res) =>
  studentController.create(req, res)
);

router.put('/:id', authenticate, updateStudentValidator, validate, (req, res) =>
  studentController.replace(req, res)
);

router.patch('/:id', authenticate, updateStudentValidator, validate, (req, res) =>
  studentController.patch(req, res)
);

router.delete('/:id', authenticate, authorize(['TEACHER']), idStudentValidator, validate, (req, res) =>
  studentController.delete(req, res)
);

module.exports = router;
