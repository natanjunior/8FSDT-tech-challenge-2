'use strict';

const { PostRead } = require('../models');
const { parseFhirSort } = require('../utils/sort');

const READ_SORT_FIELDS = { read_at: ['read_at'] };
const READ_DEFAULT_ORDER = [['read_at', 'DESC']];

class PostReadRepository {
  async findByPostAndReader(postId, reader) {
    return PostRead.findOne({ where: { post_id: postId, reader } });
  }

  async create(data) { return PostRead.create(data); }

  async findPaginated(reader, { postId, page, limit, sort }) {
    const offset = (page - 1) * limit;
    const order = parseFhirSort(sort, READ_SORT_FIELDS, READ_DEFAULT_ORDER);
    const where = { reader };
    if (postId) where.post_id = postId;
    return PostRead.findAndCountAll({ where, order, limit, offset });
  }
}

module.exports = PostReadRepository;
