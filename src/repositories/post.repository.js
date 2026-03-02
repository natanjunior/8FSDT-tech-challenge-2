'use strict';

const { Post, User, Discipline } = require('../models');

const defaultIncludes = [
	{
		model: User,
		as: 'author',
		attributes: ['id', 'name', 'role']
	},
	{
		model: Discipline,
		as: 'discipline',
		attributes: ['id', 'label']
	}
];

class PostRepository {
	async findAllPaginated(where, { limit, offset }) {
		const { count, rows } = await Post.findAndCountAll({
			where,
			include: defaultIncludes,
			order: [['created_at', 'DESC']],
			limit,
			offset,
			distinct: true
		});

		return { count, rows };
	}

	async findById(id) {
		return Post.findByPk(id, {
			include: defaultIncludes
		});
	}

	async create(data) {
		return Post.create(data);
	}

	async update(id, data) {
		const post = await Post.findByPk(id);

		if (!post) {
			return null;
		}

		await post.update(data);
		return post;
	}

	async delete(id) {
		return Post.destroy({ where: { id } });
	}

	async search(where, authorWhere, { limit, offset }) {
		const include = [
			{
				model: Discipline,
				as: 'discipline',
				attributes: ['id', 'label']
			}
		];

		const authorInclude = {
			model: User,
			as: 'author',
			attributes: ['id', 'name', 'role']
		};

		if (authorWhere) {
			authorInclude.where = authorWhere;
		}

		include.unshift(authorInclude);

		const { count, rows } = await Post.findAndCountAll({
			where,
			include,
			order: [['created_at', 'DESC']],
			limit,
			offset,
			distinct: true
		});

		return { count, rows };
	}
}

module.exports = PostRepository;
