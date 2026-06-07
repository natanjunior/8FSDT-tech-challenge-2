'use strict';

const CommentService = require('../../../src/services/comment.service');

describe('CommentService', () => {
  let service;
  let mockCommentRepository;
  let mockPostRepository;

  const mockPost = { id: 'post-uuid-1', title: 'Post 1', status: 'PUBLISHED' };

  beforeEach(() => {
    mockCommentRepository = {
      search: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      canDelete: jest.fn(),
      serialize: jest.fn()
    };

    mockPostRepository = {
      findById: jest.fn()
    };

    service = new CommentService(mockCommentRepository, mockPostRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchComments()', () => {
    test('chama repository.search com os params corretos', async () => {
      mockCommentRepository.search.mockResolvedValue({ count: 0, rows: [] });

      await service.searchComments(
        { postId: 'post-1', page: 1, limit: 10, sort: '-created_at' },
        'TEACHER',
        'Teacher/abc'
      );

      expect(mockCommentRepository.search).toHaveBeenCalledWith({
        postId: 'post-1',
        page: 1,
        limit: 10,
        sort: '-created_at',
        profileId: 'Teacher/abc'
      });
    });

    test('retorna data e pagination, serializando cada row', async () => {
      const enriched = { raw: { id: 'c1', content: 'Texto' }, author: { id: 'Teacher/abc', name: 'Prof' } };
      mockCommentRepository.search.mockResolvedValue({
        count: 1,
        rows: [enriched]
      });
      mockCommentRepository.serialize.mockReturnValue({
        id: 'c1',
        content: 'Texto',
        author: { id: 'Teacher/abc', name: 'Prof' },
        can_delete: true,
        created_at: '2026-01-01'
      });

      const result = await service.searchComments(
        { page: 1, limit: 10 },
        'TEACHER',
        'Teacher/abc'
      );

      expect(mockCommentRepository.serialize).toHaveBeenCalledWith(enriched, 'TEACHER', 'Teacher/abc');
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('createComment()', () => {
    test('cria comentário com author = profileId', async () => {
      mockPostRepository.findById.mockResolvedValue(mockPost);
      const created = { id: 'c-new' };
      mockCommentRepository.create.mockResolvedValue(created);

      const enrichedMine = { raw: { id: 'c-new' }, author: { id: 'Teacher/abc', name: 'Prof' } };
      mockCommentRepository.search.mockResolvedValue({ count: 1, rows: [enrichedMine] });
      mockCommentRepository.serialize.mockReturnValue({
        id: 'c-new',
        content: 'Conteúdo',
        author: { id: 'Teacher/abc', name: 'Prof' },
        can_delete: true,
        created_at: new Date()
      });

      const result = await service.createComment(
        { post_id: 'post-uuid-1', content: 'Conteúdo' },
        'Teacher/abc',
        'TEACHER'
      );

      expect(mockCommentRepository.create).toHaveBeenCalledWith({
        post_id: 'post-uuid-1',
        content: 'Conteúdo',
        author: 'Teacher/abc'
      });
      expect(mockCommentRepository.serialize).toHaveBeenCalledWith(enrichedMine, 'TEACHER', 'Teacher/abc');
      expect(result.id).toBe('c-new');
    });

    test('lança erro 401 quando não autenticado (sem profileId)', async () => {
      await expect(
        service.createComment({ post_id: 'post-uuid-1', content: 'x' }, null, null)
      ).rejects.toThrow('Não autenticado');

      expect(mockPostRepository.findById).not.toHaveBeenCalled();
      expect(mockCommentRepository.create).not.toHaveBeenCalled();
    });

    test('lança erro quando post não existe', async () => {
      mockPostRepository.findById.mockResolvedValue(null);

      await expect(
        service.createComment({ post_id: 'nao-existe', content: 'x' }, 'Student/xyz', 'STUDENT')
      ).rejects.toThrow('Post não encontrado');

      expect(mockCommentRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteComment()', () => {
    test('deleta quando canDelete retorna true', async () => {
      const comment = { id: 'c1', author: 'Teacher/abc' };
      mockCommentRepository.findById.mockResolvedValue(comment);
      mockCommentRepository.canDelete.mockReturnValue(true);
      mockCommentRepository.delete.mockResolvedValue(1);

      await expect(
        service.deleteComment('c1', 'TEACHER', 'Teacher/abc')
      ).resolves.toBeUndefined();

      expect(mockCommentRepository.canDelete).toHaveBeenCalledWith(comment, 'TEACHER', 'Teacher/abc');
      expect(mockCommentRepository.delete).toHaveBeenCalledWith('c1');
    });

    test('lança erro quando comentário não existe', async () => {
      mockCommentRepository.findById.mockResolvedValue(null);

      await expect(
        service.deleteComment('inexistente', null, null)
      ).rejects.toThrow('Comentário não encontrado');
    });

    test('lança erro quando sem permissão', async () => {
      const comment = { id: 'c1', author: 'Student/outro' };
      mockCommentRepository.findById.mockResolvedValue(comment);
      mockCommentRepository.canDelete.mockReturnValue(false);

      await expect(
        service.deleteComment('c1', 'STUDENT', 'Student/meu')
      ).rejects.toThrow('Sem permissão para excluir este comentário');

      expect(mockCommentRepository.delete).not.toHaveBeenCalled();
    });
  });
});
