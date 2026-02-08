'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class UserSession extends Model {
		static associate(models) {
			// UserSession belongsTo User
			UserSession.belongsTo(models.User, {
				foreignKey: 'user_id',
				as: 'user'
			});
		}

		// Instance method to check if session is expired
		isExpired() {
			return new Date() > this.expires_at;
		}
	}

	UserSession.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
				allowNull: false
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
			session_token: {
				type: DataTypes.STRING(500),
				allowNull: false,
				unique: {
					name: 'user_sessions_token_unique',
					msg: 'Token de sessão já existe'
				}
			},
			expires_at: {
				type: DataTypes.DATE,
				allowNull: false,
				validate: {
					isDate: true,
					isAfterNow(value) {
						if (new Date(value) < new Date()) {
							throw new Error('Data de expiração deve ser futura');
						}
					}
				}
			}
		},
		{
			sequelize,
			modelName: 'UserSession',
			tableName: 'user_sessions',
			underscored: true,
			timestamps: true,
			updatedAt: false
		}
	);

	return UserSession;
};
