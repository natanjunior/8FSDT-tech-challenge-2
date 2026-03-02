'use strict';

const { User } = require('../models');

class UserRepository {
	async findByEmail(email) {
		return User.findOne({ where: { email } });
	}
}

module.exports = UserRepository;
