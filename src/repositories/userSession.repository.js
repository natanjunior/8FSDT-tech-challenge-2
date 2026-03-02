'use strict';

const { UserSession } = require('../models');

class UserSessionRepository {
	async create(data) {
		return UserSession.create(data);
	}

	async findById(id) {
		return UserSession.findByPk(id);
	}

	async delete(id) {
		return UserSession.destroy({ where: { id } });
	}
}

module.exports = new UserSessionRepository();
