'use strict';

const express = require('express');
const router = express.Router();
const { authController, authenticate } = require('../container');
const { validate } = require('../middlewares/validate');
const { loginValidator, changePasswordValidator } = require('../validators/auth.validator');

router.post('/login', loginValidator, validate, (req, res) =>
  authController.login(req, res)
);

router.post('/logout', authenticate, (req, res) =>
  authController.logout(req, res)
);

router.patch('/password', authenticate, changePasswordValidator, validate, (req, res) =>
  authController.changePassword(req, res)
);

module.exports = router;
