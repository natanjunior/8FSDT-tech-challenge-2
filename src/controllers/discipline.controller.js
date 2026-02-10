const DisciplineService = require('../services/discipline.service');

class DisciplineController {
  /**
   * Lista todas as disciplinas
   * GET /disciplines
   */
  async listAll(req, res) {
    try {
      const disciplines = await DisciplineService.listAll();

      return res.status(200).json(disciplines);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new DisciplineController();
