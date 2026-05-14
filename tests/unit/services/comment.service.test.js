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
        null,
        null,
        null
      );

      expect(mockCommentRepository.search).toHaveBeenCalledWith({
        postId: 'post-1',
        page: 1,
        limit: 10,
        sort: '-created_at',
        userId: null,
        anonymousId: null
      });
    });

    test('retorna data e pagination', async () => {
      const mockComment = { id: 'c1', content: 'Texto', user_id: null };
      mockCommentRepository.search.mockResolvedValue({
        count: 1,
        rows: [mockComment]
      });
      mockCommentRepository.serialize.mockReturnValue({
        id: 'c1',
        content: 'Texto',
        author_name: null,
        is_anonymous: true,
        can_delete: false,
        created_at: '2026-01-01'
      });

      const result = await service.searchComments(
        { page: 1, limit: 10 },
        null,
        null,
        null
      );

      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('createComment()', () => {
    test('cria comentário autenticado com user_id', async () => {
      mockPostRepository.findById.mockResolvedValue(mockPost);
      const created = {
        id: 'c-new',
        content: 'Conteúdo',
        user_id: 'user-1',
        anonymous_id: null,
        author_name: null,
        created_at: new Date()
      };
      mockCommentRepository.create.mockResolvedValue(created);
      mockCommentRepository.serialize.mockReturnValue({
        id: 'c-new',
        content: 'Conteúdo',
        author_name: null,
        is_anonymous: false,
        can_delete: true,
        created_at: created.created_at
      });

      const result = await service.createComment(
        { post_id: 'post-uuid-1', content: 'Conteúdo' },
        'user-1',
        'TEACHER',
        null
      );

      expect(mockCommentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'user-1', anonymous_id: null })
      );
      expect(result.is_anonymous).toBe(false);
    });

    test('cria comentário anônimo com anonymous_id', async () => {
      mockPostRepository.findById.mockResolvedValue(mockPost);
      const anonId = 'anon-uuid-1';
      const created = {
        id: 'c-anon',
        content: 'Anônimo',
        user_id: null,
        anonymous_id: anonId,
        author_name: 'Visitante',
        created_at: new Date()
      };
      mockCommentRepository.create.mockResolvedValue(created);
      mockCommentRepository.serialize.mockReturnValue({
        id: 'c-anon',
        content: 'Anônimo',
        author_name: 'Visitante',
        is_anonymous: true,
        can_delete: true,
        created_at: created.created_at
      });

      const result = await service.createComment(
        { post_id: 'post-uuid-1', content: 'Anônimo', author_name: 'Visitante' },
        null,
        null,
        anonId
      );

      expect(mockCommentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: null, anonymous_id: anonId })
      );
      expect(result.is_anonymous).toBe(true);
    });

    test('lança erro quando post não existe', async () => {
      mockPostRepository.findById.mockResolvedValue(null);

      await expect(
        service.createComment({ post_id: 'nao-existe', content: 'x' }, null, null, 'anon-1')
      ).rejects.toThrow('Post não encontrado');
    });
  });

  describe('deleteComment()', () => {
    test('deleta quando canDelete retorna true', async () => {
      const comment = { id: 'c1', user_id: 'u1', anonymous_id: null };
      mockCommentRepository.findById.mockResolvedValue(comment);
      mockCommentRepository.canDelete.mockReturnValue(true);
      mockCommentRepository.delete.mockResolvedValue(1);

      await expect(
        service.deleteComment('c1', 'TEACHER', 'u1', null)
      ).resolves.toBeUndefined();

      expect(mockCommentRepository.delete).toHaveBeenCalledWith('c1');
    });

    test('lança erro quando comentário não existe', async () => {
      mockCommentRepository.findById.mockResolvedValue(null);

      await expect(
        service.deleteComment('inexistente', null, null, null)
      ).rejects.toThrow('Comentário não encontrado');
    });

    test('lança erro quando sem permissão', async () => {
      const comment = { id: 'c1', user_id: 'outro-user', anonymous_id: null };
      mockCommentRepository.findById.mockResolvedValue(comment);
      mockCommentRepository.canDelete.mockReturnValue(false);

      await expect(
        service.deleteComment('c1', 'STUDENT', 'meu-user', null)
      ).rejects.toThrow('Sem permissão para excluir este comentário');
    });
  });
});
