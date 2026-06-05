'use strict';

class ReadController {
  constructor(postReadService) { this.postReadService = postReadService; }

  async markAsRead(req, res) {
    try {
      if (!req.user.profileId) {
        return res.status(403).json({ error: 'Usuário sem perfil para registrar leitura' });
      }
      const result = await this.postReadService.markAsRead(req.body.post_id, req.user.profileId);
      const { created, ...body } = result;
      return res.status(created ? 201 : 200).json(body);
    } catch (e) {
      return res.status(e.status || 500).json({ error: e.message });
    }
  }

  async searchReads(req, res) {
    try {
      if (!req.user.profileId) {
        return res.status(200).json({ data: [], pagination: { page: 1, limit: 0, total: 0, totalPages: 0 } });
      }
      const { post_id, page, limit, sort } = req.query;
      const result = await this.postReadService.searchReads(req.user.profileId, {
        postId: post_id, page, limit, sort
      });
      return res.status(200).json(result);
    } catch (e) {
      return res.status(e.status || 500).json({ error: e.message });
    }
  }
}

module.exports = ReadController;
