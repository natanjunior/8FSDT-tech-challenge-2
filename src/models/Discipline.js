'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
	class Discipline extends Model {
		static associate(models) {
			// Discipline hasMany Posts
			Discipline.hasMany(models.Post, {
				foreignKey: 'discipline_id',
				as: 'posts'
			});
		}
	}

	Discipline.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
				allowNull: false
			},
			label: {
				type: DataTypes.STRING(100),
				allowNull: false,
				unique: {
					name: 'disciplines_label_unique',
					msg: 'Disciplina já cadastrada'
				},
				validate: {
					notEmpty: {
						msg: 'Nome da disciplina é obrigatório'
					},
					len: {
						args: [2, 100],
						msg: 'Nome da disciplina deve ter entre 2 e 100 caracteres'
					}
				}
			}
		},
		{
			sequelize,
			modelName: 'Discipline',
			tableName: 'disciplines',
			underscored: true,
			timestamps: true,
			updatedAt: false
		}
	);

	return Discipline;
};
