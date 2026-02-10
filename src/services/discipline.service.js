const { Discipline } = require('../models');

class DisciplineService {
  /**
   * Lista todas as disciplinas ordenadas por label
   * @returns {Array} Array de disciplinas { id, label, created_at }
   */
  async listAll() {
    const disciplines = await Discipline.findAll({
      order: [['label', 'ASC']]
    });

    return disciplines;
  }
}

module.exports = new DisciplineService();
