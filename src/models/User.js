'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasOne(models.Teacher, {
        foreignKey: 'user_id',
        as: 'teacher'
      });

      User.hasOne(models.Student, {
        foreignKey: 'user_id',
        as: 'student'
      });

      User.hasMany(models.UserSession, {
        foreignKey: 'user_id',
        as: 'sessions'
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      login: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
          name: 'users_login_unique',
          msg: 'Login já cadastrado'
        }
      },
      password_hash: {
        type: DataTypes.STRING(60),
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('TEACHER', 'STUDENT'),
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      underscored: true,
      timestamps: true,
      defaultScope: {
        attributes: { exclude: ['password_hash'] }
      },
      scopes: {
        withPassword: { attributes: { include: ['password_hash'] } }
      }
    }
  );

  return User;
};
