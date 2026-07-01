'use strict';

class PostReadService {
  constructor(postRepository, postReadRepository) {
    this.postRepository = postRepository;
    this.postReadRepository = postReadRepository;
  }

  async markAsRead(postId, reader) {
    const post = await this.postRepository.findById(postId);
    if (!post) { const e = new Error('Post não encontrado'); e.status = 404; throw e; }

    const existing = await this.postReadRepository.findByPostAndReader(postId, reader);
    if (existing) {
      return { created: false, id: existing.id, post_id: existing.post_id, reader: existing.reader, read_at: existing.read_at };
    }
    const newRead = await this.postReadRepository.create({ post_id: postId, reader, read_at: new Date() });
    return { created: true, id: newRead.id, post_id: newRead.post_id, reader: newRead.reader, read_at: newRead.read_at };
  }

  async searchReads(reader, filters = {}) {
    const page = parseInt(filters.page) || 1;
    const limit = Math.min(parseInt(filters.limit) || 20, 100);
    const sort = filters.sort;
    const postId = filters.postId;
    const { count, rows } = await this.postReadRepository.findPaginated(reader, { postId, page, limit, sort });
    return {
      data: rows.map((r) => ({ id: r.id, post_id: r.post_id, reader: r.reader, read_at: r.read_at })),
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
    };
  }
}

module.exports = PostReadService;
