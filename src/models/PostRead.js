'use strict';

const { Model } = require('sequelize');
const { isReference } = require('../utils/fhirReference');

module.exports = (sequelize, DataTypes) => {
  class PostRead extends Model {
    static associate(models) {
      PostRead.belongsTo(models.Post, {
        foreignKey: 'post_id',
        as: 'post'
      });
    }
  }

  PostRead.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      post_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'posts', key: 'id' },
        onDelete: 'CASCADE'
      },
      reader: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          isFhirReference(value) {
            if (!isReference(value)) {
              throw new Error('reader deve ser uma referência FHIR válida');
            }
          }
        }
      },
      read_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'PostRead',
      tableName: 'post_reads',
      underscored: true,
      timestamps: false
    }
  );

  return PostRead;
};
