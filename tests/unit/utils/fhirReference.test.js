'use strict';

const { generateReference, parseReference, isReference, REFERENCE_TYPES } = require('../../../src/utils/fhirReference');

describe('fhirReference utility', () => {
  describe('generateReference', () => {
    it('generates a Teacher reference with a uuid v4', () => {
      const ref = generateReference('Teacher');
      expect(ref).toMatch(/^Teacher\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('generates a Student reference', () => {
      const ref = generateReference('Student');
      expect(ref.startsWith('Student/')).toBe(true);
    });

    it('throws on invalid type', () => {
      expect(() => generateReference('Admin')).toThrow();
    });
  });

  describe('parseReference', () => {
    it('returns { type, id } for a valid reference', () => {
      const parsed = parseReference('Teacher/550e8400-e29b-41d4-a716-446655440001');
      expect(parsed).toEqual({
        type: 'Teacher',
        id: '550e8400-e29b-41d4-a716-446655440001'
      });
    });

    it('returns null for invalid format', () => {
      expect(parseReference('not-a-reference')).toBeNull();
      expect(parseReference('Teacher/not-uuid')).toBeNull();
      expect(parseReference('Admin/550e8400-e29b-41d4-a716-446655440001')).toBeNull();
      expect(parseReference(null)).toBeNull();
      expect(parseReference(undefined)).toBeNull();
    });
  });

  describe('isReference', () => {
    it('returns true for valid Teacher/Student reference', () => {
      expect(isReference('Teacher/550e8400-e29b-41d4-a716-446655440001')).toBe(true);
      expect(isReference('Student/550e8400-e29b-41d4-a716-446655440001')).toBe(true);
    });

    it('returns false otherwise', () => {
      expect(isReference('Teacher/abc')).toBe(false);
      expect(isReference('foo')).toBe(false);
    });
  });

  describe('REFERENCE_TYPES', () => {
    it('exposes the allowed types', () => {
      expect(REFERENCE_TYPES).toEqual(['Teacher', 'Student']);
    });
  });
});
