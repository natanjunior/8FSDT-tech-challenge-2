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
				description: 'Endpoints de autenticação (login/logout/troca de senha)'
			},
			{
				name: 'Teachers',
				description: 'CRUD de professores'
			},
			{
				name: 'Students',
				description: 'CRUD de estudantes'
			},
			{
				name: 'Posts',
				description: 'CRUD de posts educacionais'
			},
			{
				name: 'Comments',
				description: 'Comentários em posts'
			},
			{
				name: 'Reads',
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
					description: 'Credencial de acesso. Nunca expõe password_hash.',
					properties: {
						id: {
							type: 'string',
							format: 'uuid',
							example: '550e8400-e29b-41d4-a716-446655440001'
						},
						login: {
							type: 'string',
							example: 'joao.silva'
						},
						role: {
							type: 'string',
							enum: ['TEACHER', 'STUDENT'],
							example: 'TEACHER'
						}
					}
				},
				Teacher: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							description: 'Referência FHIR (Teacher/<uuid>)',
							example: 'Teacher/550e8400-e29b-41d4-a716-446655440001'
						},
						name: {
							type: 'string',
							example: 'João Silva'
						},
						email: {
							type: 'string',
							format: 'email',
							nullable: true,
							example: 'joao.silva@escola.com'
						},
						birth_date: {
							type: 'string',
							format: 'date',
							nullable: true,
							example: '1985-03-12'
						},
						pronouns: {
							type: 'string',
							enum: ['ele/dele', 'ela/dela', 'elu/delu', 'outro'],
							nullable: true,
							example: 'ele/dele'
						},
						biography: {
							type: 'string',
							nullable: true
						},
						status: {
							type: 'string',
							enum: ['ATIVO', 'INATIVO'],
							example: 'ATIVO'
						},
						disciplines: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									id: { type: 'string', format: 'uuid' },
									label: { type: 'string', example: 'Matemática' }
								}
							}
						},
						user: {
							type: 'object',
							nullable: true,
							properties: {
								id: { type: 'string', format: 'uuid' },
								login: { type: 'string' },
								role: { type: 'string', enum: ['TEACHER', 'STUDENT'] }
							}
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
				Student: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							description: 'Referência FHIR (Student/<uuid>)',
							example: 'Student/660e8400-e29b-41d4-a716-446655440001'
						},
						name: {
							type: 'string',
							example: 'Maria Souza'
						},
						email: {
							type: 'string',
							format: 'email',
							nullable: true,
							example: 'maria.souza@escola.com'
						},
						birth_date: {
							type: 'string',
							format: 'date',
							nullable: true,
							example: '2005-07-20'
						},
						pronouns: {
							type: 'string',
							enum: ['ele/dele', 'ela/dela', 'elu/delu', 'outro'],
							nullable: true,
							example: 'ela/dela'
						},
						biography: {
							type: 'string',
							nullable: true
						},
						status: {
							type: 'string',
							enum: ['ATIVO', 'INATIVO'],
							example: 'ATIVO'
						},
						course: {
							type: 'string',
							nullable: true,
							example: 'Engenharia'
						},
						user: {
							type: 'object',
							nullable: true,
							properties: {
								id: { type: 'string', format: 'uuid' },
								login: { type: 'string' },
								role: { type: 'string', enum: ['TEACHER', 'STUDENT'] }
							}
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
							$ref: '#/components/schemas/TeacherRef'
						},
						discipline: {
							$ref: '#/components/schemas/Discipline'
						},
						comments_count: {
							type: 'integer',
							example: 3
						},
						reads_count: {
							type: 'integer',
							example: 42
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
				TeacherRef: {
					type: 'object',
					nullable: true,
					description: 'Autor do post (professor). null se o autor não existir mais.',
					properties: {
						id: {
							type: 'string',
							description: 'Referência FHIR (Teacher/<uuid>)',
							example: 'Teacher/550e8400-e29b-41d4-a716-446655440001'
						},
						name: {
							type: 'string',
							example: 'João Silva'
						},
						pronouns: {
							type: 'string',
							enum: ['ele/dele', 'ela/dela', 'elu/delu', 'outro'],
							nullable: true,
							example: 'ele/dele'
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
						},
						created_at: {
							type: 'string',
							format: 'date-time'
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
						reader: {
							type: 'string',
							description: 'Referência FHIR de quem leu (Teacher/<uuid> ou Student/<uuid>)',
							example: 'Student/660e8400-e29b-41d4-a716-446655440001'
						},
						read_at: {
							type: 'string',
							format: 'date-time'
						}
					}
				},
				Comment: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							format: 'uuid'
						},
						content: {
							type: 'string',
							example: 'Ótimo conteúdo, obrigado!'
						},
						author: {
							type: 'object',
							nullable: true,
							description: 'Autor do comentário. null se o autor não existir mais.',
							properties: {
								id: {
									type: 'string',
									description: 'Referência FHIR (Teacher/<uuid> ou Student/<uuid>)',
									example: 'Student/660e8400-e29b-41d4-a716-446655440001'
								},
								type: {
									type: 'string',
									enum: ['Teacher', 'Student'],
									example: 'Student'
								},
								name: {
									type: 'string',
									example: 'Maria Souza'
								}
							}
						},
						can_delete: {
							type: 'boolean',
							description: 'Se o usuário autenticado pode excluir este comentário',
							example: false
						},
						created_at: {
							type: 'string',
							format: 'date-time'
						}
					}
				},
				LoginRequest: {
					type: 'object',
					required: ['login', 'password'],
					properties: {
						login: {
							type: 'string',
							example: 'joao.silva'
						},
						password: {
							type: 'string',
							format: 'password',
							example: 'segredo123'
						}
					}
				},
				LoginResponse: {
					type: 'object',
					properties: {
						user: {
							$ref: '#/components/schemas/User'
						},
						profile: {
							nullable: true,
							description: 'Perfil associado (Teacher ou Student), ou null.',
							oneOf: [
								{ $ref: '#/components/schemas/Teacher' },
								{ $ref: '#/components/schemas/Student' }
							]
						},
						token: {
							type: 'string',
							example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
						}
					}
				},
				ChangePasswordRequest: {
					type: 'object',
					required: ['current_password', 'new_password'],
					properties: {
						current_password: {
							type: 'string',
							format: 'password'
						},
						new_password: {
							type: 'string',
							format: 'password',
							minLength: 8
						}
					}
				},
				CreateTeacherRequest: {
					type: 'object',
					required: ['name'],
					properties: {
						name: {
							type: 'string',
							example: 'João Silva'
						},
						email: {
							type: 'string',
							format: 'email',
							nullable: true
						},
						birth_date: {
							type: 'string',
							format: 'date',
							nullable: true
						},
						pronouns: {
							type: 'string',
							enum: ['ele/dele', 'ela/dela', 'elu/delu', 'outro'],
							nullable: true
						},
						biography: {
							type: 'string',
							nullable: true
						},
						discipline_ids: {
							type: 'array',
							items: { type: 'string', format: 'uuid' }
						},
						user: {
							type: 'object',
							nullable: true,
							description: 'Cria credencial de acesso opcional.',
							required: ['login', 'password'],
							properties: {
								login: { type: 'string' },
								password: { type: 'string', format: 'password' }
							}
						}
					}
				},
				CreateStudentRequest: {
					type: 'object',
					required: ['name'],
					properties: {
						name: {
							type: 'string',
							example: 'Maria Souza'
						},
						email: {
							type: 'string',
							format: 'email',
							nullable: true
						},
						birth_date: {
							type: 'string',
							format: 'date',
							nullable: true
						},
						pronouns: {
							type: 'string',
							enum: ['ele/dele', 'ela/dela', 'elu/delu', 'outro'],
							nullable: true
						},
						biography: {
							type: 'string',
							nullable: true
						},
						course: {
							type: 'string',
							nullable: true
						},
						user: {
							type: 'object',
							nullable: true,
							description: 'Cria credencial de acesso opcional.',
							required: ['login', 'password'],
							properties: {
								login: { type: 'string' },
								password: { type: 'string', format: 'password' }
							}
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
				ReplacePostRequest: {
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
							example: 'PUBLISHED'
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
