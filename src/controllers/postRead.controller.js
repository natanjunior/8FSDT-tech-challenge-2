const PostReadService = require('../services/postRead.service');

class PostReadController {
  /**
   * Marca um post como lido
   * POST /posts/:id/read
   */
  async markAsRead(req, res) {
    try {
      const postId = req.params.id;
      const userId = req.user.id;

      const result = await PostReadService.markAsRead(postId, userId);

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

      const result = await PostReadService.checkIfRead(postId, userId);

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PostReadController();
