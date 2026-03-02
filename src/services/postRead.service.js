'use strict';

const PostRepository = require('../repositories/post.repository');
const PostReadRepository = require('../repositories/postRead.repository');

class PostReadService {
  /**
   * Marca um post como lido por um usuário (idempotente)
   * @param {string} postId - UUID do post
   * @param {string} userId - UUID do usuário
   * @returns {Object} Registro de leitura { id, post_id, user_id, read_at }
   */
  async markAsRead(postId, userId) {
    // Verificar se post existe
    const post = await PostRepository.findById(postId);
    if (!post) {
      throw new Error('Post não encontrado');
    }

    // Buscar registro existente
    const existingRead = await PostReadRepository.findByPostAndUser(postId, userId);

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
    const newRead = await PostReadRepository.create({
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
    const record = await PostReadRepository.findByPostAndUser(postId, userId);

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
}

module.exports = new PostReadService();
