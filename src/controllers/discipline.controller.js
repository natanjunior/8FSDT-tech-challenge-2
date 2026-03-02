'use strict';

class DisciplineController {
  constructor(disciplineService) {
    this.disciplineService = disciplineService;
  }

  /**
   * Lista todas as disciplinas
   * GET /disciplines
   */
  async listAll(req, res) {
    try {
      const disciplines = await this.disciplineService.listAll();

      return res.status(200).json(disciplines);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = DisciplineController;
