'use strict';

class ReadController {
  constructor(postReadService) {
    this.postReadService = postReadService;
  }

  /**
   * POST /reads
   * Marca um post como lido (idempotente)
   */
  async markAsRead(req, res) {
    try {
      const { post_id } = req.body;
      const userId = req.user.id;

      const result = await this.postReadService.markAsRead(post_id, userId);

      // markAsRead sinaliza se foi criado agora (created: true) ou já existia (created: false)
      const { created, ...body } = result;

      return res.status(created ? 201 : 200).json(body);
    } catch (error) {
      if (error.message === 'Post não encontrado') {
        return res.status(404).json({ error: error.message });
      }
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * GET /reads/search
   * Lista leituras do usuário autenticado
   */
  async searchReads(req, res) {
    try {
      const { post_id, page, limit, sort } = req.query;
      const userId = req.user.id;

      const result = await this.postReadService.searchReads(userId, {
        postId: post_id,
        page,
        limit,
        sort
      });

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ReadController;
