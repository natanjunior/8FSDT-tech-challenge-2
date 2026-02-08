'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		static associate(models) {
			// User hasMany Posts (as author)
			User.hasMany(models.Post, {
				foreignKey: 'author_id',
				as: 'posts'
			});

			// User hasMany PostReads
			User.hasMany(models.PostRead, {
				foreignKey: 'user_id',
				as: 'post_reads'
			});

			// User hasMany UserSessions
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
			name: {
				type: DataTypes.STRING(255),
				allowNull: false,
				validate: {
					notEmpty: {
						msg: 'Nome é obrigatório'
					},
					len: {
						args: [3, 255],
						msg: 'Nome deve ter entre 3 e 255 caracteres'
					}
				}
			},
			email: {
				type: DataTypes.STRING(255),
				allowNull: false,
				unique: {
					name: 'users_email_unique',
					msg: 'Email já cadastrado'
				},
				validate: {
					isEmail: {
						msg: 'Email inválido'
					},
					notEmpty: {
						msg: 'Email é obrigatório'
					}
				}
			},
			role: {
				type: DataTypes.ENUM('TEACHER', 'STUDENT'),
				allowNull: false,
				defaultValue: 'STUDENT',
				validate: {
					isIn: {
						args: [['TEACHER', 'STUDENT']],
						msg: 'Role deve ser TEACHER ou STUDENT'
					}
				}
			}
		},
		{
			sequelize,
			modelName: 'User',
			tableName: 'users',
			underscored: true,
			timestamps: true
		}
	);

	return User;
};
