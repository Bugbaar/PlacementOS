import { jest } from '@jest/globals';

describe('Validation Tests', () => {
  let validator;

  beforeAll(async () => {
    validator = await import('../src/utils/validator.js');
  });

  describe('Register Schema', () => {
    it('should validate valid registration data', () => {
      const { error } = validator.registerSchema.validate({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      expect(error).toBeUndefined();
    });

    it('should reject invalid email', () => {
      const { error } = validator.registerSchema.validate({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      });
      expect(error).toBeDefined();
    });

    it('should reject short password', () => {
      const { error } = validator.registerSchema.validate({
        email: 'test@example.com',
        password: '123',
        name: 'Test User',
      });
      expect(error).toBeDefined();
    });

    it('should reject missing name', () => {
      const { error } = validator.registerSchema.validate({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(error).toBeDefined();
    });
  });

  describe('Login Schema', () => {
    it('should validate valid login data', () => {
      const { error } = validator.loginSchema.validate({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(error).toBeUndefined();
    });

    it('should reject missing email', () => {
      const { error } = validator.loginSchema.validate({
        password: 'password123',
      });
      expect(error).toBeDefined();
    });

    it('should reject missing password', () => {
      const { error } = validator.loginSchema.validate({
        email: 'test@example.com',
      });
      expect(error).toBeDefined();
    });
  });

  describe('Job Create Schema', () => {
    it('should validate valid job data', () => {
      const { error } = validator.jobCreateSchema.validate({
        title: 'Software Engineer',
        description: 'We are looking for a skilled software engineer...',
        skills: ['JavaScript', 'React'],
      });
      expect(error).toBeUndefined();
    });

    it('should reject short title', () => {
      const { error } = validator.jobCreateSchema.validate({
        title: 'AB',
        description: 'Valid description here...',
      });
      expect(error).toBeDefined();
    });

    it('should reject short description', () => {
      const { error } = validator.jobCreateSchema.validate({
        title: 'Valid Title',
        description: 'Short',
      });
      expect(error).toBeDefined();
    });
  });
});
