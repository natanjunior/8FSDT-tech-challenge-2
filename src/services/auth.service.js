'use strict';

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class AuthService {
  constructor(userRepository, userSessionRepository, teacherRepository, studentRepository) {
    this.userRepository = userRepository;
    this.userSessionRepository = userSessionRepository;
    this.teacherRepository = teacherRepository;
    this.studentRepository = studentRepository;
  }

  async login(login, password) {
    const user = await this.userRepository.findByLogin(login);
    if (!user) {
      // Constant-time mitigation: run a dummy compare so response time
      // doesn't reveal whether the login exists.
      await this.userRepository.verifyPassword(
        password,
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
      );
      const err = new Error('Credenciais inválidas');
      err.status = 401;
      throw err;
    }

    const ok = await this.userRepository.verifyPassword(password, user.password_hash);
    if (!ok) {
      const err = new Error('Credenciais inválidas');
      err.status = 401;
      throw err;
    }

    const profile = await this._resolveProfile(user);

    if (profile && profile.status === 'INATIVO') {
      const err = new Error('Usuário inativo');
      err.status = 401;
      throw err;
    }

    const sessionId = uuidv4();
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
    const expiresAt = new Date(Date.now() + this._parseExpiresIn(expiresIn));

    const payload = {
      id: user.id,
      role: user.role,
      sessionId,
      profileId: profile ? profile.id : null
    };

    const token = this.generateToken(payload);

    await this.userSessionRepository.create({
      id: sessionId,
      user_id: user.id,
      session_token: token,
      expires_at: expiresAt
    });

    return {
      user: { id: user.id, login: user.login, role: user.role },
      profile: profile ? this._serializeProfile(profile, user.role) : null,
      token
    };
  }

  async logout(sessionId) {
    await this.userSessionRepository.delete(sessionId);
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await this.userRepository.findByLogin(
      (await this.userRepository.findById(userId))?.login
    );
    if (!user) {
      const err = new Error('Usuário não encontrado');
      err.status = 404;
      throw err;
    }
    const ok = await this.userRepository.verifyPassword(currentPassword, user.password_hash);
    if (!ok) {
      const err = new Error('Senha atual incorreta');
      err.status = 400;
      err.field = 'current_password';
      throw err;
    }
    await this.userRepository.updatePasswordHash(userId, newPassword);
  }

  generateToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    });
  }

  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }

  async _resolveProfile(user) {
    if (user.role === 'TEACHER') {
      return this.teacherRepository.findByUserId(user.id);
    }
    if (user.role === 'STUDENT') {
      return this.studentRepository.findByUserId(user.id);
    }
    return null;
  }

  _serializeProfile(profile, role) {
    const plain = typeof profile.toJSON === 'function' ? profile.toJSON() : profile;
    const base = {
      id: plain.id,
      name: plain.name,
      email: plain.email,
      birth_date: plain.birth_date,
      pronouns: plain.pronouns,
      biography: plain.biography,
      status: plain.status
    };
    if (role === 'TEACHER') {
      base.disciplines = (plain.disciplines || []).map((d) => ({ id: d.id, label: d.label }));
    } else {
      base.course = plain.course;
    }
    return base;
  }

  _parseExpiresIn(duration) {
    const match = duration.match(/^(\d+)(s|m|h|d)$/);
    if (!match) return 24 * 60 * 60 * 1000;
    const value = parseInt(match[1]);
    const unit = match[2];
    const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
    return value * multipliers[unit];
  }
}

module.exports = AuthService;
