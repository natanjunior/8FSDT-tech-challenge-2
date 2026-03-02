'use strict';

const { PostRead } = require('../models');

class PostReadRepository {
	async findByPostAndUser(postId, userId) {
		return PostRead.findOne({
			where: { post_id: postId, user_id: userId }
		});
	}

	async create(data) {
		return PostRead.create(data);
	}
}

module.exports = new PostReadRepository();
