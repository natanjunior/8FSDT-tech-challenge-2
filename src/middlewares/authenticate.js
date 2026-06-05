'use strict';

function createAuthenticate(authService, userSessionRepository) {
  return async function authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: 'Token não fornecido' });

      const token = authHeader.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Token não fornecido' });

      const decoded = authService.verifyToken(token);
      const session = await userSessionRepository.findById(decoded.sessionId);
      if (!session) return res.status(401).json({ error: 'Sessão inválida' });

      if (new Date() > session.expires_at) {
        await userSessionRepository.delete(decoded.sessionId);
        return res.status(401).json({ error: 'Sessão expirada' });
      }

      req.user = {
        id: decoded.id,
        role: decoded.role,
        sessionId: decoded.sessionId,
        profileId: decoded.profileId || null
      };
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }
  };
}

module.exports = { createAuthenticate };
