/**
 * Automatisierte Reports Service (v7.5)
 * 
 * Generiert wöchentliche Team- und Kundenstatus-Reports
 * Kann per Scheduler oder manuell ausgelöst werden
 */

import * as db from "../db";

// ============================================
// Report-Typen
// ============================================

export interface WeeklyTeamReport {
  generatedAt: Date;
  period: { from: Date; to: Date };
  summary: {
    activeProjects: number;
    completedThisWeek: number;
    newProjects: number;
    openOffers: number;
    overdueTasksCount: number;
    activeConstructionSites: number;
  };
  projectUpdates: Array<{
    projectId: number;
    projectName: string;
    phase: string;
    progress: number;
    tasksCompleted: number;
    tasksTotal: number;
  }>;
  upcomingDeadlines: Array<{
    taskTitle: string;
    projectName: string;
    dueDate: Date;
    assignedTo: string;
  }>;
  teamPerformance: {
    tasksCompletedThisWeek: number;
    averageCompletionTime: number; // in Stunden
    onTimeRate: number; // Prozent
  };
}

export interface WeeklyCustomerReport {
  generatedAt: Date;
  period: { from: Date; to: Date };
  companyId: number;
  companyName: string;
  projects: Array<{
    projectId: number;
    projectName: string;
    phase: string;
    progress: number;
    lastUpdate: string;
    ampelStatus: "gruen" | "gelb" | "rot";
  }>;
  constructionSites: Array<{
    siteId: number;
    siteName: string;
    status: string;
    progress: number;
    nextMilestone: string;
  }>;
  openInvoices: Array<{
    invoiceNumber: string;
    amount: number;
    dueDate: Date;
    status: string;
  }>;
}

// ============================================
// Report-Generierung
// ============================================

/**
 * Berechnet den Zeitraum der letzten Woche (Mo-So)
 */
function getLastWeekPeriod(): { from: Date; to: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - dayOfWeek - 6);
  lastMonday.setHours(0, 0, 0, 0);
  
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);
  lastSunday.setHours(23, 59, 59, 999);
  
  return { from: lastMonday, to: lastSunday };
}

/**
 * Generiert einen wöchentlichen Team-Report
 */
export async function generateWeeklyTeamReport(): Promise<WeeklyTeamReport> {
  const period = getLastWeekPeriod();
  
  // Projekte abrufen
  const projects = await db.getAllProjects();
  const activeProjects = projects.filter(p => 
    !["abgeschlossen", "verloren"].includes(p.phase)
  );
  const completedThisWeek = projects.filter(p => 
    p.phase === "abgeschlossen" && 
    new Date(p.updatedAt) >= period.from && 
    new Date(p.updatedAt) <= period.to
  );
  const newProjects = projects.filter(p => 
    new Date(p.createdAt) >= period.from && 
    new Date(p.createdAt) <= period.to
  );

  // Angebote
  const offers = await db.getAllOffers();
  const openOffers = offers.filter(o => o.status === "erstellt" || o.status === "versendet");

  // Aufgaben
  const tasks = await db.getAllTasks();
  const overdueTasks = tasks.filter(t => 
    t.status !== "erledigt" && t.dueDate && new Date(t.dueDate) < new Date()
  );
  const completedTasksThisWeek = tasks.filter(t => 
    t.status === "erledigt" && 
    t.updatedAt && new Date(t.updatedAt) >= period.from && 
    new Date(t.updatedAt!) <= period.to
  );

  // Baustellen
  const sites = await db.getAllConstructionSites();
  const activeSites = sites.filter(s => s.status === "aktiv");

  // Projekt-Updates
  const projectUpdates = activeProjects.slice(0, 10).map(p => {
    const projectTasks = tasks.filter(t => t.projectId === p.id);
    const completedProjectTasks = projectTasks.filter(t => t.status === "erledigt");
    return {
      projectId: p.id,
      projectName: p.name,
      phase: p.phase,
      progress: p.progress || 0,
      tasksCompleted: completedProjectTasks.length,
      tasksTotal: projectTasks.length,
    };
  });

  // Anstehende Deadlines
  const upcomingDeadlines = tasks
    .filter(t => t.status !== "erledigt" && t.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 10)
    .map(t => ({
      taskTitle: t.title,
      projectName: projects.find(p => p.id === t.projectId)?.name || "Unbekannt",
      dueDate: new Date(t.dueDate!),
      assignedTo: t.assignedToId ? `User ${t.assignedToId}` : "Nicht zugewiesen",
    }));

  // Team-Performance
  const onTimeTasks = completedTasksThisWeek.filter(t => 
    t.dueDate && new Date(t.updatedAt!) <= new Date(t.dueDate)
  );

  return {
    generatedAt: new Date(),
    period,
    summary: {
      activeProjects: activeProjects.length,
      completedThisWeek: completedThisWeek.length,
      newProjects: newProjects.length,
      openOffers: openOffers.length,
      overdueTasksCount: overdueTasks.length,
      activeConstructionSites: activeSites.length,
    },
    projectUpdates,
    upcomingDeadlines,
    teamPerformance: {
      tasksCompletedThisWeek: completedTasksThisWeek.length,
      averageCompletionTime: 0, // Placeholder – benötigt Start/End-Timestamps
      onTimeRate: completedTasksThisWeek.length > 0
        ? Math.round((onTimeTasks.length / completedTasksThisWeek.length) * 100)
        : 100,
    },
  };
}

