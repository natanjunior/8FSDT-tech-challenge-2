// Example unit test
// This file demonstrates the test structure

describe('Example Unit Test Suite', () => {
  describe('Basic Math Operations', () => {
    test('should add two numbers correctly', () => {
      const result = 2 + 2;
      expect(result).toBe(4);
    });

    test('should multiply two numbers correctly', () => {
      const result = 3 * 4;
      expect(result).toBe(12);
    });
  });

  describe('String Operations', () => {
    test('should concatenate strings', () => {
      const result = 'Hello' + ' ' + 'World';
      expect(result).toBe('Hello World');
    });

    test('should convert to uppercase', () => {
      const result = 'test'.toUpperCase();
      expect(result).toBe('TEST');
    });
  });
});
