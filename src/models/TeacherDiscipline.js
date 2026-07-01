'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TeacherDiscipline extends Model {
    static associate() {
      // Junction não precisa de associate explícito além do que belongsToMany já faz
    }
  }

  TeacherDiscipline.init(
    {
      teacher_id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      discipline_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'TeacherDiscipline',
      tableName: 'teacher_disciplines',
      underscored: true,
      timestamps: true,
      updatedAt: false
    }
  );

  return TeacherDiscipline;
};
