'use strict';

const { Discipline } = require('../models');

class DisciplineRepository {
	async findAllOrdered() {
		return Discipline.findAll({
			order: [['label', 'ASC']]
		});
	}
}

module.exports = new DisciplineRepository();
