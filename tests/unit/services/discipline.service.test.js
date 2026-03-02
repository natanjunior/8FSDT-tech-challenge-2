// Tests for DisciplineService (FASE 5 - Disciplines)
// Run with: npm test tests/unit/services/discipline.service.test.js

const DisciplineService = require('../../../src/services/discipline.service');

describe('DisciplineService - Disciplines', () => {
	let disciplineService;
	let mockDisciplineRepository;

	beforeEach(() => {
		// Criar mock do repositório (injetado no constructor)
		mockDisciplineRepository = {
			findAllOrdered: jest.fn()
		};

		// Instanciar service com dependência injetada
		disciplineService = new DisciplineService(mockDisciplineRepository);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('listAll()', () => {
		test('should return all disciplines ordered by label', async () => {
			const mockDisciplines = [
				{ id: '1', label: 'Matemática', created_at: new Date() },
				{ id: '2', label: 'Português', created_at: new Date() },
				{ id: '3', label: 'História', created_at: new Date() }
			];

			mockDisciplineRepository.findAllOrdered.mockResolvedValue(mockDisciplines);

			const result = await disciplineService.listAll();

			expect(mockDisciplineRepository.findAllOrdered).toHaveBeenCalled();
			expect(result).toEqual(mockDisciplines);
			expect(result).toHaveLength(3);
		});

		test('should return empty array if no disciplines exist', async () => {
			mockDisciplineRepository.findAllOrdered.mockResolvedValue([]);

			const result = await disciplineService.listAll();

			expect(mockDisciplineRepository.findAllOrdered).toHaveBeenCalled();
			expect(result).toEqual([]);
			expect(result).toHaveLength(0);
		});
	});
});
