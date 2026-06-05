'use strict';

const express = require('express');
const router = express.Router();
const { teacherController, authenticate } = require('../container');
const { authorize } = require('../middlewares/authorize');
const { validate } = require('../middlewares/validate');
const {
  createTeacherValidator,
  updateTeacherValidator,
  idTeacherValidator,
  listTeachersValidator
} = require('../validators/teacher.validator');

router.get('/me', authenticate, (req, res) => teacherController.me(req, res));

router.get('/', authenticate, authorize(['TEACHER']), listTeachersValidator, validate, (req, res) =>
  teacherController.list(req, res)
);

router.get('/:id', authenticate, authorize(['TEACHER']), idTeacherValidator, validate, (req, res) =>
  teacherController.getById(req, res)
);

router.post('/', authenticate, authorize(['TEACHER']), createTeacherValidator, validate, (req, res) =>
  teacherController.create(req, res)
);

router.put('/:id', authenticate, updateTeacherValidator, validate, (req, res) =>
  teacherController.replace(req, res)
);

router.patch('/:id', authenticate, updateTeacherValidator, validate, (req, res) =>
  teacherController.patch(req, res)
);

router.delete('/:id', authenticate, authorize(['TEACHER']), idTeacherValidator, validate, (req, res) =>
  teacherController.delete(req, res)
);

module.exports = router;