/**
 * Generiert einen wöchentlichen Kundenstatus-Report für ein Unternehmen
 */
export async function generateWeeklyCustomerReport(companyId: number): Promise<WeeklyCustomerReport | null> {
  const period = getLastWeekPeriod();
  
  const company = await db.getCompanyById(companyId);
  if (!company) return null;

  const projects = await db.getAllProjects();
  const companyProjects = projects.filter((p: any) => p.companyId === companyId);

  const sites = await db.getAllConstructionSites();
  const invoices = await db.getAllInvoices();

  const projectData = companyProjects.map(p => {
    const lastUpdate = p.updatedAt 
      ? new Date(p.updatedAt).toLocaleDateString("de-DE")
      : "Kein Update";
    
    // Einfache Ampel-Logik
    let ampelStatus: "gruen" | "gelb" | "rot" = "gruen";
    const tasks = []; // Vereinfacht
    if (p.phase === "verloren") ampelStatus = "rot";
    else if (p.phase === "nachfassen") ampelStatus = "gelb";

    return {
      projectId: p.id,
      projectName: p.name,
      phase: p.phase,
      progress: p.progress || 0,
      lastUpdate,
      ampelStatus,
    };
  });

  const siteData = sites
    .filter((s: any) => companyProjects.some((p: any) => p.id === s.projectId))
    .map((s: any) => ({
      siteId: s.id,
      siteName: s.name || `Baustelle ${s.id}`,
      status: s.status,
      progress: s.progress || 0,
      nextMilestone: s.status === "aktiv" ? "Abnahme" : "Start",
    }));

  const invoiceData = invoices
    .filter((i: any) => companyProjects.some((p: any) => p.id === i.projectId) && i.status !== "bezahlt")
    .map((i: any) => ({
      invoiceNumber: i.invoiceNumber,
      amount: parseFloat(String(i.totalGross || 0)),
      dueDate: i.dueDate ? new Date(i.dueDate) : new Date(),
      status: i.status,
    }));

  return {
    generatedAt: new Date(),
    period,
    companyId,
    companyName: company.name,
    projects: projectData,
    constructionSites: siteData,
    openInvoices: invoiceData,
  };
}

/**
 * Formatiert einen Team-Report als HTML für E-Mail-Versand
 */
export function formatTeamReportAsHtml(report: WeeklyTeamReport): string {
  const fromStr = report.period.from.toLocaleDateString("de-DE");
  const toStr = report.period.to.toLocaleDateString("de-DE");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #4e5758; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 20px;">📊 Wöchentlicher Team-Report</h1>
        <p style="margin: 5px 0 0; opacity: 0.8;">${fromStr} – ${toStr}</p>
      </div>
      
      <div style="padding: 20px; background: #f9f9f9;">
        <h2 style="color: #4e5758; font-size: 16px;">Zusammenfassung</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Aktive Projekte</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; text-align: right;">${report.summary.activeProjects}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Diese Woche abgeschlossen</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; text-align: right; color: #77bc1f;">${report.summary.completedThisWeek}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Neue Projekte</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; text-align: right;">${report.summary.newProjects}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Offene Angebote</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; text-align: right;">${report.summary.openOffers}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">Überfällige Aufgaben</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; text-align: right; color: ${report.summary.overdueTasksCount > 0 ? '#ef4444' : '#77bc1f'};">${report.summary.overdueTasksCount}</td>
          </tr>
          <tr>
            <td style="padding: 8px;">Aktive Baustellen</td>
            <td style="padding: 8px; font-weight: bold; text-align: right;">${report.summary.activeConstructionSites}</td>
          </tr>
        </table>

        <h2 style="color: #4e5758; font-size: 16px; margin-top: 20px;">Team-Performance</h2>
        <p>Aufgaben erledigt: <strong>${report.teamPerformance.tasksCompletedThisWeek}</strong></p>
        <p>Pünktlichkeitsrate: <strong>${report.teamPerformance.onTimeRate}%</strong></p>
      </div>
      
      <div style="padding: 15px; background: #4e5758; color: white; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px;">
        FassadenFix Projektmanager – Automatisch generiert
      </div>
    </div>
  `;
}
