'use strict';

const { Model } = require('sequelize');
const { generateReference } = require('../utils/fhirReference');

module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    static associate(models) {
      Student.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  Student.init(
    {
      id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
        defaultValue: () => generateReference('Student')
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
      },
      course: {
        type: DataTypes.STRING(255),
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Student',
      tableName: 'students',
      underscored: true,
      timestamps: true
    }
  );

  return Student;
};
