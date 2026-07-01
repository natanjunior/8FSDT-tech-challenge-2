'use strict';

const { Op } = require('sequelize');
const { Student, User, sequelize } = require('../models');

class StudentRepository {
  async findAllPaginated({ page = 1, limit = 20, sort, name, status }) {
    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (status) where.status = status;

    const order = this._parseSort(sort) || [['name', 'ASC']];

    const { count, rows } = await Student.findAndCountAll({
      where, order,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true
    });
    return { count, rows };
  }

  async findById(id) {
    return Student.findByPk(id, { include: [{ model: User, as: 'user' }] });
  }

  async findByUserId(userId) {
    return Student.findOne({ where: { user_id: userId } });
  }

  async create(data, options = {}) {
    return Student.create(data, options);
  }

  async update(id, data, options = {}) {
    const s = await Student.findByPk(id);
    if (!s) return null;
    await s.update(data, options);
    return s;
  }

  async transaction(callback) {
    return sequelize.transaction(callback);
  }

  _parseSort(sort) {
    if (!sort) return null;
    const map = { name: ['name'], created_at: ['created_at'], status: ['status'] };
    return sort.split(',').map((raw) => {
      const desc = raw.startsWith('-');
      const field = desc ? raw.slice(1) : raw;
      const cols = map[field];
      if (!cols) return null;
      return [...cols, desc ? 'DESC' : 'ASC'];
    }).filter(Boolean);
  }
}

module.exports = StudentRepository;
