'use strict';

class CommentController {
  constructor(commentService) { this.commentService = commentService; }

  async searchComments(req, res) {
    try {
      const result = await this.commentService.searchComments(
        { postId: req.query.post_id, page: req.query.page, limit: req.query.limit, sort: req.query.sort },
        req.user?.role || null,
        req.user?.profileId || null
      );
      return res.status(200).json(result);
    } catch (e) { return res.status(e.status || 500).json({ error: e.message }); }
  }

  async createComment(req, res) {
    try {
      const c = await this.commentService.createComment(req.body, req.user.profileId, req.user.role);
      return res.status(201).json(c);
    } catch (e) { return res.status(e.status || 500).json({ error: e.message }); }
  }

  async deleteComment(req, res) {
    try {
      await this.commentService.deleteComment(req.params.id, req.user.role, req.user.profileId);
      return res.status(204).send();
    } catch (e) { return res.status(e.status || 500).json({ error: e.message }); }
  }
}

module.exports = CommentController;
