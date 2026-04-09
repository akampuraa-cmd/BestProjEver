import db from '../config/database';

interface AuditLogEntry {
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id?: number | null;
  metadata?: Record<string, unknown>;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await db('audit_logs').insert({
      user_id: entry.user_id,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id || null,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    });
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('Audit log failed:', error);
  }
}
