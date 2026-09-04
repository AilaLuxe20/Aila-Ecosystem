import { getBillingStatus } from "@/core/billing/service";
import { prisma } from "@/core/database/prisma";
import type { UserRole } from "@/types/auth";

export type DashboardSummary = {
  planLabel: string;
  conversations: number;
  dailyNotes: number;
  openGoals: number;
  writerDocuments: number;
  translations: number;
  libraryDocuments: number;
  legalDocuments: number;
  legalConversations: number;
  calendarEvents: number;
  contacts: number;
  openTasks: number;
  automations: number;
  products: number;
  pendingOrders: number;
  shipments: number;
  campaigns: number;
  codingProjects: number;
  careerApplications: number;
  educationCourses: number;
  healthLogs: number;
  financeTransactions: number;
  travelTrips: number;
  apps: number;
  sites: number;
  flows: number;
};

export async function getDashboardSummary(
  userId: string,
  role: UserRole,
): Promise<DashboardSummary> {
  const [
    billing,
    conversations,
    dailyNotes,
    openGoals,
    writerDocuments,
    translations,
    libraryDocuments,
    legalDocuments,
    legalConversations,
    calendarEvents,
    contacts,
    openTasks,
    automations,
    products,
    pendingOrders,
    shipments,
    campaigns,
    codingProjects,
    careerApplications,
    educationCourses,
    healthLogs,
    financeTransactions,
    travelTrips,
    apps,
    sites,
    flows,
  ] = await Promise.all([
    getBillingStatus(userId, role),
    prisma.conversation.count({ where: { userId, mode: "intelligence" } }),
    prisma.dailyNote.count({ where: { userId } }),
    prisma.dailyGoal.count({ where: { userId, status: "open" } }),
    prisma.writerBook.count({ where: { userId } }),
    prisma.translateEntry.count({ where: { userId } }),
    prisma.libraryDocument.count({ where: { userId } }),
    prisma.legalDocument.count({ where: { userId } }),
    prisma.conversation.count({ where: { userId, mode: "legal" } }),
    prisma.calendarEvent.count({ where: { userId, archivedAt: null } }),
    prisma.businessContact.count({ where: { userId } }),
    prisma.businessTask.count({ where: { userId, status: "open" } }),
    prisma.automationRule.count({ where: { userId, enabled: true } }),
    prisma.commerceProduct.count({ where: { userId, active: true } }),
    prisma.commerceOrder.count({ where: { userId, status: "pending" } }),
    prisma.shippingShipment.count({ where: { userId } }),
    prisma.adsCampaign.count({ where: { userId } }),
    prisma.codingProject.count({ where: { userId } }),
    prisma.careerApplication.count({ where: { userId } }),
    prisma.educationCourse.count({ where: { userId } }),
    prisma.healthLog.count({ where: { userId } }),
    prisma.financeTransaction.count({ where: { userId } }),
    prisma.travelTrip.count({ where: { userId } }),
    prisma.appListing.count({ where: { userId } }),
    prisma.site.count({ where: { userId } }),
    prisma.flow.count({ where: { userId } }),
  ]);

  return {
    planLabel: billing.planLabel,
    conversations,
    dailyNotes,
    openGoals,
    writerDocuments,
    translations,
    libraryDocuments,
    legalDocuments,
    legalConversations,
    calendarEvents,
    contacts,
    openTasks,
    automations,
    products,
    pendingOrders,
    shipments,
    campaigns,
    codingProjects,
    careerApplications,
    educationCourses,
    healthLogs,
    financeTransactions,
    travelTrips,
    apps,
    sites,
    flows,
  };
}
