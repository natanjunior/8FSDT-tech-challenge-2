'use strict';

class CommentService {
  constructor(commentRepository, postRepository) {
    this.commentRepository = commentRepository;
    this.postRepository = postRepository;
  }

  /**
   * Busca comentários com paginação e ordenação.
   *
   * @param {Object} filters  { postId?, page, limit, sort? }
   * @param {string|null} userRole
   * @param {string|null} userId
   * @param {string|null} anonymousId  Valor do header X-Anonymous-Id
   */
  async searchComments(filters = {}, userRole, userId, anonymousId) {
    const page = parseInt(filters.page) || 1;
    const limit = Math.min(parseInt(filters.limit) || 10, 50);
    const sort = filters.sort;
    const postId = filters.postId;

    const { count, rows } = await this.commentRepository.search({
      postId,
      page,
      limit,
      sort,
      userId,
      anonymousId
    });

    const totalPages = Math.ceil(count / limit);

    return {
      data: rows.map((c) =>
        this.commentRepository.serialize(c, userRole, userId, anonymousId)
      ),
      pagination: { page, limit, total: count, totalPages }
    };
  }

  /**
   * Cria um novo comentário.
   *
   * @param {Object} body  { post_id, content, author_name? }
   * @param {string|null} userId
   * @param {string|null} userRole
   * @param {string|null} anonymousId
   */
  async createComment(body, userId, userRole, anonymousId) {
    const post = await this.postRepository.findById(body.post_id);

    if (!post) {
      throw new Error('Post não encontrado');
    }

    const comment = await this.commentRepository.create({
      post_id: body.post_id,
      content: body.content,
      author_name: body.author_name || null,
      user_id: userId || null,
      anonymous_id: userId ? null : (anonymousId || null)
    });

    return this.commentRepository.serialize(comment, userRole, userId, anonymousId);
  }

  /**
   * Deleta um comentário se a identidade tiver permissão.
   *
   * @param {string} commentId
   * @param {string|null} userRole
   * @param {string|null} userId
   * @param {string|null} anonymousId
   */
  async deleteComment(commentId, userRole, userId, anonymousId) {
    const comment = await this.commentRepository.findById(commentId);

    if (!comment) {
      throw new Error('Comentário não encontrado');
    }

    if (!this.commentRepository.canDelete(comment, userRole, userId, anonymousId)) {
      throw new Error('Sem permissão para excluir este comentário');
    }

    await this.commentRepository.delete(commentId);
  }
}

module.exports = CommentService;
