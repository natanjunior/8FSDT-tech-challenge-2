'use strict';

/**
 * Serializa um post para exibição na API.
 * Remove campos de FK redundantes (author_id, discipline_id)
 * mantendo apenas os objetos aninhados (author, discipline).
 *
 * @param {Object} post - Instância Sequelize ou objeto plain do post
 * @returns {Object} Post serializado
 */
function serializePost(post) {
	if (!post) return post;

	const plain = typeof post.toJSON === 'function' ? post.toJSON() : { ...post };

	const { author_id, discipline_id, ...rest } = plain;

	return {
		...rest,
		comments_count: parseInt(rest.comments_count) || 0,
		reads_count: parseInt(rest.reads_count) || 0
	};
}

/**
 * Serializa uma lista de posts.
 *
 * @param {Array} posts - Array de posts
 * @returns {Array} Posts serializados
 */
function serializePosts(posts) {
	return posts.map(serializePost);
}

module.exports = { serializePost, serializePosts };
