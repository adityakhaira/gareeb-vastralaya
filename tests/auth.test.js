import { describe, expect, it } from 'vitest';
import { createAdminSessionToken, verifyAdminSessionToken } from '../lib/auth';

describe('admin auth', () => {
  it('creates and verifies a valid admin session token', () => {
    const token = createAdminSessionToken();
    expect(token).toContain('.');
    expect(verifyAdminSessionToken(token)).not.toBeNull();
  });

  it('rejects a forged session token', () => {
    const token = 'invalid.token';
    expect(verifyAdminSessionToken(token)).toBeNull();
  });
});
