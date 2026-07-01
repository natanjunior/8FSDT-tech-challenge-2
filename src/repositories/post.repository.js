'use strict';

const { Op } = require('sequelize');
const { Post, Teacher, Discipline, Sequelize } = require('../models');
const { parseFhirSort } = require('../utils/sort');

const countAttributes = [
  [Sequelize.literal('(SELECT COUNT(*) FROM comments WHERE comments.post_id = "Post"."id")'), 'comments_count'],
  [Sequelize.literal('(SELECT COUNT(*) FROM post_reads WHERE post_reads.post_id = "Post"."id")'), 'reads_count']
];

const defaultIncludes = [
  { model: Teacher, as: 'author_teacher', attributes: ['id', 'name', 'pronouns'] },
  { model: Discipline, as: 'discipline', attributes: ['id', 'label'] }
];

const POST_SORT_FIELDS = {
  title: ['title'],
  status: ['status'],
  published_at: ['published_at'],
  created_at: ['created_at'],
  author: [{ model: Teacher, as: 'author_teacher' }, 'name'],
  discipline: [{ model: Discipline, as: 'discipline' }, 'label']
};

const POST_DEFAULT_ORDER = [['created_at', 'DESC']];

class PostRepository {
  async findAllPaginated(where, { limit, offset, sort }) {
    const order = parseFhirSort(sort, POST_SORT_FIELDS, POST_DEFAULT_ORDER);
    return Post.findAndCountAll({
      where, attributes: { include: countAttributes }, include: defaultIncludes,
      order, limit, offset, distinct: true
    });
  }

  async findById(id) {
    return Post.findByPk(id, { attributes: { include: countAttributes }, include: defaultIncludes });
  }

  async create(data) { return Post.create(data); }
  async update(id, data) {
    const p = await Post.findByPk(id); if (!p) return null;
    await p.update(data); return p;
  }
  async delete(id) { return Post.destroy({ where: { id } }); }

  async search(where, authorWhere, { limit, offset, sort }) {
    const order = parseFhirSort(sort, POST_SORT_FIELDS, POST_DEFAULT_ORDER);
    const teacherInclude = {
      model: Teacher, as: 'author_teacher', attributes: ['id', 'name', 'pronouns']
    };
    if (authorWhere) teacherInclude.where = authorWhere;
    return Post.findAndCountAll({
      where,
      attributes: { include: countAttributes },
      include: [teacherInclude, { model: Discipline, as: 'discipline', attributes: ['id', 'label'] }],
      order, limit, offset, distinct: true
    });
  }
}

module.exports = PostRepository;
