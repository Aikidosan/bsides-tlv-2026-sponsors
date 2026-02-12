import { base44 } from '@/api/base44Client';

export async function logActivity({
  action,
  entity_type,
  entity_id,
  entity_name,
  details,
  user
}) {
  try {
    await base44.entities.ActivityLog.create({
      action,
      entity_type,
      entity_id,
      entity_name,
      details,
      user_email: user?.email || 'unknown',
      user_name: user?.full_name || user?.email || 'Unknown User'
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}