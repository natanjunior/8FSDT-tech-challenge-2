'use strict';

class StudentController {
  constructor(studentService) {
    this.studentService = studentService;
  }

  async list(req, res) {
    try { return res.status(200).json(await this.studentService.list(req.query)); }
    catch (e) { return this._fail(res, e); }
  }

  async getById(req, res) {
    try { return res.status(200).json(await this.studentService.getById(req.params.id)); }
    catch (e) { return this._fail(res, e); }
  }

  async me(req, res) {
    try {
      if (!req.user.profileId || !req.user.profileId.startsWith('Student/')) {
        return res.status(404).json({ error: 'Perfil de estudante não encontrado' });
      }
      return res.status(200).json(await this.studentService.getById(req.user.profileId));
    } catch (e) { return this._fail(res, e); }
  }

  async create(req, res) {
    try { return res.status(201).json(await this.studentService.create(req.body, req.user || null)); }
    catch (e) { return this._fail(res, e); }
  }

  async replace(req, res) {
    try { return res.status(200).json(await this.studentService.update(req.params.id, req.body, req.user)); }
    catch (e) { return this._fail(res, e); }
  }

  async patch(req, res) {
    try { return res.status(200).json(await this.studentService.update(req.params.id, req.body, req.user)); }
    catch (e) { return this._fail(res, e); }
  }

  async delete(req, res) {
    try { await this.studentService.delete(req.params.id); return res.status(204).send(); }
    catch (e) { return this._fail(res, e); }
  }

  _fail(res, e) {
    if (e.field) return res.status(e.status || 400).json({ errors: [{ field: e.field, message: e.message }] });
    return res.status(e.status || 500).json({ error: e.message });
  }
}

module.exports = StudentController;
