'use strict';

const DisciplineRepository = require('../repositories/discipline.repository');

class DisciplineService {
  /**
   * Lista todas as disciplinas ordenadas por label
   * @returns {Array} Array de disciplinas { id, label, created_at }
   */
  async listAll() {
    return DisciplineRepository.findAllOrdered();
  }
}

module.exports = new DisciplineService();
