import { listUserConversations } from "./service";

/**
 * List conversations for the current user.
 * This is a temporary implementation - in production, you should get the userId from auth context.
 */
export async function listConversations() {
  // TODO: Get userId from authentication context/session
  // For now, returning empty array to prevent build failure
  return [];
}
