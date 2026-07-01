'use strict';

class TeacherController {
  constructor(teacherService) {
    this.teacherService = teacherService;
  }

  async list(req, res) {
    try {
      const result = await this.teacherService.list(req.query);
      return res.status(200).json(result);
    } catch (e) {
      return this._fail(res, e);
    }
  }

  async getById(req, res) {
    try {
      return res.status(200).json(await this.teacherService.getById(req.params.id));
    } catch (e) { return this._fail(res, e); }
  }

  async me(req, res) {
    try {
      if (!req.user.profileId || !req.user.profileId.startsWith('Teacher/')) {
        return res.status(404).json({ error: 'Perfil de professor não encontrado' });
      }
      return res.status(200).json(await this.teacherService.getById(req.user.profileId));
    } catch (e) { return this._fail(res, e); }
  }

  async create(req, res) {
    try {
      const teacher = await this.teacherService.create(req.body);
      return res.status(201).json(teacher);
    } catch (e) { return this._fail(res, e); }
  }

  async replace(req, res) {
    try {
      const teacher = await this.teacherService.update(req.params.id, req.body, req.user);
      return res.status(200).json(teacher);
    } catch (e) { return this._fail(res, e); }
  }

  async patch(req, res) {
    try {
      const teacher = await this.teacherService.update(req.params.id, req.body, req.user);
      return res.status(200).json(teacher);
    } catch (e) { return this._fail(res, e); }
  }

  async delete(req, res) {
    try {
      await this.teacherService.delete(req.params.id);
      return res.status(204).send();
    } catch (e) { return this._fail(res, e); }
  }

  _fail(res, e) {
    if (e.field) {
      return res.status(e.status || 400).json({ errors: [{ field: e.field, message: e.message }] });
    }
    return res.status(e.status || 500).json({ error: e.message });
  }
}

module.exports = TeacherController;
