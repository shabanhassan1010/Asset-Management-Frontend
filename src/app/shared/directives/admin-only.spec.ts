import { AdminOnly } from './admin-only';

describe('AdminOnly', () => {
  it('should create an instance', () => {
    const directive = new AdminOnly();
    expect(directive).toBeTruthy();
  });
});
