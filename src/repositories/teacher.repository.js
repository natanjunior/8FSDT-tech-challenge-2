'use strict';

const { Op } = require('sequelize');
const { Teacher, Discipline, TeacherDiscipline, User, sequelize } = require('../models');

class TeacherRepository {
  async findAllPaginated({ page = 1, limit = 20, sort, name, status }) {
    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (status) where.status = status;

    const order = this._parseSort(sort) || [['name', 'ASC']];

    const { count, rows } = await Teacher.findAndCountAll({
      where,
      include: [{ model: Discipline, as: 'disciplines', through: { attributes: [] } }],
      order,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true
    });
    return { count, rows };
  }

  async findById(id) {
    return Teacher.findByPk(id, {
      include: [
        { model: Discipline, as: 'disciplines', through: { attributes: [] } },
        { model: User, as: 'user' }
      ]
    });
  }

  async findByUserId(userId) {
    return Teacher.findOne({
      where: { user_id: userId },
      include: [{ model: Discipline, as: 'disciplines', through: { attributes: [] } }]
    });
  }

  async create(data, options = {}) {
    return Teacher.create(data, options);
  }

  async update(id, data, options = {}) {
    const teacher = await Teacher.findByPk(id);
    if (!teacher) return null;
    await teacher.update(data, options);
    return teacher;
  }

  async setDisciplines(teacherId, disciplineIds, options = {}) {
    await TeacherDiscipline.destroy({ where: { teacher_id: teacherId }, ...options });
    if (!disciplineIds || disciplineIds.length === 0) return;
    const rows = disciplineIds.map((id) => ({ teacher_id: teacherId, discipline_id: id }));
    await TeacherDiscipline.bulkCreate(rows, options);
  }

  async disciplinesExist(disciplineIds) {
    if (!disciplineIds || disciplineIds.length === 0) return true;
    const count = await Discipline.count({ where: { id: disciplineIds } });
    return count === disciplineIds.length;
  }

  async transaction(callback) {
    return sequelize.transaction(callback);
  }

  _parseSort(sort) {
    if (!sort) return null;
    const map = { name: ['name'], created_at: ['created_at'], status: ['status'] };
    return sort
      .split(',')
      .map((raw) => {
        const desc = raw.startsWith('-');
        const field = desc ? raw.slice(1) : raw;
        const cols = map[field];
        if (!cols) return null;
        return [...cols, desc ? 'DESC' : 'ASC'];
      })
      .filter(Boolean);
  }
}

module.exports = TeacherRepository;
