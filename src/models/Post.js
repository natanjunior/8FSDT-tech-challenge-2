'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Post extends Model {
		static associate(models) {
			// Post belongsTo User (author)
			Post.belongsTo(models.User, {
				foreignKey: 'author_id',
				as: 'author'
			});

			// Post belongsTo Discipline
			Post.belongsTo(models.Discipline, {
				foreignKey: 'discipline_id',
				as: 'discipline'
			});

			// Post hasMany PostReads
			Post.hasMany(models.PostRead, {
				foreignKey: 'post_id',
				as: 'reads'
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
					notEmpty: {
						msg: 'Título é obrigatório'
					},
					len: {
						args: [5, 255],
						msg: 'Título deve ter entre 5 e 255 caracteres'
					}
				}
			},
			content: {
				type: DataTypes.TEXT,
				allowNull: false,
				validate: {
					notEmpty: {
						msg: 'Conteúdo é obrigatório'
					},
					len: {
						args: [10],
						msg: 'Conteúdo deve ter no mínimo 10 caracteres'
					}
				}
			},
			author_id: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: 'users',
					key: 'id'
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE'
			},
			discipline_id: {
				type: DataTypes.UUID,
				allowNull: true,
				references: {
					model: 'disciplines',
					key: 'id'
				},
				onUpdate: 'CASCADE',
				onDelete: 'RESTRICT'
			},
			status: {
				type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED'),
				allowNull: false,
				defaultValue: 'DRAFT',
				set(value) {
					// Convert to uppercase to be case-insensitive
					this.setDataValue('status', value ? value.toUpperCase() : value);
				},
				validate: {
					isIn: {
						args: [['DRAFT', 'PUBLISHED', 'ARCHIVED']],
						msg: 'Status deve ser DRAFT ou PUBLISHED'
					}
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
