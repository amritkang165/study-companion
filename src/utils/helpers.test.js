import { generateId, priorityOrder, isTaskOverdue } from './helpers';

describe('helpers', () => {
  test('generateId returns distinct strings', () => {
    const a = generateId();
    const b = generateId();
    expect(a).toEqual(expect.any(String));
    expect(a.length).toBeGreaterThan(0);
    expect(a).not.toBe(b);
  });

  test('priorityOrder ranks High before Low', () => {
    expect(priorityOrder('High')).toBeLessThan(priorityOrder('Low'));
  });

  test('isTaskOverdue is false for completed tasks', () => {
    expect(
      isTaskOverdue({
        status: 'Completed',
        deadline: '2000-01-01',
      })
    ).toBe(false);
  });
});
