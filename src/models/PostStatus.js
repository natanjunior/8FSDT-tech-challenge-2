'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class PostStatus extends Model {
		static associate(models) {
			// PostStatus hasMany Posts
			PostStatus.hasMany(models.Post, {
				foreignKey: 'status_id',
				as: 'posts'
			});
		}
	}

	PostStatus.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
				allowNull: false
			},
			label: {
				type: DataTypes.STRING(50),
				allowNull: false,
				unique: {
					name: 'post_status_label_unique',
					msg: 'Status já cadastrado'
				},
				validate: {
					notEmpty: {
						msg: 'Nome do status é obrigatório'
					},
					isIn: {
						args: [['DRAFT', 'PUBLISHED', 'ARCHIVED']],
						msg: 'Status deve ser DRAFT, PUBLISHED ou ARCHIVED'
					}
				}
			}
		},
		{
			sequelize,
			modelName: 'PostStatus',
			tableName: 'post_status',
			underscored: true,
			timestamps: true,
			updatedAt: false
		}
	);

	return PostStatus;
};
