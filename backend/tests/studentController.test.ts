import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import {
  buildStudentFilter,
  createStudent,
  getStudents,
  getListOptions,
  handleStudentError
} from '../controllers/studentController';
import Student from '../models/Student';

const createResponse = () => ({
  statusCode: 0,
  body: undefined as unknown,
  status(code: number) {
    this.statusCode = code;
    return this;
  },
  json(body: unknown) {
    this.body = body;
    return this;
  }
});

test('buildStudentFilter combines all supported filters', () => {
  const filter = buildStudentFilter({
    search: 'asha',
    college: 'ABC College',
    course: 'B.Tech',
    placementStatus: 'Placed',
    skill: 'Node.js'
  });

  assert.equal(filter.$or?.length, 2);
  assert.equal((filter.name as RegExp | undefined), undefined);
  assert.equal((filter.college as RegExp).test('abc college'), true);
  assert.equal((filter.course as RegExp).test('b.tech'), true);
  assert.equal(filter.placementStatus, 'Placed');
  assert.equal((filter.skills as RegExp).test('node.js'), true);
});

test('getListOptions validates pagination and placement status', () => {
  assert.deepEqual(getListOptions({ page: '0' }), {
    error: 'page must be at least 1'
  });
  assert.deepEqual(getListOptions({ limit: '101' }), {
    error: 'limit must be between 1 and 100'
  });
  assert.deepEqual(getListOptions({ placementStatus: 'Waiting' }), {
    error: 'placementStatus must be one of: Not Placed, Placed, Seeking Opportunity'
  });
});

test('getListOptions keeps pagination and multiple filters together', () => {
  const result = getListOptions({
    page: '2',
    limit: '5',
    search: 'asha',
    college: 'ABC College',
    skill: 'Node.js'
  });

  assert.deepEqual(result, {
    options: {
      page: 2,
      limit: 5,
      filters: { search: 'asha', college: 'ABC College', skill: 'Node.js' }
    }
  });
});

test('getStudents uses the combined filter for results and total count', async () => {
  const studentModel = Student as unknown as {
    find: (filter: unknown) => unknown;
    countDocuments: (filter: unknown) => unknown;
  };
  const originalFind = studentModel.find;
  const originalCountDocuments = studentModel.countDocuments;
  let resultFilter: unknown;
  let countFilter: unknown;

  studentModel.find = (filter) => {
    resultFilter = filter;
    return {
      sort: () => ({ skip: () => ({ limit: async () => [] }) })
    };
  };
  studentModel.countDocuments = async (filter) => {
    countFilter = filter;
    return 0;
  };

  try {
    const response = createResponse();
    await getStudents(
      {
        query: { search: 'asha', college: 'ABC College', skill: 'Node.js', page: '2', limit: '5' }
      } as never,
      response as never,
      () => {
        throw new Error('next should not be called');
      }
    );

    assert.equal(response.statusCode, 200);
    assert.strictEqual(resultFilter, countFilter);
    assert.equal((resultFilter as { $or: unknown[] }).$or.length, 2);
    assert.equal((resultFilter as { college: RegExp }).college.test('abc college'), true);
  } finally {
    studentModel.find = originalFind;
    studentModel.countDocuments = originalCountDocuments;
  }
});

test('Student model validates a valid and invalid email', () => {
  const validStudent = new Student({ name: 'Asha Sharma', email: 'asha@example.com' });
  const invalidStudent = new Student({ name: 'Asha Sharma', email: 'wrong-email' });

  assert.equal(validStudent.validateSync(), undefined);
  assert.ok(invalidStudent.validateSync());
});

test('createStudent rejects missing required fields', async () => {
  const response = createResponse();

  await createStudent({ body: {} } as never, response as never, () => {
    throw new Error('next should not be called');
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, { message: 'Name and email are required' });
});

test('handleStudentError returns clear duplicate email and invalid ID responses', () => {
  const duplicateResponse = createResponse();
  handleStudentError({ code: 11000 }, {} as never, duplicateResponse as never, () => {
    throw new Error('next should not be called');
  });
  assert.equal(duplicateResponse.statusCode, 409);

  const invalidIdResponse = createResponse();
  handleStudentError(
    new mongoose.Error.CastError('ObjectId', 'invalid-id', '_id'),
    {} as never,
    invalidIdResponse as never,
    () => {
      throw new Error('next should not be called');
    }
  );
  assert.equal(invalidIdResponse.statusCode, 400);
});
