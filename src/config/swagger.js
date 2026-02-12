'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Tech Challenge - Blog API',
			version: '1.0.0',
			description:
				'API RESTful para plataforma de blogging educacional. Permite que professores da rede pública compartilhem conteúdo educacional organizado por disciplinas.',
			contact: {
				name: 'Tech Challenge Team',
				email: 'contato@example.com'
			},
			license: {
				name: 'MIT',
				url: 'https://opensource.org/licenses/MIT'
			}
		},
		servers: [
			{
				url: 'http://localhost:3030',
				description: 'Servidor de Desenvolvimento'
			},
			{
				url: 'https://api.example.com',
				description: 'Servidor de Produção'
			}
		],
		tags: [
			{
				name: 'Auth',
				description: 'Endpoints de autenticação (passwordless)'
			},
			{
				name: 'Posts',
				description: 'CRUD de posts educacionais'
			},
			{
				name: 'Post Reads',
				description: 'Rastreamento de leituras'
			},
			{
				name: 'Disciplines',
				description: 'Disciplinas disponíveis'
			}
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
					description: 'Token JWT obtido via login'
				}
			},
			schemas: {
				User: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							format: 'uuid',
							example: '550e8400-e29b-41d4-a716-446655440001'
						},
						name: {
							type: 'string',
							example: 'Prof. João Silva'
						},
						email: {
							type: 'string',
							format: 'email',
							example: 'joao.silva@escola.com'
						},
						role: {
							type: 'string',
							enum: ['TEACHER', 'STUDENT'],
							example: 'TEACHER'
						},
						created_at: {
							type: 'string',
							format: 'date-time'
						},
						updated_at: {
							type: 'string',
							format: 'date-time'
						}
					}
				},
				Post: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							format: 'uuid',
							example: '880e8400-e29b-41d4-a716-446655440001'
						},
						title: {
							type: 'string',
							example: 'Introdução ao Node.js'
						},
						content: {
							type: 'string',
							example: 'Node.js é uma plataforma...'
						},
						status: {
							type: 'string',
							enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
							example: 'PUBLISHED',
							description: 'Status do post (v12: ENUM direto)'
						},
						published_at: {
							type: 'string',
							format: 'date-time',
							nullable: true
						},
						author: {
							$ref: '#/components/schemas/UserBasic'
						},
						discipline: {
							$ref: '#/components/schemas/Discipline'
						},
						created_at: {
							type: 'string',
							format: 'date-time'
						},
						updated_at: {
							type: 'string',
							format: 'date-time'
						}
					}
				},
				UserBasic: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							format: 'uuid'
						},
						name: {
							type: 'string'
						},
						role: {
							type: 'string',
							enum: ['TEACHER', 'STUDENT']
						}
					}
				},
				Discipline: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							format: 'uuid'
						},
						label: {
							type: 'string',
							example: 'Matemática'
						}
					}
				},
				PostRead: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							format: 'uuid'
						},
						post_id: {
							type: 'string',
							format: 'uuid'
						},
						user_id: {
							type: 'string',
							format: 'uuid'
						},
						read_at: {
							type: 'string',
							format: 'date-time'
						}
					}
				},
				LoginRequest: {
					type: 'object',
					required: ['email'],
					properties: {
						email: {
							type: 'string',
							format: 'email',
							example: 'joao.silva@escola.com',
							description: 'Email do usuário (passwordless)'
						}
					}
				},
				LoginResponse: {
					type: 'object',
					properties: {
						user: {
							$ref: '#/components/schemas/User'
						},
						token: {
							type: 'string',
							example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
						}
					}
				},
				CreatePostRequest: {
					type: 'object',
					required: ['title', 'content', 'status'],
					properties: {
						title: {
							type: 'string',
							minLength: 5,
							example: 'Introdução à Álgebra Linear'
						},
						content: {
							type: 'string',
							minLength: 10,
							example: 'Álgebra Linear é fundamental para...'
						},
						discipline_id: {
							type: 'string',
							format: 'uuid',
							example: '660e8400-e29b-41d4-a716-446655440001'
						},
						status: {
							type: 'string',
							enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
							example: 'DRAFT',
							description: 'v12: usa ENUM string (não status_id UUID)'
						}
					}
				},
				UpdatePostRequest: {
					type: 'object',
					properties: {
						title: {
							type: 'string',
							minLength: 5
						},
						content: {
							type: 'string',
							minLength: 10
						},
						discipline_id: {
							type: 'string',
							format: 'uuid'
						},
						status: {
							type: 'string',
							enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED']
						}
					}
				},
				PostList: {
					type: 'object',
					properties: {
						data: {
							type: 'array',
							items: {
								$ref: '#/components/schemas/Post'
							}
						},
						pagination: {
							type: 'object',
							properties: {
								page: {
									type: 'integer',
									example: 1
								},
								limit: {
									type: 'integer',
									example: 20
								},
								total: {
									type: 'integer',
									example: 50
								},
								totalPages: {
									type: 'integer',
									example: 3
								}
							}
						}
					}
				},
				ReadStatus: {
					type: 'object',
					properties: {
						read: {
							type: 'boolean',
							example: true
						},
						read_at: {
							type: 'string',
							format: 'date-time',
							nullable: true
						}
					}
				},
				Error: {
					type: 'object',
					properties: {
						error: {
							type: 'string',
							example: 'Mensagem de erro'
						}
					}
				}
			}
		}
	},
	apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
