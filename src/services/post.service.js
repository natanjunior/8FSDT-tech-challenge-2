'use strict';

const { Op } = require('sequelize');
const { serializePost, serializePosts } = require('../utils/post.serializer');

class PostService {
  constructor(postRepository) { this.postRepository = postRepository; }

  async listPosts(filters = {}, userRole = null) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;
    const where = {};
    if (userRole !== 'TEACHER') where.status = 'PUBLISHED';
    const { count, rows } = await this.postRepository.findAllPaginated(where, { limit, offset, sort: filters.sort });
    return {
      data: serializePosts(rows),
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
    };
  }

  async getPostById(id, userRole = null) {
    const post = await this.postRepository.findById(id);
    if (!post) { const e = new Error('Post não encontrado'); e.status = 404; throw e; }
    if (userRole !== 'TEACHER' && post.status !== 'PUBLISHED') {
      const e = new Error('Acesso negado'); e.status = 403; throw e;
    }
    return serializePost(post);
  }

  async createPost(data, profileId) {
    if (!profileId || !profileId.startsWith('Teacher/')) {
      const e = new Error('Apenas professores podem criar posts'); e.status = 403; throw e;
    }
    const publishedAt = data.status === 'PUBLISHED' ? new Date() : null;
    const post = await this.postRepository.create({
      title: data.title,
      content: data.content,
      author: profileId,
      discipline_id: data.discipline_id,
      status: data.status || 'DRAFT',
      published_at: publishedAt
    });
    return this.getPostById(post.id, 'TEACHER');
  }

  async replacePost(id, data) {
    const post = await this.postRepository.findById(id);
    if (!post) { const e = new Error('Post não encontrado'); e.status = 404; throw e; }
    const fullData = {
      title: data.title, content: data.content,
      status: data.status, discipline_id: data.discipline_id || null
    };
    if (fullData.status === 'PUBLISHED' && !post.published_at) fullData.published_at = new Date();
    await this.postRepository.update(id, fullData);
    return this.getPostById(id, 'TEACHER');
  }

  async updatePost(id, data) {
    const post = await this.postRepository.findById(id);
    if (!post) { const e = new Error('Post não encontrado'); e.status = 404; throw e; }
    if (data.status === 'PUBLISHED' && !post.published_at) data.published_at = new Date();
    await this.postRepository.update(id, data);
    return this.getPostById(id, 'TEACHER');
  }

  async deletePost(id) {
    const post = await this.postRepository.findById(id);
    if (!post) { const e = new Error('Post não encontrado'); e.status = 404; throw e; }
    await this.postRepository.delete(id);
  }

  async searchPosts(filters = {}, userRole = null) {
    const { query, title, author, discipline, status, page, limit, sort } = filters;
    if (!query && !title && !author && !discipline && !status) {
      return this.listPosts({ page, limit, sort }, userRole);
    }
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;
    const where = {};
    if (query) where[Op.or] = [
      { title: { [Op.iLike]: `%${query}%` } },
      { content: { [Op.iLike]: `%${query}%` } }
    ];
    if (title) where.title = { [Op.iLike]: `%${title}%` };
    if (discipline) where.discipline_id = discipline;
    if (userRole !== 'TEACHER') where.status = 'PUBLISHED';
    else if (status) where.status = status;

    let authorWhere = null;
    if (author) authorWhere = { name: { [Op.iLike]: `%${author}%` } };

    const { count, rows } = await this.postRepository.search(where, authorWhere, { limit: limitNum, offset, sort });
    return {
      data: serializePosts(rows),
      pagination: { page: pageNum, limit: limitNum, total: count, totalPages: Math.ceil(count / limitNum) }
    };
  }
}

module.exports = PostService;
