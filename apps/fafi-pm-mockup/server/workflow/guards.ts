import { getDb } from "../db";
import { offers, orders, constructionSites, projects, properties } from "../../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * FaFi PM Workflow Guards
 * 
 * Guard-Funktionen prüfen DB-Voraussetzungen für Phasenübergänge.
 * Jede Guard-Funktion gibt { passed: boolean, message: string } zurück.
 */

export interface GuardResult {
  passed: boolean;
  message: string;
}

// ============================================
// GUARD REGISTRY
// ============================================

type GuardFn = (projectId: number) => Promise<GuardResult>;

const GUARD_REGISTRY: Record<string, GuardFn> = {
  always: guardAlways,
  hasProperty: guardHasProperty,
  hasOffer: guardHasOffer,
  offerIsSent: guardOfferIsSent,
  followUpDue: guardFollowUpDue,
  hasOrder: guardHasOrder,
  hasConstructionSite: guardHasConstructionSite,
  hasTeamAssigned: guardHasTeamAssigned,
  constructionSiteActive: guardConstructionSiteActive,
  constructionSiteComplete: guardConstructionSiteComplete,
  hasAcceptanceProtocol: guardHasAcceptanceProtocol,
};

/**
 * Führt eine Guard-Funktion anhand ihres Namens aus
 */
export async function checkGuard(guardName: string, projectId: number): Promise<GuardResult> {
  const guardFn = GUARD_REGISTRY[guardName];
  if (!guardFn) {
    return { passed: false, message: `Guard "${guardName}" nicht gefunden` };
  }
  return guardFn(projectId);
}

// ============================================
// GUARD IMPLEMENTATIONS
// ============================================

/**
 * Immer erlaubt (für "verloren" Übergang)
 */
async function guardAlways(_projectId: number): Promise<GuardResult> {
  return { passed: true, message: "Übergang ist immer erlaubt" };
}

/**
 * Nr.43: Prüft ob mindestens eine Immobilie (Objektaufnahme) für das Projekt existiert
 */
async function guardHasProperty(projectId: number): Promise<GuardResult> {
  const db = await getDb();
  if (!db) return { passed: false, message: "Datenbankverbindung nicht verfügbar" };

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(properties)
    .where(eq(properties.projectId, projectId));

  const count = result[0]?.count ?? 0;
  
  if (count > 0) {
    return { passed: true, message: `${count} Immobilie(n) erfasst` };
  }
  return { passed: false, message: "Keine Objektaufnahme vorhanden. Führe zuerst eine Objektaufnahme durch." };
}

/**
 * Prüft ob mindestens ein Angebot für das Projekt existiert
 */
async function guardHasOffer(projectId: number): Promise<GuardResult> {
  const db = await getDb();
  if (!db) return { passed: false, message: "Datenbankverbindung nicht verfügbar" };

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(offers)
    .where(eq(offers.projectId, projectId));

  const count = result[0]?.count ?? 0;
  
  if (count > 0) {
    return { passed: true, message: `${count} Angebot(e) vorhanden` };
  }
  return { passed: false, message: "Kein Angebot vorhanden. Erstellen Sie zuerst ein Angebot." };
}

/**
 * Prüft ob mindestens ein Angebot den Status "versendet" hat
 */
async function guardOfferIsSent(projectId: number): Promise<GuardResult> {
  const db = await getDb();
  if (!db) return { passed: false, message: "Datenbankverbindung nicht verfügbar" };

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(offers)
    .where(and(eq(offers.projectId, projectId), eq(offers.status, "versendet")));

  const count = result[0]?.count ?? 0;
  
  if (count > 0) {
    return { passed: true, message: `${count} Angebot(e) versendet` };
  }
  return { passed: false, message: "Kein Angebot wurde versendet. Versenden Sie zuerst ein Angebot." };
}

/**
 * Prüft ob Nachfassen fällig ist (7+ Tage seit Angebotsversand)
 */
