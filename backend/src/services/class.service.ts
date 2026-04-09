import db from '../config/database';

export class ClassService {
  async findAll(): Promise<Record<string, unknown>[]> {
    return db('classes').orderBy('level_order', 'asc');
  }

  async findById(id: number): Promise<Record<string, unknown> | undefined> {
    return db('classes').where({ id }).first();
  }
}

export class StreamService {
  async findAll(): Promise<Record<string, unknown>[]> {
    return db('streams').orderBy('name', 'asc');
  }

  async findById(id: number): Promise<Record<string, unknown> | undefined> {
    return db('streams').where({ id }).first();
  }
}
