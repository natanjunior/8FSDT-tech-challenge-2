'use strict';

class PostReadService {
  constructor(postRepository, postReadRepository) {
    this.postRepository = postRepository;
    this.postReadRepository = postReadRepository;
  }
  /**
   * Marca um post como lido por um usuário (idempotente)
   * @param {string} postId - UUID do post
   * @param {string} userId - UUID do usuário
   * @returns {Object} Registro de leitura { id, post_id, user_id, read_at }
   */
  async markAsRead(postId, userId) {
    // Verificar se post existe
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new Error('Post não encontrado');
    }

    // Buscar registro existente
    const existingRead = await this.postReadRepository.findByPostAndUser(postId, userId);

    // Se já existe, retornar registro existente (idempotente)
    if (existingRead) {
      return {
        id: existingRead.id,
        post_id: existingRead.post_id,
        user_id: existingRead.user_id,
        read_at: existingRead.read_at
      };
    }

    // Se não existe, criar novo registro
    const newRead = await this.postReadRepository.create({
      post_id: postId,
      user_id: userId,
      read_at: new Date()
    });

    return {
      id: newRead.id,
      post_id: newRead.post_id,
      user_id: newRead.user_id,
      read_at: newRead.read_at
    };
  }

  /**
   * Verifica se um usuário já leu um post
   * @param {string} postId - UUID do post
   * @param {string} userId - UUID do usuário
   * @returns {Object} { read: boolean, read_at: Date|null }
   */
  async checkIfRead(postId, userId) {
    const record = await this.postReadRepository.findByPostAndUser(postId, userId);

    if (record) {
      return {
        read: true,
        read_at: record.read_at
      };
    }

    return {
      read: false,
      read_at: null
    };
  }

  /**
   * Busca leituras do usuário autenticado com paginação e ordenação.
   *
   * @param {string} userId
   * @param {Object} filters  { postId?, page, limit, sort }
   * @returns {Object} { data, pagination }
   */
  async searchReads(userId, filters = {}) {
    const page = parseInt(filters.page) || 1;
    const limit = Math.min(parseInt(filters.limit) || 20, 100);
    const sort = filters.sort;
    const postId = filters.postId;

    const { count, rows } = await this.postReadRepository.findPaginated(userId, {
      postId,
      page,
      limit,
      sort
    });

    const totalPages = Math.ceil(count / limit);

    return {
      data: rows.map((r) => ({
        id: r.id,
        post_id: r.post_id,
        user_id: r.user_id,
        read_at: r.read_at
      })),
      pagination: { page, limit, total: count, totalPages }
    };
  }
}

module.exports = PostReadService;
