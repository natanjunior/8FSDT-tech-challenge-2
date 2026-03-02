'use strict';

class DisciplineService {
  constructor(disciplineRepository) {
    this.disciplineRepository = disciplineRepository;
  }

  /**
   * Lista todas as disciplinas ordenadas por label
   * @returns {Array} Array de disciplinas { id, label, created_at }
   */
  async listAll() {
    return this.disciplineRepository.findAllOrdered();
  }
}

module.exports = DisciplineService;
