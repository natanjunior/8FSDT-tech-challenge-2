'use strict';

const { Post, User, Discipline } = require('../models');
const { parseFhirSort } = require('../utils/sort');

const defaultIncludes = [
  {
    model: User,
    as: 'author',
    attributes: ['id', 'name', 'role']
  },
  {
    model: Discipline,
    as: 'discipline',
    attributes: ['id', 'label']
  }
];

/**
 * Mapa de campos de ordenação permitidos para posts.
 * Valores são arrays Sequelize; parseFhirSort appenda a direção.
 */
const POST_SORT_FIELDS = {
  title: ['title'],
  status: ['status'],
  published_at: ['published_at'],
  created_at: ['created_at'],
  author: [{ model: User, as: 'author' }, 'name'],
  discipline: [{ model: Discipline, as: 'discipline' }, 'label']
};

const POST_DEFAULT_ORDER = [['created_at', 'DESC']];

class PostRepository {
  /**
   * Lista posts com paginação e ordenação.
   * @param {Object} where  Cláusula WHERE Sequelize
   * @param {Object} options  { limit, offset, sort }
   *   sort: string no formato FHIR (ex: "-published_at,title")
   */
  async findAllPaginated(where, { limit, offset, sort }) {
    const order = parseFhirSort(sort, POST_SORT_FIELDS, POST_DEFAULT_ORDER);

    const { count, rows } = await Post.findAndCountAll({
      where,
      include: defaultIncludes,
      order,
      limit,
      offset,
      distinct: true
    });

    return { count, rows };
  }

  async findById(id) {
    return Post.findByPk(id, {
      include: defaultIncludes
    });
  }

  async create(data) {
    return Post.create(data);
  }

  async update(id, data) {
    const post = await Post.findByPk(id);
    if (!post) return null;
    await post.update(data);
    return post;
  }

  async delete(id) {
    return Post.destroy({ where: { id } });
  }

  /**
   * Busca posts com filtros opcionais.
   * @param {Object} where  Cláusula WHERE para o Post (inclui status, discipline_id, Op.or etc.)
   * @param {Object|null} authorWhere  Filtro opcional para o autor (busca por nome)
   * @param {Object} options  { limit, offset, sort }
   */
  async search(where, authorWhere, { limit, offset, sort }) {
    const order = parseFhirSort(sort, POST_SORT_FIELDS, POST_DEFAULT_ORDER);

    const include = [
      {
        model: Discipline,
        as: 'discipline',
        attributes: ['id', 'label']
      }
    ];

    const authorInclude = {
      model: User,
      as: 'author',
      attributes: ['id', 'name', 'role']
    };

    if (authorWhere) {
      authorInclude.where = authorWhere;
    }

    include.unshift(authorInclude);

    const { count, rows } = await Post.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true
    });

    return { count, rows };
  }
}

module.exports = PostRepository;
