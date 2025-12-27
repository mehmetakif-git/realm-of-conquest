// GM Roles - matches database enum
export type GMRole = 'helper' | 'moderator' | 'game_master' | 'admin' | 'owner';

// Ban Types
export type BanType = 'permanent' | 'temporary' | 'ip' | 'hwid';

// Keep GMLevel for backwards compatibility with UI components
export type GMLevel = 1 | 2 | 3 | 4 | 5;

export const GM_ROLE_NAMES: Record<GMRole, string> = {
  helper: 'Helper',
  moderator: 'Moderator',
  game_master: 'Game Master',
  admin: 'Admin',
  owner: 'Owner',
};

export const GM_LEVEL_NAMES: Record<GMLevel, string> = {
  1: 'Helper',
  2: 'Moderator',
  3: 'Game Master',
  4: 'Admin',
  5: 'Owner',
};

export const gmRoleToLevel = (role: GMRole): GMLevel => {
  const map: Record<GMRole, GMLevel> = {
    helper: 1,
    moderator: 2,
    game_master: 3,
    admin: 4,
    owner: 5,
  };
  return map[role];
};

// GM Permissions
export interface GMPermissions {
  can_ban: boolean;
  can_mute: boolean;
  can_jail: boolean;
  can_kick: boolean;
  can_teleport: boolean;
  can_spawn_items: boolean;
  can_modify_gold: boolean;
  can_view_tickets: boolean;
  can_send_announcements: boolean;
  can_view_player_data: boolean;
  can_modify_player_data: boolean;
  can_access_market_free: boolean;
  can_invisible: boolean;
  can_god_mode: boolean;
}

export interface GMAccount {
  id: string;
  account_id: string;
  gm_role: GMRole;
  gm_name: string;
  permissions?: GMPermissions;
  is_active: boolean;
  is_visible: boolean;
  is_on_duty: boolean;
  created_at: string;
  last_action_at?: string;
  // Computed for UI convenience
  level?: GMLevel;
}

export interface GMAuthResponse {
  token: string;
  gm_account: GMAccount;
}

// Ban - account level
export interface Ban {
  id: string;
  account_id: string;
  ban_type: string;
  reason: string;
  banned_by: string;
  starts_at: string;
  expires_at?: string;
  is_active: boolean;
  unbanned_by?: string;
  unbanned_at?: string;
  unban_reason?: string;
  banned_ip?: string;
  created_at: string;
}

export interface BanRequest {
  account_id: string;
  ban_type: string;
  reason: string;
  duration?: number; // hours
}

// Mute - character level
export interface Mute {
  id: string;
  character_id: string;
  mute_type: string;
  reason: string;
  muted_by: string;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export interface MuteRequest {
  character_id: string;
  mute_type: string;
  reason: string;
  duration: number; // minutes
}

// Announcement
export type AnnouncementType = 'global' | 'server' | 'maintenance' | 'event';

export interface Announcement {
  id: string;
  server_id?: number;
  announcement_type: AnnouncementType;
  title?: string;
  message: string;
  show_in_chat: boolean;
  show_as_popup: boolean;
  show_in_ticker: boolean;
  color: string;
  icon?: string;
  created_by?: string;
  starts_at: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  // Compatibility aliases
  type?: AnnouncementType;
  content?: string;
}

export interface AnnouncementRequest {
  server_id?: number;
  announcement_type: AnnouncementType;
  title?: string;
  message: string;
  show_in_chat: boolean;
  show_as_popup: boolean;
  color: string;
  expires_at?: string;
  // Compatibility aliases
  type?: AnnouncementType;
  content?: string;
}

// Ticket - character based
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketCategory = 'bug' | 'report' | 'support' | 'feedback' | 'appeal';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Ticket {
  id: string;
  server_id: number;
  reporter_id: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  related_character_id?: string;
  status: TicketStatus;
  assigned_to?: string;
  assigned_at?: string;
  resolution?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketRequest {
  server_id: number;
  category: string;
  priority: string;
  subject: string;
  description: string;
  related_character_id?: string;
}

// Ticket Message
export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'player' | 'gm';
  sender_character_id?: string;
  sender_gm_id?: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

export interface TicketMessageRequest {
  message: string;
  is_internal?: boolean;
}

// Legacy alias for compatibility
export interface TicketResponse extends TicketMessage {}

// Dashboard Stats
export interface DashboardStats {
  total_accounts: number;
  online_characters: number;
  active_bans: number;
  open_tickets: number;
  total_characters: number;
  active_mutes: number;
}

// Private Message - between characters
export interface PrivateMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  is_read: boolean;
  read_at?: string;
  is_gm_message: boolean;
  deleted_by_sender: boolean;
  deleted_by_recipient: boolean;
  created_at: string;
  // Computed fields with names
  sender_name?: string;
  recipient_name?: string;
  // Legacy compatibility
  receiver_id?: string;
  receiver_name?: string;
  content?: string;
}

export interface SendMessageRequest {
  recipient_id: string;
  message: string;
}
