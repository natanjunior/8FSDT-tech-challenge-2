'use strict';

class CommentController {
  constructor(commentService) {
    this.commentService = commentService;
  }

  /**
   * GET /comments/search
   */
  async searchComments(req, res) {
    try {
      const { post_id, page, limit, sort } = req.query;
      const userRole = req.user?.role || null;
      const userId = req.user?.id || null;
      const anonymousId = req.headers['x-anonymous-id'] || null;

      const result = await this.commentService.searchComments(
        { postId: post_id, page, limit, sort },
        userRole,
        userId,
        anonymousId
      );

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * POST /comments
   */
  async createComment(req, res) {
    try {
      const userRole = req.user?.role || null;
      const userId = req.user?.id || null;
      const anonymousId = req.headers['x-anonymous-id'] || null;

      const comment = await this.commentService.createComment(
        req.body,
        userId,
        userRole,
        anonymousId
      );

      return res.status(201).json(comment);
    } catch (error) {
      if (error.message === 'Post não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * DELETE /comments/:id
   */
  async deleteComment(req, res) {
    try {
      const { id } = req.params;
      const userRole = req.user?.role || null;
      const userId = req.user?.id || null;
      const anonymousId = req.headers['x-anonymous-id'] || null;

      await this.commentService.deleteComment(id, userRole, userId, anonymousId);

      return res.status(204).send();
    } catch (error) {
      if (error.message === 'Comentário não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      if (error.message === 'Sem permissão para excluir este comentário') {
        return res.status(403).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = CommentController;
