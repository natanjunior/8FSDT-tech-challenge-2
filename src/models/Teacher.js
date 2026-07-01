'use strict';

const { Model } = require('sequelize');
const { generateReference } = require('../utils/fhirReference');

module.exports = (sequelize, DataTypes) => {
  class Teacher extends Model {
    static associate(models) {
      Teacher.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      Teacher.belongsToMany(models.Discipline, {
        through: models.TeacherDiscipline,
        foreignKey: 'teacher_id',
        otherKey: 'discipline_id',
        as: 'disciplines'
      });

      Teacher.hasMany(models.Post, {
        foreignKey: 'author',
        as: 'posts'
      });
    }
  }

  Teacher.init(
    {
      id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
        defaultValue: () => generateReference('Teacher')
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Nome é obrigatório' },
          len: { args: [1, 255], msg: 'Nome deve ter entre 1 e 255 caracteres' }
        }
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: { isEmail: { msg: 'Email inválido' } }
      },
      birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      pronouns: {
        type: DataTypes.ENUM('ele/dele', 'ela/dela', 'elu/delu', 'outro'),
        allowNull: true
      },
      biography: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('ATIVO', 'INATIVO'),
        allowNull: false,
        defaultValue: 'ATIVO'
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
        unique: true
      }
    },
    {
      sequelize,
      modelName: 'Teacher',
      tableName: 'teachers',
      underscored: true,
      timestamps: true
    }
  );

  return Teacher;
};
