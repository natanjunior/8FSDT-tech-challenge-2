'use strict';

class PostReadController {
  constructor(postReadService) {
    this.postReadService = postReadService;
  }

  /**
   * Marca um post como lido
   * POST /posts/:id/read
   */
  async markAsRead(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.user.id;

      const result = await this.postReadService.markAsRead(postId, userId);

      return res.status(201).json(result);
    } catch (error) {
      if (error.message === 'Post não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Verifica se um post foi lido
   * GET /posts/:id/read
   */
  async checkIfRead(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.user.id;

      const result = await this.postReadService.checkIfRead(postId, userId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PostReadController;