async function guardFollowUpDue(projectId: number): Promise<GuardResult> {
  const db = await getDb();
  if (!db) return { passed: false, message: "Datenbankverbindung nicht verfügbar" };

  const sentOffers = await db
    .select({ sentAt: offers.sentAt })
    .from(offers)
    .where(and(eq(offers.projectId, projectId), eq(offers.status, "versendet")));

  if (sentOffers.length === 0) {
    return { passed: false, message: "Kein versendetes Angebot gefunden" };
  }

  // Prüfe ob das älteste versendete Angebot 7+ Tage alt ist
  const oldestSentAt = sentOffers
    .filter((o) => o.sentAt)
    .sort((a, b) => new Date(a.sentAt!).getTime() - new Date(b.sentAt!).getTime())[0];

  if (!oldestSentAt?.sentAt) {
    return { passed: false, message: "Kein Versanddatum gefunden" };
  }

  const daysSinceSent = Math.floor(
    (Date.now() - new Date(oldestSentAt.sentAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceSent >= 7) {
    return { passed: true, message: `Angebot seit ${daysSinceSent} Tagen versendet – Nachfassen fällig` };
  }
  return { passed: false, message: `Angebot erst seit ${daysSinceSent} Tagen versendet (Nachfassen ab 7 Tagen)` };
}

/**
 * Prüft ob ein Auftrag für das Projekt existiert
 */
async function guardHasOrder(projectId: number): Promise<GuardResult> {
  const db = await getDb();
  if (!db) return { passed: false, message: "Datenbankverbindung nicht verfügbar" };

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(eq(orders.projectId, projectId));

  const count = result[0]?.count ?? 0;
  
  if (count > 0) {
    return { passed: true, message: `${count} Auftrag/Aufträge vorhanden` };
  }
  return { passed: false, message: "Kein Auftrag vorhanden. Nehmen Sie zuerst einen Auftrag an." };
}

/**
 * Prüft ob eine Baustelle für das Projekt existiert
 */
async function guardHasConstructionSite(projectId: number): Promise<GuardResult> {
  const db = await getDb();
  if (!db) return { passed: false, message: "Datenbankverbindung nicht verfügbar" };

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(constructionSites)
    .where(eq(constructionSites.projectId, projectId));

  const count = result[0]?.count ?? 0;
  
  if (count > 0) {
    return { passed: true, message: `${count} Baustelle(n) vorhanden` };
  }
  return { passed: false, message: "Keine Baustelle angelegt. Erstellen Sie zuerst eine Baustelle." };
}

/**
 * Prüft ob ein Team der Baustelle zugewiesen wurde
 */
async function guardHasTeamAssigned(projectId: number): Promise<GuardResult> {
  const db = await getDb();
  if (!db) return { passed: false, message: "Datenbankverbindung nicht verfügbar" };

  const sites = await db
    .select({ teamMembers: constructionSites.teamMembers, projektleiterId: constructionSites.projektleiterId })
    .from(constructionSites)
    .where(eq(constructionSites.projectId, projectId));

  if (sites.length === 0) {
    return { passed: false, message: "Keine Baustelle angelegt" };
  }

  const hasTeam = sites.some(
    (s) => s.projektleiterId || (s.teamMembers && (s.teamMembers as number[]).length > 0)
  );

  if (hasTeam) {
    return { passed: true, message: "Team zugewiesen" };
  }
  return { passed: false, message: "Kein Team zugewiesen. Weisen Sie einen Projektleiter oder Teammitglieder zu." };
}

/**
 * Prüft ob die Baustelle den Status "aktiv" hat
 */
async function guardConstructionSiteActive(projectId: number): Promise<GuardResult> {
  const db = await getDb();
  if (!db) return { passed: false, message: "Datenbankverbindung nicht verfügbar" };

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(constructionSites)
    .where(and(eq(constructionSites.projectId, projectId), eq(constructionSites.status, "aktiv")));

  const count = result[0]?.count ?? 0;
  
  if (count > 0) {
    return { passed: true, message: `${count} aktive Baustelle(n)` };
  }
  return { passed: false, message: "Keine aktive Baustelle. Starten Sie zuerst die Baustelle." };
}

/**
 * Prüft ob die Baustelle abgeschlossen ist (Fortschritt 100% oder Status "abgeschlossen")
 */
async function guardConstructionSiteComplete(projectId: number): Promise<GuardResult> {
  const db = await getDb();
  if (!db) return { passed: false, message: "Datenbankverbindung nicht verfügbar" };

  const sites = await db
    .select({ status: constructionSites.status, progress: constructionSites.progress })
    .from(constructionSites)
    .where(eq(constructionSites.projectId, projectId));

  if (sites.length === 0) {
    return { passed: false, message: "Keine Baustelle angelegt" };
  }

  const allComplete = sites.every(
    (s) => s.status === "abgeschlossen" || (s.progress && s.progress >= 100)
  );

  if (allComplete) {
    return { passed: true, message: "Alle Baustellen abgeschlossen" };
  }
  return { passed: false, message: "Nicht alle Baustellen abgeschlossen. Schließen Sie zuerst alle Arbeiten ab." };
}

/**
 * Prüft ob ein Abnahmeprotokoll existiert (über Auftrags-Status)
 */
async function guardHasAcceptanceProtocol(projectId: number): Promise<GuardResult> {
  const db = await getDb();
  if (!db) return { passed: false, message: "Datenbankverbindung nicht verfügbar" };

  const result = await db
    .select({ status: orders.status })
    .from(orders)
    .where(eq(orders.projectId, projectId));

  if (result.length === 0) {
    return { passed: false, message: "Kein Auftrag vorhanden" };
  }

  const hasCompleted = result.some((o) => o.status === "abgeschlossen");

  if (hasCompleted) {
    return { passed: true, message: "Abnahme abgeschlossen" };
  }
  return { passed: false, message: "Abnahme noch nicht durchgeführt. Führen Sie zuerst die Abnahme durch." };
}
