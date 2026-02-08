'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class PostRead extends Model {
		static associate(models) {
			// PostRead belongsTo Post
			PostRead.belongsTo(models.Post, {
				foreignKey: 'post_id',
				as: 'post'
			});

			// PostRead belongsTo User
			PostRead.belongsTo(models.User, {
				foreignKey: 'user_id',
				as: 'user'
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
				references: {
					model: 'posts',
					key: 'id'
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE'
			},
			user_id: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id'
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE'
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
