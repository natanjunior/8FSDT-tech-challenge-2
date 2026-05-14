'use strict';

const { Comment, Sequelize } = require('../models');
const { parseFhirSort } = require('../utils/sort');

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Monta a expressão SQL para identificar comentários do usuário atual.
 * Retorna null se não houver identidade disponível.
 *
 * @param {string|null} userId    UUID do usuário autenticado
 * @param {string|null} anonymousId  UUID do header X-Anonymous-Id
 * @returns {Sequelize.literal|null}
 */
function buildMineExpression(userId, anonymousId) {
  const conditions = [];

  if (userId && UUID_REGEX.test(userId)) {
    conditions.push(`user_id = '${userId}'`);
  }
  if (anonymousId && UUID_REGEX.test(anonymousId)) {
    conditions.push(`anonymous_id = '${anonymousId}'`);
  }

  if (conditions.length === 0) return null;

  return Sequelize.literal(
    `CASE WHEN ${conditions.join(' OR ')} THEN 0 ELSE 1 END`
  );
}

class CommentRepository {
  /**
   * Verifica se um comentário pode ser deletado pela identidade fornecida.
   * TEACHER pode deletar qualquer comentário.
   * Dono autenticado ou anônimo pode deletar o próprio.
   */
  canDelete(comment, userRole, userId, anonymousId) {
    if (userRole === 'TEACHER') return true;
    if (userId && comment.user_id === userId) return true;
    if (
      anonymousId &&
      UUID_REGEX.test(anonymousId) &&
      comment.anonymous_id === anonymousId
    )
      return true;
    return false;
  }

  /**
   * Serializa um comentário para o response, calculando can_delete.
   */
  serialize(comment, userRole, userId, anonymousId) {
    const plain =
      typeof comment.toJSON === 'function' ? comment.toJSON() : { ...comment };

    return {
      id: plain.id,
      content: plain.content,
      author_name: plain.author_name,
      is_anonymous: plain.user_id === null,
      can_delete: this.canDelete(plain, userRole, userId, anonymousId),
      created_at: plain.createdAt || plain.created_at
    };
  }

  /**
   * Busca comentários com paginação e ordenação.
   *
   * @param {Object} options
   * @param {string|undefined} options.postId   Filtrar por post
   * @param {number} options.page
   * @param {number} options.limit
   * @param {string|undefined} options.sort     FHIR sort param
   * @param {string|null} options.userId        Para campo mine
   * @param {string|null} options.anonymousId   Para campo mine
   */
  async search({ postId, page, limit, sort, userId, anonymousId }) {
    const offset = (page - 1) * limit;
    const mineExpr = buildMineExpression(userId, anonymousId);

    // Campo mine só entra no fieldMap quando há identidade disponível
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
    if (postId) {
      where.post_id = postId;
    }

    const { count, rows } = await Comment.findAndCountAll({
      where,
      order,
      limit,
      offset,
      distinct: true
    });

    return { count, rows };
  }

  async create(data) {
    return Comment.create(data);
  }

  async findById(id) {
    return Comment.findByPk(id);
  }

  async delete(id) {
    return Comment.destroy({ where: { id } });
  }
}

module.exports = CommentRepository;
