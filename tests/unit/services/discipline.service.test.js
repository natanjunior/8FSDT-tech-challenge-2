// Tests for DisciplineService (FASE 5 - Disciplines)
// Run with: npm test tests/unit/services/discipline.service.test.js

// Mock dependencies
jest.mock('../../../src/repositories/discipline.repository');

const DisciplineService = require('../../../src/services/discipline.service');
const DisciplineRepository = require('../../../src/repositories/discipline.repository');

describe('DisciplineService - Disciplines', () => {
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

			DisciplineRepository.findAllOrdered.mockResolvedValue(mockDisciplines);

			const result = await DisciplineService.listAll();

			expect(DisciplineRepository.findAllOrdered).toHaveBeenCalled();
			expect(result).toEqual(mockDisciplines);
			expect(result).toHaveLength(3);
		});

		test('should return empty array if no disciplines exist', async () => {
			DisciplineRepository.findAllOrdered.mockResolvedValue([]);

			const result = await DisciplineService.listAll();

			expect(DisciplineRepository.findAllOrdered).toHaveBeenCalled();
			expect(result).toEqual([]);
			expect(result).toHaveLength(0);
		});
	});
});
