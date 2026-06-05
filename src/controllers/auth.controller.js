'use strict';

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async login(req, res) {
    try {
      const { login, password } = req.body;
      const result = await this.authService.login(login, password);
      return res.status(200).json(result);
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({ error: error.message });
    }
  }

  async logout(req, res) {
    try {
      await this.authService.logout(req.user.sessionId);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  async changePassword(req, res) {
    try {
      await this.authService.changePassword(
        req.user.id,
        req.body.current_password,
        req.body.new_password
      );
      return res.status(204).send();
    } catch (error) {
      if (error.field) {
        return res.status(error.status || 400).json({
          errors: [{ field: error.field, message: error.message }]
        });
      }
      const status = error.status || 500;
      return res.status(status).json({ error: error.message });
    }
  }
}

module.exports = AuthController;
