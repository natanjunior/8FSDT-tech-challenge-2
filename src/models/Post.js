'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.Teacher, {
        foreignKey: 'author',
        targetKey: 'id',
        as: 'author_teacher'
      });

      Post.belongsTo(models.Discipline, {
        foreignKey: 'discipline_id',
        as: 'discipline'
      });

      Post.hasMany(models.PostRead, {
        foreignKey: 'post_id',
        as: 'reads'
      });

      Post.hasMany(models.Comment, {
        foreignKey: 'post_id',
        as: 'comments'
      });
    }
  }

  Post.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Título é obrigatório' },
          len: { args: [5, 255], msg: 'Título deve ter entre 5 e 255 caracteres' }
        }
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Conteúdo é obrigatório' },
          len: { args: [10], msg: 'Conteúdo deve ter no mínimo 10 caracteres' }
        }
      },
      author: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: { model: 'teachers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      discipline_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'disciplines', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      status: {
        type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED'),
        allowNull: false,
        defaultValue: 'DRAFT',
        set(value) {
          this.setDataValue('status', value ? value.toUpperCase() : value);
        }
      },
      published_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: 'Post',
      tableName: 'posts',
      underscored: true,
      timestamps: true
    }
  );

  return Post;
};
