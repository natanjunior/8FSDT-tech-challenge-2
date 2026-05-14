'use strict';

const { Discipline } = require('../models');

class DisciplineRepository {
	async findAllOrdered() {
		const rows = await Discipline.findAll({
			order: [['label', 'ASC']]
		});

		return rows.map((d) => {
			const plain = d.toJSON();
			return {
				id: plain.id,
				label: plain.label,
				created_at: plain.createdAt || plain.created_at
			};
		});
	}
}

module.exports = DisciplineRepository;
