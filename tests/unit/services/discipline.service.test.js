// Tests for DisciplineService (FASE 5 - Disciplines)
// Run with: npm test tests/unit/services/discipline.service.test.js

// Mock dependencies
jest.mock('../../../src/models/Discipline', () => ({
	findAll: jest.fn()
}));

const DisciplineService = require('../../../src/services/discipline.service');
const Discipline = require('../../../src/models/Discipline');

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

			Discipline.findAll.mockResolvedValue(mockDisciplines);

			const result = await DisciplineService.listAll();

			expect(Discipline.findAll).toHaveBeenCalledWith({
				order: [['label', 'ASC']]
			});
			expect(result).toEqual(mockDisciplines);
			expect(result).toHaveLength(3);
		});

		test('should return empty array if no disciplines exist', async () => {
			Discipline.findAll.mockResolvedValue([]);

			const result = await DisciplineService.listAll();

			expect(Discipline.findAll).toHaveBeenCalledWith({
				order: [['label', 'ASC']]
			});
			expect(result).toEqual([]);
			expect(result).toHaveLength(0);
		});
	});
});
