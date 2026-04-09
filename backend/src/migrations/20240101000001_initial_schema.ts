import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('full_name', 255).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.enum('role', ['secretary', 'bursar', 'dos', 'admin']).notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('last_login_at').nullable();
    table.timestamps(true, true);
  });

  // 2. classes table
  await knex.schema.createTable('classes', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable().unique();
    table.integer('level_order').notNullable();
    table.timestamps(true, true);
  });

  // 3. streams table
  await knex.schema.createTable('streams', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable().unique();
    table.timestamps(true, true);
  });

  // 4. students table
  await knex.schema.createTable('students', (table) => {
    table.increments('id').primary();
    table.string('unique_student_id', 20).notNullable().unique();
    table.string('full_name', 255).notNullable();
    table.string('photo_url', 500).nullable();
    table.integer('class_id').unsigned().notNullable().references('id').inTable('classes').onDelete('RESTRICT');
    table.integer('stream_id').unsigned().notNullable().references('id').inTable('streams').onDelete('RESTRICT');
    table.date('enrollment_date').notNullable();
    table.enum('status', ['active', 'inactive', 'graduated', 'transferred']).defaultTo('active');
    table.integer('created_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.integer('updated_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);

    table.index('full_name');
    table.index('class_id');
    table.index('stream_id');
    table.index('status');
    table.index('enrollment_date');
  });

  // 5. subjects table
  await knex.schema.createTable('subjects', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.string('code', 20).notNullable().unique();
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // 6. academic_years table
  await knex.schema.createTable('academic_years', (table) => {
    table.increments('id').primary();
    table.string('name', 50).notNullable().unique();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.boolean('is_current').defaultTo(false);
    table.timestamps(true, true);
  });

  // 7. terms table
  await knex.schema.createTable('terms', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNullable();
    table.integer('academic_year_id').unsigned().notNullable().references('id').inTable('academic_years').onDelete('CASCADE');
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();
    table.timestamps(true, true);
    
    table.unique(['name', 'academic_year_id']);
  });

  // 8. exams table
  await knex.schema.createTable('exams', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.integer('term_id').unsigned().notNullable().references('id').inTable('terms').onDelete('CASCADE');
    table.integer('class_id').unsigned().nullable().references('id').inTable('classes').onDelete('SET NULL');
    table.date('exam_date').nullable();
    table.timestamps(true, true);
  });

  // 9. fee_structures table
  await knex.schema.createTable('fee_structures', (table) => {
    table.increments('id').primary();
    table.integer('academic_year_id').unsigned().notNullable().references('id').inTable('academic_years').onDelete('CASCADE');
    table.integer('term_id').unsigned().notNullable().references('id').inTable('terms').onDelete('CASCADE');
    table.integer('class_id').unsigned().notNullable().references('id').inTable('classes').onDelete('CASCADE');
    table.string('fee_category', 100).notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.boolean('is_active').defaultTo(true);
    table.integer('created_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);

    table.unique(['academic_year_id', 'term_id', 'class_id', 'fee_category']);
  });

  // 10. payments table
  await knex.schema.createTable('payments', (table) => {
    table.increments('id').primary();
    table.integer('student_id').unsigned().notNullable().references('id').inTable('students').onDelete('RESTRICT');
    table.decimal('amount', 12, 2).notNullable();
    table.date('payment_date').notNullable();
    table.enum('method', ['cash', 'bank_transfer', 'mobile_money', 'card']).notNullable();
    table.string('reference_no', 100).nullable();
    table.string('receipt_no', 50).notNullable().unique();
    table.text('notes').nullable();
    table.integer('recorded_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);

    table.index('student_id');
    table.index('payment_date');
    table.index('method');
    table.index('receipt_no');
  });

  // 11. grades table
  await knex.schema.createTable('grades', (table) => {
    table.increments('id').primary();
    table.integer('student_id').unsigned().notNullable().references('id').inTable('students').onDelete('CASCADE');
    table.integer('subject_id').unsigned().notNullable().references('id').inTable('subjects').onDelete('CASCADE');
    table.integer('exam_id').unsigned().notNullable().references('id').inTable('exams').onDelete('CASCADE');
    table.decimal('score', 5, 2).notNullable();
    table.string('grade_letter', 5).nullable();
    table.text('remarks').nullable();
    table.integer('recorded_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);

    table.unique(['student_id', 'subject_id', 'exam_id']);
    table.index('student_id');
    table.index('exam_id');
  });

  // 12. audit_logs table
  await knex.schema.createTable('audit_logs', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL');
    table.string('action', 100).notNullable();
    table.string('entity_type', 100).notNullable();
    table.integer('entity_id').nullable();
    table.jsonb('metadata').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('user_id');
    table.index('entity_type');
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('grades');
  await knex.schema.dropTableIfExists('payments');
  await knex.schema.dropTableIfExists('fee_structures');
  await knex.schema.dropTableIfExists('exams');
  await knex.schema.dropTableIfExists('terms');
  await knex.schema.dropTableIfExists('academic_years');
  await knex.schema.dropTableIfExists('subjects');
  await knex.schema.dropTableIfExists('students');
  await knex.schema.dropTableIfExists('streams');
  await knex.schema.dropTableIfExists('classes');
  await knex.schema.dropTableIfExists('users');
}
