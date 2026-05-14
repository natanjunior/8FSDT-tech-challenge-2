'use strict';

/**
 * Faz o parse de um query param de ordenação no formato FHIR.
 * Referência: https://build.fhir.org/search.html#sort
 *
 * Formato: sort=-campo1,campo2
 *   - Prefixo "-" = DESC
 *   - Sem prefixo = ASC
 *   - Múltiplos campos separados por vírgula
 *
 * @param {string|undefined} sortParam  Valor do ?sort= query param
 * @param {Object} fieldMap  Mapa de nome de campo → array Sequelize
 *   Ex: { title: ['title'], author: [{ model: User, as: 'author' }, 'name'] }
 *   O parser appenda a direção ('ASC'/'DESC') ao final do array.
 * @param {Array} defaultOrder  Ordem Sequelize usada quando sortParam está vazio ou todos os campos são inválidos
 * @returns {Array} Array de ordem no formato Sequelize
 */
function parseFhirSort(sortParam, fieldMap, defaultOrder) {
  if (!sortParam) return defaultOrder;

  const order = sortParam
    .split(',')
    .map((raw) => {
      const desc = raw.startsWith('-');
      const field = desc ? raw.slice(1) : raw;
      const dir = desc ? 'DESC' : 'ASC';
      const mapped = fieldMap[field];
      if (!mapped) return null;
      return [...mapped, dir];
    })
    .filter(Boolean);

  return order.length > 0 ? order : defaultOrder;
}

module.exports = { parseFhirSort };
