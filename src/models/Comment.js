'use strict';

const { Model } = require('sequelize');
const { isReference } = require('../utils/fhirReference');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.Post, {
        foreignKey: 'post_id',
        as: 'post'
      });
    }
  }

  Comment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      post_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      author: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          isFhirReference(value) {
            if (!isReference(value)) {
              throw new Error('author deve ser uma referência FHIR válida (Teacher/<uuid> ou Student/<uuid>)');
            }
          }
        }
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Conteúdo é obrigatório' },
          len: { args: [1, 1000], msg: 'Conteúdo deve ter entre 1 e 1000 caracteres' }
        }
      }
    },
    {
      sequelize,
      modelName: 'Comment',
      tableName: 'comments',
      underscored: true,
      timestamps: true
    }
  );

  return Comment;
};
