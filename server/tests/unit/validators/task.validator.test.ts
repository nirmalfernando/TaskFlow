import {
  createTaskSchema,
  updateTaskSchema,
  taskFiltersSchema,
} from '../../../src/validators/task.validator';

describe('createTaskSchema', () => {
  const valid = { title: 'My task' };

  it('accepts title only', () => {
    expect(createTaskSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts all optional fields', () => {
    const result = createTaskSchema.safeParse({
      title: 'Full task',
      description: 'A description',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty title', () => {
    expect(createTaskSchema.safeParse({ title: '' }).success).toBe(false);
  });

  it('rejects title over 255 chars', () => {
    expect(createTaskSchema.safeParse({ title: 'A'.repeat(256) }).success).toBe(false);
  });

  it('rejects invalid status enum', () => {
    expect(createTaskSchema.safeParse({ title: 'T', status: 'BOGUS' }).success).toBe(false);
  });

  it('rejects invalid priority enum', () => {
    expect(createTaskSchema.safeParse({ title: 'T', priority: 'URGENT' }).success).toBe(false);
  });

  it('rejects missing title', () => {
    expect(createTaskSchema.safeParse({}).success).toBe(false);
  });
});

describe('updateTaskSchema', () => {
  it('accepts a single field update', () => {
    expect(updateTaskSchema.safeParse({ title: 'New title' }).success).toBe(true);
    expect(updateTaskSchema.safeParse({ status: 'DONE' }).success).toBe(true);
    expect(updateTaskSchema.safeParse({ priority: 'LOW' }).success).toBe(true);
  });

  it('rejects empty object (at least one field required)', () => {
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
  });

  it('rejects empty title', () => {
    expect(updateTaskSchema.safeParse({ title: '' }).success).toBe(false);
  });

  it('rejects invalid status', () => {
    expect(updateTaskSchema.safeParse({ status: 'INVALID' }).success).toBe(false);
  });

  it('accepts dueDate as null (clearing)', () => {
    expect(updateTaskSchema.safeParse({ dueDate: null }).success).toBe(true);
  });
});

describe('taskFiltersSchema', () => {
  it('accepts empty filters', () => {
    expect(taskFiltersSchema.safeParse({}).success).toBe(true);
  });

  it('parses page and limit strings to numbers', () => {
    const result = taskFiltersSchema.safeParse({ page: '2', limit: '25' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(25);
    }
  });

  it('rejects page < 1', () => {
    expect(taskFiltersSchema.safeParse({ page: '0' }).success).toBe(false);
  });

  it('rejects limit > 100', () => {
    expect(taskFiltersSchema.safeParse({ limit: '101' }).success).toBe(false);
  });

  it('rejects non-numeric page', () => {
    expect(taskFiltersSchema.safeParse({ page: 'abc' }).success).toBe(false);
  });

  it('accepts valid sortBy and sortOrder', () => {
    const result = taskFiltersSchema.safeParse({ sortBy: 'dueDate', sortOrder: 'desc' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid sortBy', () => {
    expect(taskFiltersSchema.safeParse({ sortBy: 'unknown' }).success).toBe(false);
  });

  it('accepts status filter', () => {
    expect(taskFiltersSchema.safeParse({ status: 'OPEN' }).success).toBe(true);
  });

  it('rejects invalid status', () => {
    expect(taskFiltersSchema.safeParse({ status: 'BOGUS' }).success).toBe(false);
  });
});
