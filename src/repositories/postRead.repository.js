'use strict';

const { PostRead } = require('../models');
const { parseFhirSort } = require('../utils/sort');

const READ_SORT_FIELDS = {
  read_at: ['read_at']
};

const READ_DEFAULT_ORDER = [['read_at', 'DESC']];

class PostReadRepository {
	async findByPostAndUser(postId, userId) {
		return PostRead.findOne({
			where: { post_id: postId, user_id: userId }
		});
	}

	async create(data) {
		return PostRead.create(data);
	}

	/**
	 * Busca registros de leitura do usuário com paginação e ordenação.
	 *
	 * @param {string} userId  UUID do usuário autenticado
	 * @param {Object} options  { postId?, page, limit, sort }
	 */
	async findPaginated(userId, { postId, page, limit, sort }) {
		const offset = (page - 1) * limit;
		const order = parseFhirSort(sort, READ_SORT_FIELDS, READ_DEFAULT_ORDER);

		const where = { user_id: userId };
		if (postId) {
			where.post_id = postId;
		}

		const { count, rows } = await PostRead.findAndCountAll({
			where,
			order,
			limit,
			offset
		});

		return { count, rows };
	}
}

module.exports = PostReadRepository;
