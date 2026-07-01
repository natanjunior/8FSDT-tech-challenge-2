'use strict';

function serializePost(post) {
  if (!post) return post;
  const plain = typeof post.toJSON === 'function' ? post.toJSON() : { ...post };
  const { author, author_teacher, discipline_id, createdAt, updatedAt, ...rest } = plain;
  return {
    ...rest,
    author: author_teacher
      ? { id: author_teacher.id, name: author_teacher.name, pronouns: author_teacher.pronouns }
      : null,
    created_at: createdAt || rest.created_at,
    updated_at: updatedAt || rest.updated_at,
    comments_count: parseInt(rest.comments_count) || 0,
    reads_count: parseInt(rest.reads_count) || 0
  };
}

function serializePosts(posts) {
  return posts.map(serializePost);
}

module.exports = { serializePost, serializePosts };
