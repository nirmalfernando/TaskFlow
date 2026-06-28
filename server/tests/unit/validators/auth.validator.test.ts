import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '../../../src/validators/auth.validator';

describe('registerSchema', () => {
  const valid = {
    email: 'user@example.com',
    password: 'Password1',
    firstName: 'John',
    lastName: 'Doe',
  };

  it('accepts valid input', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(registerSchema.safeParse({ ...valid, email: 'notanemail' }).success).toBe(false);
  });

  it('rejects password without uppercase', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'password1' }).success).toBe(false);
  });

  it('rejects password without lowercase', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'PASSWORD1' }).success).toBe(false);
  });

  it('rejects password without digit', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'Password' }).success).toBe(false);
  });

  it('rejects password shorter than 8 chars', () => {
    expect(registerSchema.safeParse({ ...valid, password: 'Pa1' }).success).toBe(false);
  });

  it('rejects empty firstName', () => {
    expect(registerSchema.safeParse({ ...valid, firstName: '' }).success).toBe(false);
  });

  it('rejects firstName over 50 chars', () => {
    expect(registerSchema.safeParse({ ...valid, firstName: 'A'.repeat(51) }).success).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(registerSchema.safeParse({ email: 'a@b.com' }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid input', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'anything' }).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(loginSchema.safeParse({ email: 'notvalid', password: 'anything' }).success).toBe(false);
  });

  it('rejects empty password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
  });

  it('rejects missing email', () => {
    expect(loginSchema.safeParse({ password: 'Password1' }).success).toBe(false);
  });
});

describe('refreshTokenSchema', () => {
  it('accepts a non-empty string', () => {
    expect(refreshTokenSchema.safeParse({ refreshToken: 'some.token.here' }).success).toBe(true);
  });

  it('rejects empty string', () => {
    expect(refreshTokenSchema.safeParse({ refreshToken: '' }).success).toBe(false);
  });

  it('rejects missing field', () => {
    expect(refreshTokenSchema.safeParse({}).success).toBe(false);
  });
});
