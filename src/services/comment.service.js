'use strict';

class CommentService {
  constructor(commentRepository, postRepository) {
    this.commentRepository = commentRepository;
    this.postRepository = postRepository;
  }

  async searchComments(filters = {}, userRole, profileId) {
    const page = parseInt(filters.page) || 1;
    const limit = Math.min(parseInt(filters.limit) || 10, 50);
    const sort = filters.sort;
    const postId = filters.postId;

    const { count, rows } = await this.commentRepository.search({
      postId, page, limit, sort, profileId
    });

    return {
      data: rows.map((c) => this.commentRepository.serialize(c, userRole, profileId)),
      pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) }
    };
  }

  async createComment(body, profileId, userRole) {
    if (!profileId) {
      const e = new Error('Não autenticado'); e.status = 401; throw e;
    }
    const post = await this.postRepository.findById(body.post_id);
    if (!post) {
      const e = new Error('Post não encontrado'); e.status = 404; throw e;
    }
    const comment = await this.commentRepository.create({
      post_id: body.post_id,
      content: body.content,
      author: profileId
    });
    const enriched = await this.commentRepository.search({ postId: body.post_id, page: 1, limit: 50, profileId });
    const mine = enriched.rows.find((r) => r.raw.id === comment.id);
    return this.commentRepository.serialize(mine, userRole, profileId);
  }

  async deleteComment(commentId, userRole, profileId) {
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) { const e = new Error('Comentário não encontrado'); e.status = 404; throw e; }
    if (!this.commentRepository.canDelete(comment, userRole, profileId)) {
      const e = new Error('Sem permissão para excluir este comentário'); e.status = 403; throw e;
    }
    await this.commentRepository.delete(commentId);
  }
}

module.exports = CommentService;
