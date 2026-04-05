'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.Post, {
        foreignKey: 'post_id',
        as: 'post'
      });

      Comment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'author'
      });

      models.Post.hasMany(Comment, {
        foreignKey: 'post_id',
        as: 'comments'
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      anonymous_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      author_name: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
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
