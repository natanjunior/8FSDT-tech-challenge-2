'use strict';

const { Comment, Teacher, Student, Sequelize } = require('../models');
const { parseFhirSort } = require('../utils/sort');
const { parseReference } = require('../utils/fhirReference');

function buildMineExpression(profileId) {
  if (!profileId || !parseReference(profileId)) return null;
  return Sequelize.literal(
    `CASE WHEN author = ${Sequelize.escape(profileId)} THEN 0 ELSE 1 END`
  );
}

class CommentRepository {
  canDelete(comment, userRole, profileId) {
    if (userRole === 'TEACHER') return true;
    if (profileId && comment.author === profileId) return true;
    return false;
  }

  async search({ postId, page, limit, sort, profileId }) {
    const offset = (page - 1) * limit;
    const mineExpr = buildMineExpression(profileId);
    const fieldMap = {
      created_at: ['created_at'],
      updated_at: ['updated_at'],
      ...(mineExpr ? { mine: [mineExpr] } : {})
    };
    const defaultOrder = mineExpr
      ? [[mineExpr, 'ASC'], ['created_at', 'DESC']]
      : [['created_at', 'DESC']];
    const order = parseFhirSort(sort, fieldMap, defaultOrder);

    const where = {};
    if (postId) where.post_id = postId;

    const { count, rows } = await Comment.findAndCountAll({
      where, order, limit, offset, distinct: true
    });

    const refs = rows.map((r) => parseReference(r.author)).filter(Boolean);
    const teacherIds = refs.filter((r) => r.type === 'Teacher').map((r) => `${r.type}/${r.id}`);
    const studentIds = refs.filter((r) => r.type === 'Student').map((r) => `${r.type}/${r.id}`);

    const teachersMap = new Map();
    const studentsMap = new Map();
    if (teacherIds.length) {
      const teachers = await Teacher.findAll({ where: { id: teacherIds }, attributes: ['id', 'name'] });
      teachers.forEach((t) => teachersMap.set(t.id, t));
    }
    if (studentIds.length) {
      const students = await Student.findAll({ where: { id: studentIds }, attributes: ['id', 'name'] });
      students.forEach((s) => studentsMap.set(s.id, s));
    }

    const enriched = rows.map((r) => {
      const ref = parseReference(r.author);
      const map = ref?.type === 'Teacher' ? teachersMap : studentsMap;
      const found = map.get(r.author);
      return {
        raw: r,
        author: ref && found ? { id: r.author, type: ref.type, name: found.name } : null
      };
    });

    return { count, rows: enriched };
  }

  serialize(enriched, userRole, profileId) {
    const r = enriched.raw;
    const plain = typeof r.toJSON === 'function' ? r.toJSON() : { ...r };
    return {
      id: plain.id,
      content: plain.content,
      author: enriched.author,
      can_delete: this.canDelete(plain, userRole, profileId),
      created_at: plain.createdAt || plain.created_at
    };
  }

  async findById(id) { return Comment.findByPk(id); }
  async create(data) { return Comment.create(data); }
  async delete(id) { return Comment.destroy({ where: { id } }); }
}

module.exports = CommentRepository;
