'use strict';

const bcrypt = require('bcrypt');
const { User } = require('../models');

class UserRepository {
  async findByLogin(login) {
    return User.scope('withPassword').findOne({ where: { login } });
  }

  async findById(id) {
    return User.findByPk(id);
  }

  async create({ login, password, role }, options = {}) {
    const password_hash = await bcrypt.hash(password, 10);
    return User.create({ login, password_hash, role }, options);
  }

  async updatePasswordHash(id, password) {
    const password_hash = await bcrypt.hash(password, 10);
    return User.update({ password_hash }, { where: { id } });
  }

  async delete(id, options = {}) {
    return User.destroy({ where: { id }, ...options });
  }

  async verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  }
}

module.exports = UserRepository;
