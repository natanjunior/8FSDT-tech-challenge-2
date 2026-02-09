'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const now = new Date();

		// 5 posts de exemplo
		const posts = [
			{
				id: '880e8400-e29b-41d4-a716-446655440001',
				title: 'Introdução à Álgebra Linear',
				content: `A Álgebra Linear é um ramo fundamental da matemática que lida com vetores, espaços vetoriais, transformações lineares e sistemas de equações lineares. Neste post, vamos explorar os conceitos básicos que todo estudante precisa conhecer.

Vetores são objetos matemáticos que possuem magnitude e direção. Eles podem ser representados como coordenadas em um espaço n-dimensional. Por exemplo, um vetor em 2D pode ser escrito como (x, y).

As aplicações da álgebra linear são vastas: computação gráfica, machine learning, física quântica, análise de dados, e muito mais. É uma ferramenta essencial para qualquer estudante de STEM.`,
				author_id: '550e8400-e29b-41d4-a716-446655440001', // Prof. João Silva
				discipline_id: '660e8400-e29b-41d4-a716-446655440001', // Matemática
				status: 'PUBLISHED',
				published_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
				created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
				updated_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
			},
			{
				id: '880e8400-e29b-41d4-a716-446655440002',
				title: 'A Importância da Leitura na Formação do Cidadão',
				content: `A leitura é uma das habilidades mais importantes que um indivíduo pode desenvolver. Ela não apenas melhora a capacidade de comunicação, mas também expande horizontes, desenvolve pensamento crítico e aumenta o vocabulário.

Através da leitura, somos expostos a diferentes culturas, ideias e perspectivas. Isso nos torna mais empáticos e compreensivos em relação às diferenças. A literatura brasileira, por exemplo, oferece uma riqueza de obras que retratam nossa identidade cultural.

Incentive seus alunos a ler diariamente, começando com livros adequados à sua faixa etária e aumentando gradualmente a complexidade. A leitura deve ser um prazer, não uma obrigação.`,
				author_id: '550e8400-e29b-41d4-a716-446655440002', // Profa. Maria Santos
				discipline_id: '660e8400-e29b-41d4-a716-446655440002', // Português
				status: 'PUBLISHED',
				published_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
				created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
				updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
			},
			{
				id: '880e8400-e29b-41d4-a716-446655440003',
				title: 'Fotossíntese: O Processo que Sustenta a Vida na Terra',
				content: `A fotossíntese é um processo bioquímico fundamental realizado por plantas, algas e algumas bactérias, que converte energia luminosa em energia química. Este processo é responsável por produzir o oxigênio que respiramos e a base da cadeia alimentar.

O processo ocorre principalmente nos cloroplastos das células vegetais, onde a clorofila captura a luz solar. A equação básica da fotossíntese é:

6CO₂ + 6H₂O + luz → C₆H₁₂O₆ + 6O₂

Este processo pode ser dividido em duas fases: fase clara (reações dependentes de luz) e fase escura (ciclo de Calvin). Compreender a fotossíntese é essencial para entender ecologia, mudanças climáticas e sustentabilidade.`,
				author_id: '550e8400-e29b-41d4-a716-446655440001', // Prof. João Silva
				discipline_id: '660e8400-e29b-41d4-a716-446655440003', // Ciências
				status: 'PUBLISHED',
				published_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
				created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
				updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
			},
			{
				id: '880e8400-e29b-41d4-a716-446655440004',
				title: 'A Proclamação da República no Brasil',
				content: `Em 15 de novembro de 1889, o Brasil passou por uma das mais importantes transformações políticas de sua história: a Proclamação da República. Este evento marcou o fim do período monárquico e o início da era republicana.

O Marechal Deodoro da Fonseca liderou o movimento que depôs Dom Pedro II, último imperador do Brasil. Diversos fatores contribuíram para este acontecimento: a Questão Militar, a Questão Religiosa, o movimento abolicionista e a insatisfação de fazendeiros com a abolição da escravatura.

A transição para a república trouxe mudanças significativas na estrutura política do país, estabelecendo o federalismo e a separação entre Igreja e Estado. Compreender este período é fundamental para entender o Brasil contemporâneo.`,
				author_id: '550e8400-e29b-41d4-a716-446655440002', // Profa. Maria Santos
				discipline_id: '660e8400-e29b-41d4-a716-446655440004', // História
				status: 'PUBLISHED',
				published_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
				created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
				updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000)
			},
			{
				id: '880e8400-e29b-41d4-a716-446655440005',
				title: 'Dicas para Ensinar Frações de Forma Divertida',
				content: `Ensinar frações pode ser um desafio, mas existem várias estratégias lúdicas que tornam o aprendizado mais efetivo e prazeroso para os alunos.

Uma abordagem prática é usar pizzas de papel, dividindo-as em diferentes partes para demonstrar frações equivalentes. Outra atividade interessante é trabalhar com receitas culinárias, onde os alunos precisam dobrar ou reduzir pela metade as quantidades dos ingredientes.

Jogos de tabuleiro e aplicativos educacionais também são ferramentas valiosas. O importante é conectar o conceito abstrato de frações com situações do cotidiano, tornando o aprendizado significativo.

Este post está em modo rascunho para revisão antes da publicação.`,
				author_id: '550e8400-e29b-41d4-a716-446655440001', // Prof. João Silva
				discipline_id: '660e8400-e29b-41d4-a716-446655440001', // Matemática
				status: 'DRAFT',
				published_at: null,
				created_at: new Date(),
				updated_at: new Date()
			}
		];

		await queryInterface.bulkInsert('posts', posts, {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('posts', null, {});
	}
};
