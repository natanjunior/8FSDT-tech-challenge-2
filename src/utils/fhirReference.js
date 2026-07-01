'use strict';

const { v4: uuidv4 } = require('uuid');

const REFERENCE_TYPES = ['Teacher', 'Student'];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const REFERENCE_REGEX = new RegExp(
  `^(${REFERENCE_TYPES.join('|')})\\/${UUID_REGEX.source.slice(1, -1)}$`,
  'i'
);

function generateReference(type) {
  if (!REFERENCE_TYPES.includes(type)) {
    throw new Error(`Invalid reference type: ${type}`);
  }
  return `${type}/${uuidv4()}`;
}

function parseReference(value) {
  if (typeof value !== 'string') return null;
  const match = value.match(REFERENCE_REGEX);
  if (!match) return null;
  return { type: match[1], id: value.slice(match[1].length + 1) };
}

function isReference(value) {
  return parseReference(value) !== null;
}

module.exports = {
  generateReference,
  parseReference,
  isReference,
  REFERENCE_TYPES
};
