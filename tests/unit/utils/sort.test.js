// tests/unit/utils/sort.test.js
'use strict';

const { parseFhirSort } = require('../../../src/utils/sort');

const fieldMap = {
  title: ['title'],
  date: ['created_at'],
  author: [{ model: 'MockUser', as: 'author' }, 'name']
};

const defaultOrder = [['created_at', 'DESC']];

describe('parseFhirSort()', () => {
  test('retorna default quando sortParam é undefined', () => {
    expect(parseFhirSort(undefined, fieldMap, defaultOrder)).toEqual(defaultOrder);
  });

  test('retorna default quando sortParam é string vazia', () => {
    expect(parseFhirSort('', fieldMap, defaultOrder)).toEqual(defaultOrder);
  });

  test('campo simples sem prefixo → ASC', () => {
    expect(parseFhirSort('title', fieldMap, defaultOrder)).toEqual([['title', 'ASC']]);
  });

  test('campo simples com prefixo - → DESC', () => {
    expect(parseFhirSort('-date', fieldMap, defaultOrder)).toEqual([['created_at', 'DESC']]);
  });

  test('ordenação composta', () => {
    expect(parseFhirSort('-date,title', fieldMap, defaultOrder)).toEqual([
      ['created_at', 'DESC'],
      ['title', 'ASC']
    ]);
  });

  test('campo inválido único → retorna default', () => {
    expect(parseFhirSort('invalido', fieldMap, defaultOrder)).toEqual(defaultOrder);
  });

  test('campo inválido misturado com válido → descarta inválido', () => {
    expect(parseFhirSort('invalido,title', fieldMap, defaultOrder)).toEqual([['title', 'ASC']]);
  });

  test('campo de join (array) → appenda direção corretamente', () => {
    expect(parseFhirSort('author', fieldMap, defaultOrder)).toEqual([
      [{ model: 'MockUser', as: 'author' }, 'name', 'ASC']
    ]);
  });

  test('campo de join com - → DESC', () => {
    expect(parseFhirSort('-author', fieldMap, defaultOrder)).toEqual([
      [{ model: 'MockUser', as: 'author' }, 'name', 'DESC']
    ]);
  });
});
