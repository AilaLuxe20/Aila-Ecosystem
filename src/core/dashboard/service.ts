import { prisma } from "@/core/database/prisma";

export type DashboardSummary = {
  conversations: number;
  dailyNotes: number;
  openGoals: number;
  legalConversations: number;
  calendarEvents: number;
  contacts: number;
  openTasks: number;
  automations: number;
  products: number;
  pendingOrders: number;
  campaigns: number;
  apps: number;
  sites: number;
  flows: number;
};

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const [
    conversations,
    dailyNotes,
    openGoals,
    legalConversations,
    calendarEvents,
    contacts,
    openTasks,
    automations,
    products,
    pendingOrders,
    campaigns,
    apps,
    sites,
    flows,
  ] = await Promise.all([
    prisma.conversation.count({ where: { userId, mode: "intelligence" } }),
    prisma.dailyNote.count({ where: { userId } }),
    prisma.dailyGoal.count({ where: { userId, status: "open" } }),
    prisma.conversation.count({ where: { userId, mode: "legal" } }),
    prisma.calendarEvent.count({ where: { userId, archivedAt: null } }),
    prisma.businessContact.count({ where: { userId } }),
    prisma.businessTask.count({ where: { userId, status: "open" } }),
    prisma.automationRule.count({ where: { userId, enabled: true } }),
    prisma.commerceProduct.count({ where: { userId, active: true } }),
    prisma.commerceOrder.count({ where: { userId, status: "pending" } }),
    prisma.adsCampaign.count({ where: { userId } }),
    prisma.appListing.count({ where: { userId } }),
    prisma.site.count({ where: { userId } }),
    prisma.flow.count({ where: { userId } }),
  ]);

  return {
    conversations,
    dailyNotes,
    openGoals,
    legalConversations,
    calendarEvents,
    contacts,
    openTasks,
    automations,
    products,
    pendingOrders,
    campaigns,
    apps,
    sites,
    flows,
  };
}
