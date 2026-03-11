import { eq, desc, and, sql, like, or, gte, lte, isNull, isNotNull, asc, inArray, not } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import { 
  InsertUser, users,
  InsertCompany, companies,
  InsertContact, contacts,
  InsertProject, projects,
  InsertProperty, properties,
  InsertConstructionSite, constructionSites,
  InsertOffer, offers,
  InsertTask, tasks,
  InsertActivityLog, activityLogs,
  InsertConstructionSiteLog, constructionSiteLogs,
  InsertTeamleiterCheck, teamleiterChecks,
  InsertDashboardWidget, dashboardWidgets,
  InsertNotification, notifications,
  InsertCustomerPortalToken, customerPortalTokens,
  InsertCalendarEvent, calendarEvents,
  InsertDocument, documents,
  InsertTextBlock, textBlocks,
  InsertOfferTemplate, offerTemplates,
  InsertEmailTemplate, emailTemplates,
  photos, InsertPhoto,
  taskComments, InsertTaskComment,
  tooltipFeedback, InsertTooltipFeedback,
  gatePhotos, InsertGatePhoto,
  libraryVehicles, InsertLibraryVehicle,
  libraryEquipment, InsertLibraryEquipment,
  libraryCleaningAgents, InsertLibraryCleaningAgent,
  libraryDiscounts, InsertLibraryDiscount,
  libraryServices, InsertLibraryService,
  libraryWorkClothing, InsertLibraryWorkClothing,
  libraryAssets, InsertLibraryAsset,
  teamMembers
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { generateEntityName, generateDisplayName, slugifyCompanyName, mapPhotoContextToEntityContext, mapDocumentCategoryToEntityContext, type EntityContext } from '../shared/naming';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

// Lazily create the drizzle instance with a robust connection pool.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 5,
        idleTimeout: 60000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });
      _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _pool = null;
    }
  }
  return _db;
}

/**
 * Setzt die DB-Verbindung zurück (z.B. nach ECONNRESET).
 */
export async function resetDbConnection(): Promise<void> {
  if (_pool) {
    try {
      _pool.end(() => {});
    } catch { /* ignore */ }
  }
  _db = null;
  _pool = null;
}

// ============================================
// USER QUERIES
// ============================================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(asc(users.name));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function updateUser(id: number, data: Partial<InsertUser> & Record<string, any>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

// ============================================
// COMPANY QUERIES
// ============================================
export async function getAllCompanies() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).orderBy(asc(companies.name));
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result[0];
}

export async function createCompany(data: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(companies).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateCompany(id: number, data: Partial<InsertCompany>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(companies).set(data).where(eq(companies.id, id));
  return getCompanyById(id);
}

export async function deleteCompany(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(companies).where(eq(companies.id, id));
}

export async function searchCompanies(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies)
    .where(or(
      like(companies.name, `%${query}%`),
      like(companies.city, `%${query}%`)
    ))
    .orderBy(asc(companies.name))
    .limit(20);
}

// ============================================
// CONTACT QUERIES
// ============================================
export async function getAllContacts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contacts).orderBy(asc(contacts.lastName));
}

export async function getContactById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
  return result[0];
}

export async function getContactsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contacts).where(eq(contacts.companyId, companyId)).orderBy(asc(contacts.lastName));
}

export async function getOrphanedContacts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contacts).where(eq(contacts.isOrphaned, true)).orderBy(asc(contacts.lastName));
}

export async function assignContactToCompany(contactId: number, companyId: number) {
  const db = await getDb();
  if (!db) return null;
  await db.update(contacts).set({ companyId, isOrphaned: false }).where(eq(contacts.id, contactId));
  return getContactById(contactId);
}

export async function createContact(data: InsertContact) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contacts).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateContact(id: number, data: Partial<InsertContact>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contacts).set(data).where(eq(contacts.id, id));
  return getContactById(id);
}

export async function deleteContact(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contacts).where(eq(contacts.id, id));
}

// ============================================
// PROJECT QUERIES
// ============================================
export async function getAllProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0];
}

export async function getProjectByNumber(projectNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.projectNumber, projectNumber)).limit(1);
  return result[0];
}

export async function getProjectsByPhase(phase: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects)
    .where(eq(projects.phase, phase as any))
    .orderBy(desc(projects.createdAt));
}

export async function getProjectsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.companyId, companyId)).orderBy(desc(projects.createdAt));
}

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateProject(id: number, data: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set(data).where(eq(projects.id, id));
  return getProjectById(id);
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(projects).where(eq(projects.id, id));
}

export async function generateProjectNumber(companyShortName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const year = new Date().getFullYear();
  const prefix = `${year}-${companyShortName}-`;
  
  // Find the highest number for this prefix
  const result = await db.select({ projectNumber: projects.projectNumber })
    .from(projects)
    .where(like(projects.projectNumber, `${prefix}%`))
    .orderBy(desc(projects.projectNumber))
    .limit(1);
  
  let nextNumber = 1;
  if (result.length > 0) {
    const lastNumber = parseInt(result[0].projectNumber.split('-').pop() || '0');
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${String(nextNumber).padStart(2, '0')}`;
}

// ============================================
// PROPERTY QUERIES
// ============================================
export async function getAllProperties() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    id: properties.id,
    projectId: properties.projectId,
    companyId: properties.companyId,
    constructionSiteId: properties.constructionSiteId,
    name: properties.name,
    street: properties.street,
    postalCode: properties.postalCode,
    city: properties.city,
    totalCleanableArea: properties.totalCleanableArea,
    frontSide: properties.frontSide,
    backSide: properties.backSide,
    leftGable: properties.leftGable,
    rightGable: properties.rightGable,
    specialFeatures: properties.specialFeatures,
    photos: properties.photos,
    accessNotes: properties.accessNotes,
    isDraft: properties.isDraft,
    satelliteImageUrl: properties.satelliteImageUrl,
    wizardStep: properties.wizardStep,
    wizardData: properties.wizardData,
    createdAt: properties.createdAt,
    updatedAt: properties.updatedAt,
    companyName: companies.name,
  })
    .from(properties)
    .leftJoin(companies, eq(properties.companyId, companies.id))
    .orderBy(desc(properties.createdAt));
  return result;
}

export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return result[0];
}

export async function getPropertiesByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(properties).where(eq(properties.projectId, projectId)).orderBy(asc(properties.name));
}

export async function getPropertiesByConstructionSiteId(constructionSiteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(properties).where(eq(properties.constructionSiteId, constructionSiteId)).orderBy(asc(properties.name));
}

export async function createProperty(data: InsertProperty) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(properties).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateProperty(id: number, data: Partial<InsertProperty>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(properties).set(data).where(eq(properties.id, id));
  return getPropertyById(id);
}

// Entwurfs-Funktionen für ObjektaufnahmeWizard
export async function savePropertyDraft(data: InsertProperty & { wizardStep?: number; wizardData?: Record<string, any> }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const draftData = { ...data, isDraft: true };
  const result = await db.insert(properties).values(draftData);
  return { id: result[0].insertId, ...draftData };
}

export async function updatePropertyDraft(id: number, data: Partial<InsertProperty> & { wizardStep?: number; wizardData?: Record<string, any> }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(properties).set({ ...data, isDraft: true }).where(eq(properties.id, id));
  return getPropertyById(id);
}

export async function finalizeDraft(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(properties).set({ isDraft: false, wizardData: null, wizardStep: null }).where(eq(properties.id, id));
  return getPropertyById(id);
}

export async function getPropertyDrafts(projectId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (projectId) {
    return db.select().from(properties)
      .where(and(eq(properties.isDraft, true), eq(properties.projectId, projectId)))
      .orderBy(desc(properties.updatedAt));
  }
  return db.select().from(properties)
    .where(eq(properties.isDraft, true))
    .orderBy(desc(properties.updatedAt));
}

export async function deletePropertyDraft(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Nur Entwürfe löschen
  await db.delete(properties).where(and(eq(properties.id, id), eq(properties.isDraft, true)));
  return { success: true };
}

export async function deleteProperty(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(properties).where(eq(properties.id, id));
}

// ============================================
// CONSTRUCTION SITE QUERIES
// ============================================
export async function getAllConstructionSites() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(constructionSites).orderBy(desc(constructionSites.createdAt));
}

export async function getConstructionSiteById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(constructionSites).where(eq(constructionSites.id, id)).limit(1);
  return result[0];
}

export async function getConstructionSitesByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(constructionSites).where(eq(constructionSites.projectId, projectId)).orderBy(desc(constructionSites.createdAt));
}

export async function getConstructionSitesByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(constructionSites)
    .where(eq(constructionSites.status, status as any))
    .orderBy(desc(constructionSites.createdAt));
}

export async function createConstructionSite(data: InsertConstructionSite) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(constructionSites).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateConstructionSite(id: number, data: Partial<InsertConstructionSite>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(constructionSites).set(data).where(eq(constructionSites.id, id));
  return getConstructionSiteById(id);
}

export async function deleteConstructionSite(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(constructionSites).where(eq(constructionSites.id, id));
}

export async function generateConstructionSiteNumber() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const year = new Date().getFullYear();
  const prefix = `B-${year}-`;
  
  const result = await db.select({ siteNumber: constructionSites.siteNumber })
    .from(constructionSites)
    .where(like(constructionSites.siteNumber, `${prefix}%`))
    .orderBy(desc(constructionSites.siteNumber))
    .limit(1);
  
  let nextNumber = 1;
  if (result.length > 0) {
    const lastNumber = parseInt(result[0].siteNumber.split('-').pop() || '0');
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

// ============================================
// OFFER QUERIES
// ============================================
export async function getAllOffers() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({
    offer: offers,
    projectName: projects.name,
    projectNumber: projects.projectNumber,
    companyName: companies.name,
  })
    .from(offers)
    .leftJoin(projects, eq(offers.projectId, projects.id))
    .leftJoin(companies, eq(offers.companyId, companies.id))
    .orderBy(desc(offers.createdAt));
  return rows.map(r => ({
    ...r.offer,
    project: r.projectName ? { name: r.projectName, projectNumber: r.projectNumber } : null,
    company: r.companyName ? { name: r.companyName } : null,
    // Immobilien aus positions JSON extrahieren
    propertyNames: (r.offer.positions as any[])?.map((p: any) => p.propertyName).filter(Boolean) || [],
  }));
}

export async function getOfferById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(offers).where(eq(offers.id, id)).limit(1);
  return result[0];
}

export async function getOffersByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(offers).where(eq(offers.projectId, projectId)).orderBy(desc(offers.version));
}

export async function getOffersByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(offers)
    .where(eq(offers.status, status as any))
    .orderBy(desc(offers.createdAt));
}

export async function getOffersByPropertyId(propertyId: number) {
  const db = await getDb();
  if (!db) return [];
  // positions ist ein JSON-Array mit { propertyId, propertyName, ... }
  // MySQL JSON_CONTAINS prüft ob propertyId im Array vorkommt
  const allOffers = await db.select({
    offer: offers,
    projectName: projects.name,
    companyName: companies.name,
  })
    .from(offers)
    .leftJoin(projects, eq(offers.projectId, projects.id))
    .leftJoin(companies, eq(offers.companyId, companies.id))
    .orderBy(desc(offers.createdAt));
  // Filter clientseitig da JSON_CONTAINS auf verschachtelte Objekte komplex ist
  return allOffers.filter(r => {
    const positions = r.offer.positions as any[];
    return positions?.some((p: any) => p.propertyId === propertyId);
  }).map(r => ({
    ...r.offer,
    project: r.projectName ? { name: r.projectName } : null,
    company: r.companyName ? { name: r.companyName } : null,
  }));
}

export async function createOffer(data: InsertOffer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(offers).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateOffer(id: number, data: Partial<InsertOffer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(offers).set(data).where(eq(offers.id, id));
  return getOfferById(id);
}

export async function deleteOffer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(offers).where(eq(offers.id, id));
}

export async function generateOfferNumber() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const year = new Date().getFullYear();
  const prefix = `FF-${year}-`;
  
  const result = await db.select({ offerNumber: offers.offerNumber })
    .from(offers)
    .where(like(offers.offerNumber, `${prefix}%`))
    .orderBy(desc(offers.offerNumber))
    .limit(1);
  
  let nextNumber = 1;
  if (result.length > 0) {
    const lastNumber = parseInt(result[0].offerNumber.split('-').pop() || '0');
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}

/**
 * Generiert einen sprechenden Display-Namen für ein Angebot.
 * z.B. "2026_Kreiswohnungswerk-Roding-GmbH_Angebot_0042_v1"
 */
export function generateOfferDisplayName(offerNumber: string, companyName: string, version: number = 1): string {
  return generateDisplayName(offerNumber, companyName, 'angebot', version);
}

/**
 * Generiert einen sprechenden Display-Namen für eine Rechnung.
 */
export function generateInvoiceDisplayName(invoiceNumber: string, companyName: string): string {
  return generateDisplayName(invoiceNumber, companyName, 'rechnung');
}

/**
 * Generiert einen sprechenden Display-Namen für einen Auftrag.
 */
export function generateOrderDisplayName(orderNumber: string, companyName: string): string {
  return generateDisplayName(orderNumber, companyName, 'auftrag');
}

/**
 * Generiert einen sprechenden Display-Namen für eine Garantie.
 */
export function generateWarrantyDisplayName(warrantyNumber: string, companyName: string): string {
  return generateDisplayName(warrantyNumber, companyName, 'garantie');
}

/**
 * Generiert einen sprechenden Display-Namen für ein Dokument.
 */
export function generateDocumentDisplayName(companyName: string, category: string, sequenceNumber: number): string {
  const context = mapDocumentCategoryToEntityContext(category || 'dokument');
  return generateEntityName({
    companyName,
    context,
    sequenceNumber,
  });
}

/**
 * Generiert einen sprechenden Display-Namen für ein Foto.
 */
export function generatePhotoDisplayName(companyName: string, photoContext: string, sequenceNumber: number): string {
  const context = mapPhotoContextToEntityContext(photoContext || 'allgemein');
  return generateEntityName({
    companyName,
    context,
    sequenceNumber,
  });
}

// ============================================
// TASK QUERIES
// ============================================
export async function getAllTasks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).orderBy(asc(tasks.dueDate));
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result[0];
}

export async function getTasksByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.projectId, projectId)).orderBy(asc(tasks.dueDate));
}

export async function getTasksByAssignedUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.assignedToId, userId)).orderBy(asc(tasks.dueDate));
}

export async function getOverdueTasks() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db.select().from(tasks)
    .where(and(
      lte(tasks.dueDate, now),
      or(eq(tasks.status, 'offen'), eq(tasks.status, 'in_bearbeitung'))
    ))
    .orderBy(asc(tasks.dueDate));
}

// Überfällige Aufgaben mit Eskalationsstufen (gelb/orange/rot)
export async function getOverdueTasksWithEscalation() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const overdueTasks = await db.select().from(tasks)
    .where(and(
      lte(tasks.dueDate, now),
      or(eq(tasks.status, 'offen'), eq(tasks.status, 'in_bearbeitung'))
    ))
    .orderBy(asc(tasks.dueDate));
  
  return overdueTasks.map(task => {
    const dueDate = task.dueDate ? new Date(task.dueDate) : now;
    const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    let escalation: 'gelb' | 'orange' | 'rot' = 'gelb';
    if (daysOverdue > 7) escalation = 'rot';
    else if (daysOverdue > 3) escalation = 'orange';
    return { ...task, daysOverdue, escalation };
  });
}

// Aufgaben nach Rolle des eingeloggten Benutzers
export async function getMyTasks(userId: number, userRole?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [
    or(eq(tasks.status, 'offen'), eq(tasks.status, 'in_bearbeitung'))
  ];
  
  // Aufgaben die dem Benutzer direkt zugewiesen sind ODER seiner Rolle
  const userConditions = [eq(tasks.assignedToId, userId)];
  if (userRole) {
    userConditions.push(eq(tasks.assignedRole, userRole));
  }
  
  return db.select().from(tasks)
    .where(and(
      ...conditions,
      or(...userConditions)
    ))
    .orderBy(asc(tasks.dueDate));
}

export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(tasks).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateTask(id: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set(data).where(eq(tasks.id, id));
  return getTaskById(id);
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tasks).where(eq(tasks.id, id));
}

// ============================================
// ACTIVITY LOG QUERIES
// ============================================
export async function getRecentActivityLogs(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt)).limit(limit);
}

export async function getActivityLogsByEntityType(entityType: string, entityId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (entityId) {
    return db.select().from(activityLogs)
      .where(and(
        eq(activityLogs.entityType, entityType as any),
        eq(activityLogs.entityId, entityId)
      ))
      .orderBy(desc(activityLogs.createdAt));
  }
  
  return db.select().from(activityLogs)
    .where(eq(activityLogs.entityType, entityType as any))
    .orderBy(desc(activityLogs.createdAt));
}

export async function createActivityLog(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(activityLogs).values(data);
  return { id: result[0].insertId, ...data };
}

// ============================================
// CONSTRUCTION SITE LOG QUERIES
// ============================================
export async function getConstructionSiteLogs(constructionSiteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(constructionSiteLogs)
    .where(eq(constructionSiteLogs.constructionSiteId, constructionSiteId))
    .orderBy(desc(constructionSiteLogs.loggedAt));
}

export async function createConstructionSiteLog(data: InsertConstructionSiteLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(constructionSiteLogs).values(data);
  return { id: result[0].insertId, ...data };
}

// ============================================
// TEAMLEITER CHECK QUERIES
// ============================================
export async function getTeamleiterChecksByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teamleiterChecks)
    .where(eq(teamleiterChecks.projectId, projectId))
    .orderBy(desc(teamleiterChecks.createdAt));
}

export async function createTeamleiterCheck(data: InsertTeamleiterCheck) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(teamleiterChecks).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateTeamleiterCheck(id: number, data: Partial<InsertTeamleiterCheck>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(teamleiterChecks).set(data).where(eq(teamleiterChecks.id, id));
}

// ============================================
// DASHBOARD WIDGET QUERIES
// ============================================
export async function getDashboardWidgetsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(dashboardWidgets)
    .where(eq(dashboardWidgets.userId, userId))
    .orderBy(asc(dashboardWidgets.position));
}

export async function createDashboardWidget(data: InsertDashboardWidget) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(dashboardWidgets).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateDashboardWidget(id: number, data: Partial<InsertDashboardWidget>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(dashboardWidgets).set(data).where(eq(dashboardWidgets.id, id));
}

export async function deleteDashboardWidget(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(dashboardWidgets).where(eq(dashboardWidgets.id, id));
}

// ============================================
// NOTIFICATION QUERIES
// ============================================
export async function getNotificationsByUserId(userId: number, unreadOnly: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  
  if (unreadOnly) {
    return db.select().from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ))
      .orderBy(desc(notifications.createdAt));
  }
  
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(notifications).values(data);
  return { id: result[0].insertId, ...data };
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));
}

// ============================================
// CUSTOMER PORTAL TOKEN QUERIES
// ============================================
export async function getCustomerPortalTokenByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customerPortalTokens)
    .where(eq(customerPortalTokens.token, token))
    .limit(1);
  return result[0];
}

export async function createCustomerPortalToken(data: InsertCustomerPortalToken) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customerPortalTokens).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateCustomerPortalTokenAccess(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customerPortalTokens)
    .set({ lastAccessedAt: new Date() })
    .where(eq(customerPortalTokens.id, id));
}

// ============================================
// CALENDAR EVENT QUERIES
// ============================================
export async function getCalendarEvents(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(calendarEvents)
    .where(and(
      gte(calendarEvents.startDate, startDate),
      lte(calendarEvents.endDate, endDate)
    ))
    .orderBy(asc(calendarEvents.startDate));
}

export async function getCalendarEventsByUserId(userId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  
  if (startDate && endDate) {
    return db.select().from(calendarEvents)
      .where(and(
        eq(calendarEvents.assignedToId, userId),
        gte(calendarEvents.startDate, startDate),
        lte(calendarEvents.endDate, endDate)
      ))
      .orderBy(asc(calendarEvents.startDate));
  }
  
  return db.select().from(calendarEvents)
    .where(eq(calendarEvents.assignedToId, userId))
    .orderBy(asc(calendarEvents.startDate));
}

export async function createCalendarEvent(data: InsertCalendarEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(calendarEvents).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateCalendarEvent(id: number, data: Partial<InsertCalendarEvent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(calendarEvents).set(data).where(eq(calendarEvents.id, id));
}

export async function deleteCalendarEvent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
}

// ============================================
// DASHBOARD KPI QUERIES
// ============================================
export async function getDashboardKPIs() {
  const db = await getDb();
  if (!db) return null;
  
  const [
    projectCount,
    activeConstructionSites,
    openOffers,
    pendingTasks,
    totalOffers,
    wonOffers,
    openInvoices,
    paidInvoices,
    overdueInvoices,
    activeWarranties,
    totalOrders,
    overdueTaskCount,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(projects),
    db.select({ count: sql<number>`count(*)` }).from(constructionSites).where(eq(constructionSites.status, 'aktiv')),
    db.select({ count: sql<number>`count(*)` }).from(offers).where(or(eq(offers.status, 'erstellt'), eq(offers.status, 'versendet'))),
    db.select({ count: sql<number>`count(*)` }).from(tasks).where(or(eq(tasks.status, 'offen'), eq(tasks.status, 'in_bearbeitung'))),
    db.select({ count: sql<number>`count(*)` }).from(offers),
    db.select({ count: sql<number>`count(*)` }).from(offers).where(eq(offers.status, 'angenommen')),
    db.select({ 
      count: sql<number>`count(*)`,
      total: sql<number>`COALESCE(SUM(${invoices.openAmount}), 0)` 
    }).from(invoices).where(or(eq(invoices.status, 'versendet'), eq(invoices.status, 'ueberfaellig'), eq(invoices.status, 'gemahnt'))),
    db.select({ 
      count: sql<number>`count(*)`,
      total: sql<number>`COALESCE(SUM(${invoices.grossTotal}), 0)` 
    }).from(invoices).where(eq(invoices.status, 'bezahlt')),
    db.select({ count: sql<number>`count(*)` }).from(invoices).where(eq(invoices.status, 'ueberfaellig')),
    db.select({ count: sql<number>`count(*)` }).from(warranties).where(eq(warranties.status, 'aktiv')),
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(tasks).where(
      and(
        or(eq(tasks.status, 'offen'), eq(tasks.status, 'in_bearbeitung')),
        lte(tasks.dueDate, new Date())
      )
    ),
  ]);

  const totalOffersCount = totalOffers[0]?.count || 0;
  const wonOffersCount = wonOffers[0]?.count || 0;
  const conversionRate = totalOffersCount > 0 ? Math.round((wonOffersCount / totalOffersCount) * 100) : 0;
  
  return {
    projekteGesamt: projectCount[0]?.count || 0,
    baustellenAktiv: activeConstructionSites[0]?.count || 0,
    angeboteOffen: openOffers[0]?.count || 0,
    aufgabenOffen: pendingTasks[0]?.count || 0,
    // Erweiterte KPIs
    angeboteGesamt: totalOffersCount,
    angeboteGewonnen: wonOffersCount,
    conversionRate,
    auftraegeGesamt: totalOrders[0]?.count || 0,
    rechnungenOffen: openInvoices[0]?.count || 0,
    rechnungenOffenBetrag: Number(openInvoices[0]?.total || 0),
    rechnungenBezahlt: paidInvoices[0]?.count || 0,
    umsatzBezahlt: Number(paidInvoices[0]?.total || 0),
    rechnungenUeberfaellig: overdueInvoices[0]?.count || 0,
    garantienAktiv: activeWarranties[0]?.count || 0,
    aufgabenUeberfaellig: overdueTaskCount[0]?.count || 0,
  };
}


// ============================================
// DOCUMENT QUERIES (Archiv)
// ============================================
export async function getAllDocuments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).orderBy(desc(documents.createdAt));
}

export async function getDocumentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(documents).where(eq(documents.id, id));
  return result[0] || null;
}

export async function getDocumentsByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents)
    .where(eq(documents.projectId, projectId))
    .orderBy(desc(documents.createdAt));
}

export async function getDocumentsByType(fileType: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents)
    .where(eq(documents.fileType, fileType as any))
    .orderBy(desc(documents.createdAt));
}

export async function searchDocuments(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents)
    .where(or(
      like(documents.name, `%${query}%`),
      like(documents.originalName, `%${query}%`),
      like(documents.category, `%${query}%`)
    ))
    .orderBy(desc(documents.createdAt));
}

export async function createDocument(data: InsertDocument) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(documents).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateDocument(id: number, data: Partial<InsertDocument>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(documents).set(data).where(eq(documents.id, id));
  return getDocumentById(id);
}

export async function deleteDocument(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(documents).where(eq(documents.id, id));
}

// ============================================
// TEXT BLOCK QUERIES (Textbausteine)
// ============================================
export async function getAllTextBlocks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(textBlocks)
    .where(eq(textBlocks.isActive, true))
    .orderBy(asc(textBlocks.category), asc(textBlocks.name));
}

export async function getTextBlockById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(textBlocks).where(eq(textBlocks.id, id));
  return result[0] || null;
}

export async function getTextBlocksByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(textBlocks)
    .where(and(
      eq(textBlocks.category, category as any),
      eq(textBlocks.isActive, true)
    ))
    .orderBy(desc(textBlocks.usageCount), asc(textBlocks.name));
}

export async function createTextBlock(data: InsertTextBlock) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(textBlocks).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateTextBlock(id: number, data: Partial<InsertTextBlock>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(textBlocks).set(data).where(eq(textBlocks.id, id));
  return getTextBlockById(id);
}

export async function incrementTextBlockUsage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(textBlocks)
    .set({ usageCount: sql`${textBlocks.usageCount} + 1` })
    .where(eq(textBlocks.id, id));
}

export async function deleteTextBlock(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Soft delete by setting isActive to false
  await db.update(textBlocks).set({ isActive: false }).where(eq(textBlocks.id, id));
}

// ============================================
// OFFER TEMPLATE QUERIES (Angebotsvorlagen)
// ============================================
export async function getAllOfferTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(offerTemplates)
    .where(eq(offerTemplates.isActive, true))
    .orderBy(desc(offerTemplates.usageCount), asc(offerTemplates.name));
}

export async function getOfferTemplateById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(offerTemplates).where(eq(offerTemplates.id, id));
  return result[0] || null;
}

export async function createOfferTemplate(data: InsertOfferTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(offerTemplates).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateOfferTemplate(id: number, data: Partial<InsertOfferTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(offerTemplates).set(data).where(eq(offerTemplates.id, id));
  return getOfferTemplateById(id);
}

export async function incrementOfferTemplateUsage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(offerTemplates)
    .set({ usageCount: sql`${offerTemplates.usageCount} + 1` })
    .where(eq(offerTemplates.id, id));
}

// ============================================
// EMAIL TEMPLATE QUERIES (E-Mail-Vorlagen)
// ============================================
export async function getAllEmailTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailTemplates)
    .where(eq(emailTemplates.isActive, true))
    .orderBy(asc(emailTemplates.category), asc(emailTemplates.name));
}

export async function getEmailTemplateById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id));
  return result[0] || null;
}

export async function getEmailTemplatesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailTemplates)
    .where(and(
      eq(emailTemplates.category, category as any),
      eq(emailTemplates.isActive, true)
    ))
    .orderBy(desc(emailTemplates.usageCount), asc(emailTemplates.name));
}

export async function createEmailTemplate(data: InsertEmailTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(emailTemplates).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateEmailTemplate(id: number, data: Partial<InsertEmailTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(emailTemplates).set(data).where(eq(emailTemplates.id, id));
  return getEmailTemplateById(id);
}

export async function incrementEmailTemplateUsage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(emailTemplates)
    .set({ usageCount: sql`${emailTemplates.usageCount} + 1` })
    .where(eq(emailTemplates.id, id));
}


// ============================================
// ANGEBOT WIZARD - AGGREGIERTE DATEN
// ============================================

/**
 * Lädt alle Unternehmen mit verschachtelten Kontakten, Projekten und Immobilien
 * für den Angebots-Wizard
 */
export async function getCompaniesForOfferWizard() {
  const db = await getDb();
  if (!db) return [];

  // Lade alle Unternehmen
  const allCompanies = await db.select().from(companies).orderBy(asc(companies.name));
  
  // Für jedes Unternehmen: Kontakte, Projekte und Immobilien laden
  const result = await Promise.all(allCompanies.map(async (company) => {
    // Kontakte laden
    const companyContacts = await db.select().from(contacts)
      .where(eq(contacts.companyId, company.id))
      .orderBy(asc(contacts.lastName));
    
    // Projekte laden
    const companyProjects = await db.select().from(projects)
      .where(eq(projects.companyId, company.id))
      .orderBy(desc(projects.createdAt));
    
    // Für jedes Projekt: Immobilien laden
    const projectsWithProperties = await Promise.all(companyProjects.map(async (project) => {
      const projectProperties = await db.select().from(properties)
        .where(eq(properties.projectId, project.id))
        .orderBy(asc(properties.name));
      
      return {
        ...project,
        immobilien: projectProperties.map(prop => ({
          id: String(prop.id),
          name: prop.name,
          adresse: prop.street || '',
          plz: prop.postalCode || '',
          ort: prop.city || '',
          fassadentyp: 'WDVS',
          besonderheiten: prop.accessNotes || '',
          // Vertiefte Datenübernahme: Sperrungen, Balkonbrüstungen, Sonderausstattung
          sperrungen: (prop.specialFeatures as string[] || []).filter((f: string) => 
            f.toLowerCase().includes('sperrung') || f.toLowerCase().includes('absperrung')
          ),
          balkonBruestung: (prop.specialFeatures as string[] || []).filter((f: string) => 
            f.toLowerCase().includes('balkon') || f.toLowerCase().includes('brüstung') || f.toLowerCase().includes('loggi')
          ),
          sonderausstattung: prop.specialFeatures || [],
          maxHoehe: Number(prop.totalCleanableArea || 0) > 0 ? undefined : undefined, // Wird aus Seiten berechnet
          // Seiten aus JSON-Feldern parsen (inkl. Wasseranschluss, Reinigungsmittel, Sperrungen)
          seiten: parseSeitenFromProperty(prop),
        })),
      };
    }));
    
    return {
      id: String(company.id),
      name: company.name,
      kuerzel: company.name.substring(0, 3).toUpperCase(),
      kontakte: companyContacts.map(c => ({
        id: String(c.id),
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
        position: c.position || '',
        email: c.email || '',
        telefon: c.phone || '',
      })),
      projekte: projectsWithProperties.map(p => ({
        id: String(p.id),
        nummer: p.projectNumber,
        name: p.name,
        phase: p.phase,
        entfernungKm: 50, // Default-Wert, da nicht im Schema
        immobilien: p.immobilien,
      })),
    };
  }));

  return result;
}

/**
 * Hilfsfunktion: Parst Seiten aus Property-Daten
 */
function parseSeitenFromProperty(prop: any) {
  const seiten: any[] = [];
  
  // Parse frontSide, backSide, leftGable, rightGable JSON-Felder
  const sideConfigs = [
    { key: 'frontSide', name: 'Frontseite' },
    { key: 'backSide', name: 'Rückseite' },
    { key: 'leftGable', name: 'Linker Giebel' },
    { key: 'rightGable', name: 'Rechter Giebel' },
  ];
  
  for (const config of sideConfigs) {
    const sideData = prop[config.key];
    if (sideData) {
      try {
        const parsed = typeof sideData === 'string' ? JSON.parse(sideData) : sideData;
        if (parsed && typeof parsed === 'object') {
          seiten.push({
            id: `${prop.id}-${config.key}`,
            name: config.name,
            flaeche: Number(parsed.area || 0),
            reinigungsfaehig: parsed.cleanable !== false,
            besonderheiten: parsed.notes || parsed.notCleanableReason || '',
            buehnentyp: parsed.scaffoldType || 'standard',
            fassadenart: parsed.facadeType || 'WDVS',
            // Vertiefte Datenübernahme: Sperrungen, Balkonbrüstungen, Wasseranschluss, Reinigungsmittel
            sperrungen: parsed.sperrungen || parsed.restrictions || [],
            zugaenglichkeit: parsed.accessibility || parsed.zugaenglichkeit || '',
            wasseranschluss: parsed.wasseranschluss ? {
              vorhanden: parsed.wasseranschluss.vorhanden ?? false,
              ort: parsed.wasseranschluss.ort || '',
              zoll: parsed.wasseranschluss.zoll || '',
            } : undefined,
            reinigungsmittel: parsed.reinigungsmittel || parsed.cleaningAgent || '',
            balkonBruestung: parsed.balkonBruestung || parsed.balconyRailing || '',
          });
        }
      } catch (e) {
        console.warn(`Failed to parse ${config.key}:`, e);
      }
    }
  }
  
  // Wenn Seiten gefunden wurden, diese zurückgeben
  if (seiten.length > 0) {
    return seiten;
  }
  
  // Wenn sidesData vorhanden, nutze das
  if (prop.sidesData) {
    try {
      const sidesData = typeof prop.sidesData === 'string' 
        ? JSON.parse(prop.sidesData) 
        : prop.sidesData;
      
      if (Array.isArray(sidesData)) {
        return sidesData.map((side: any, index: number) => ({
          id: `${prop.id}-${index}`,
          name: side.name || side.direction || `Seite ${index + 1}`,
          himmelsrichtung: side.direction || side.himmelsrichtung || '',
          flaeche: Number(side.area || side.flaeche || 0),
          reinigungsfaehig: side.cleanable !== false && side.reinigungsfaehig !== false,
          besonderheiten: side.notes || side.besonderheiten || '',
          buehnentyp: side.scaffoldType || side.buehnentyp || 'standard',
        }));
      }
    } catch (e) {
      console.warn('Failed to parse sidesData:', e);
    }
  }
  
  // Fallback: Erstelle Standardseiten basierend auf Gesamtfläche
  const totalArea = Number(prop.totalArea || 0);
  if (totalArea > 0) {
    return [
      {
        id: `${prop.id}-front`,
        name: 'Frontseite',
        flaeche: Math.round(totalArea * 0.35),
        reinigungsfaehig: true,
        besonderheiten: '',
        buehnentyp: 'standard',
      },
      {
        id: `${prop.id}-back`,
        name: 'Rückseite',
        flaeche: Math.round(totalArea * 0.35),
        reinigungsfaehig: true,
        besonderheiten: '',
        buehnentyp: 'standard',
      },
      {
        id: `${prop.id}-left`,
        name: 'Linker Giebel',
        flaeche: Math.round(totalArea * 0.15),
        reinigungsfaehig: true,
        besonderheiten: '',
        buehnentyp: 'standard',
      },
      {
        id: `${prop.id}-right`,
        name: 'Rechter Giebel',
        flaeche: Math.round(totalArea * 0.15),
        reinigungsfaehig: true,
        besonderheiten: '',
        buehnentyp: 'standard',
      },
    ];
  }
  
  return [];
}


// ============================================
// HUBSPOT SYNC QUERIES
// ============================================

/**
 * Importiert Unternehmen aus HubSpot (upsert basierend auf hubspotId)
 */
export async function importHubSpotCompanies(hubspotCompanies: {
  hubspotId: string;
  name: string;
  phone: string | null;
  city: string | null;
  country: string | null;
  website: string | null;
}[]): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let importedCount = 0;
  
  for (const company of hubspotCompanies) {
    try {
      // Check if company with hubspotId exists
      const existing = await db.select()
        .from(companies)
        .where(eq(companies.hubspotId, company.hubspotId))
        .limit(1);
      
      if (existing.length > 0) {
        // Update existing
        await db.update(companies)
          .set({
            name: company.name,
            phone: company.phone,
            city: company.city,
            country: company.country,
            website: company.website,
          })
          .where(eq(companies.hubspotId, company.hubspotId));
      } else {
        // Insert new
        await db.insert(companies).values({
          hubspotId: company.hubspotId,
          name: company.name,
          phone: company.phone,
          city: company.city,
          country: company.country,
          website: company.website,
          category: 'wohnungsgesellschaft',
        });
      }
      importedCount++;
    } catch (error) {
      console.error(`[HubSpot Import] Error importing company ${company.name}:`, error);
    }
  }
  
  return importedCount;
}

/**
 * Importiert Kontakte aus HubSpot (upsert basierend auf hubspotId)
 */
export async function importHubSpotContacts(hubspotContacts: {
  hubspotId: string;
  firstName: string | null;
  lastName: string;
  email: string | null;
  phone: string | null;
}[]): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let importedCount = 0;
  
  for (const contact of hubspotContacts) {
    try {
      // Check if contact with hubspotId exists
      const existing = await db.select()
        .from(contacts)
        .where(eq(contacts.hubspotId, contact.hubspotId))
        .limit(1);
      
      if (existing.length > 0) {
        // Update existing
        await db.update(contacts)
          .set({
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
          })
          .where(eq(contacts.hubspotId, contact.hubspotId));
      } else {
        // Insert new
        await db.insert(contacts).values({
          hubspotId: contact.hubspotId,
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          phone: contact.phone,
        });
      }
      importedCount++;
    } catch (error) {
      console.error(`[HubSpot Import] Error importing contact ${contact.lastName}:`, error);
    }
  }
  
  return importedCount;
}

/**
 * Holt Unternehmen mit HubSpot-ID
 */
export async function getCompanyByHubspotId(hubspotId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select()
    .from(companies)
    .where(eq(companies.hubspotId, hubspotId))
    .limit(1);
  return result[0];
}

/**
 * Holt Kontakt mit HubSpot-ID
 */
export async function getContactByHubspotId(hubspotId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select()
    .from(contacts)
    .where(eq(contacts.hubspotId, hubspotId))
    .limit(1);
  return result[0];
}

// ============================================
// OFFER VERSION QUERIES
// ============================================

/**
 * Erstellt eine neue Version eines Angebots
 */
export async function createOfferVersion(offerId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Hole aktuelles Angebot
  const currentOffer = await getOfferById(offerId);
  if (!currentOffer) throw new Error("Offer not found");
  
  // Ermittle nächste Versionsnummer
  const versions = await db.select({ version: offers.version })
    .from(offers)
    .where(eq(offers.offerNumber, currentOffer.offerNumber))
    .orderBy(desc(offers.version))
    .limit(1);
  
  const nextVersion = (versions[0]?.version || 1) + 1;
  
  // Markiere ALLE bisherigen Versionen als obsolet
  await db.update(offers)
    .set({ status: 'obsolet' })
    .where(
      and(
        eq(offers.offerNumber, currentOffer.offerNumber),
        not(eq(offers.status, 'angenommen')), // Angenommene Angebote nicht überschreiben
      )
    );
  
  // Erstelle neue Version mit aktualisiertem displayName
  const { id, createdAt, updatedAt, ...offerData } = currentOffer;
  
  // Auto-Benennung: Unternehmensnamen holen für neue Version
  let companyName = 'Unbekannt';
  if (currentOffer.companyId) {
    const company = await getCompanyById(currentOffer.companyId);
    if (company) companyName = company.name;
  }
  const newDisplayName = generateOfferDisplayName(currentOffer.offerNumber, companyName, nextVersion);
  
  const result = await db.insert(offers).values({
    ...offerData,
    version: nextVersion,
    displayName: newDisplayName,
    status: 'entwurf',
  });
  
  return result[0].insertId;
}

/**
 * Holt alle Versionen eines Angebots
 */
export async function getOfferVersions(offerNumber: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(offers)
    .where(eq(offers.offerNumber, offerNumber))
    .orderBy(desc(offers.version));
}

/**
 * Speichert ein vollständiges Angebot aus dem Wizard
 */
export async function saveOfferFromWizard(data: {
  projectId: number;
  companyId: number;
  contactId: number;
  totalArea: number;
  pricePerSqm: number;
  basePrice: number;
  discount: number;
  discountReason?: string;
  netTotal: number;
  vatAmount: number;
  grossTotal: number;
  scaffoldingDays: number;
  overnightStays: number;
  distanceKm: number;
  positions: unknown;
  textBlocks?: string[];
  customText?: string;
  validUntil: Date;
  createdById: number;
}): Promise<{ id: number; offerNumber: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const offerNumber = await generateOfferNumber();
  
  // Auto-Benennung: Unternehmensnamen holen
  let companyName = 'Unbekannt';
  if (data.companyId) {
    const company = await getCompanyById(data.companyId);
    if (company) companyName = company.name;
  }
  const displayName = generateOfferDisplayName(offerNumber, companyName, 1);
  
  const result = await db.insert(offers).values({
    offerNumber,
    displayName,
    version: 1,
    projectId: data.projectId,
    companyId: data.companyId,
    contactId: data.contactId,
    status: 'entwurf',
    totalArea: String(data.totalArea),
    pricePerSqm: String(data.pricePerSqm),
    basePrice: String(data.basePrice),
    discount: String(data.discount),
    discountReason: data.discountReason,
    netTotal: String(data.netTotal),
    vatRate: '19.00',
    vatAmount: String(data.vatAmount),
    grossTotal: String(data.grossTotal),
    scaffoldingDays: data.scaffoldingDays,
    overnightStays: data.overnightStays,
    distanceKm: data.distanceKm,
    positions: data.positions as any,
    textBlocks: data.textBlocks,
    customText: data.customText,
    validUntil: data.validUntil,
    createdById: data.createdById,
  });
  
  return {
    id: result[0].insertId,
    offerNumber,
  };
}


// ============================================
// DOCUMENT ARCHIVE QUERIES (Unternehmens-Archiv)
// ============================================

/**
 * Holt alle Dokumente für ein Unternehmen (zentrales Archiv)
 */
export async function getDocumentsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents)
    .where(eq(documents.companyId, companyId))
    .orderBy(desc(documents.createdAt));
}

/**
 * Holt alle Dokumente für ein Angebot
 */
export async function getDocumentsByOfferId(offerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents)
    .where(eq(documents.offerId, offerId))
    .orderBy(desc(documents.createdAt));
}

/**
 * Erstellt ein Dokument im Unternehmens-Archiv
 */
export async function createDocumentInArchive(data: {
  name: string;
  originalName: string;
  fileType: 'dokument' | 'bild' | 'video' | 'sonstiges';
  mimeType: string;
  fileSize: number;
  storageUrl: string;
  storageKey: string;
  category: 'angebot' | 'auftragsbestaetigung' | 'vertrag' | 'rechnung' | 'garantie' | 'abnahmeprotokoll' | 'protokoll' | 'foto' | 'sonstiges';
  companyId?: number;
  projectId?: number;
  offerId?: number;
  orderId?: number;
  invoiceId?: number;
  warrantyId?: number;
  constructionSiteId?: number;
  propertyId?: number;
  contactId?: number;
  uploadedBy?: string;
  description?: string;
  displayName?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(documents).values({
    name: data.name,
    displayName: data.displayName || null,
    originalName: data.originalName,
    fileType: data.fileType,
    mimeType: data.mimeType,
    fileSize: data.fileSize,
    s3Url: data.storageUrl,
    s3Key: data.storageKey,
    category: data.category as any,
    companyId: data.companyId || null,
    projectId: data.projectId || null,
    offerId: data.offerId || null,
    orderId: data.orderId || null,
    invoiceId: data.invoiceId || null,
    warrantyId: data.warrantyId || null,
    constructionSiteId: data.constructionSiteId || null,
    propertyId: data.propertyId || null,
    contactId: data.contactId || null,
    description: data.description || null,
  });
  
  return { id: result[0].insertId, ...data };
}

/**
 * Sucht Dokumente im Archiv mit mehreren Filtern
 */
export async function searchDocumentsInArchive(filters: {
  companyId?: number;
  projectId?: number;
  offerId?: number;
  category?: string;
  fileType?: string;
  query?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  
  if (filters.companyId) {
    conditions.push(eq(documents.companyId, filters.companyId));
  }
  if (filters.projectId) {
    conditions.push(eq(documents.projectId, filters.projectId));
  }
  if (filters.offerId) {
    conditions.push(eq(documents.offerId, filters.offerId));
  }
  if (filters.category) {
    conditions.push(eq(documents.category, filters.category as any));
  }
  if (filters.fileType) {
    conditions.push(eq(documents.fileType, filters.fileType as any));
  }
  if (filters.query) {
    conditions.push(or(
      like(documents.name, `%${filters.query}%`),
      like(documents.originalName, `%${filters.query}%`),
      like(documents.description, `%${filters.query}%`)
    ));
  }
  
  if (conditions.length === 0) {
    return db.select().from(documents).orderBy(desc(documents.createdAt)).limit(100);
  }
  
  return db.select().from(documents)
    .where(and(...conditions))
    .orderBy(desc(documents.createdAt));
}

// ============================================
// ORDER QUERIES (Aufträge)
// ============================================
import { 
  InsertOrder, orders,
  InsertWarranty, warranties,
  InsertAppointment, appointments,
  InsertInvoice, invoices,
  InsertPayment, payments,
  InsertBudget, budgets,
  InsertCustomerReport, customerReports,
  InsertTeamMember
} from "../drizzle/schema";

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.orderDate));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrdersByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.companyId, companyId)).orderBy(desc(orders.orderDate));
}

export async function getOrdersByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.status, status as any)).orderBy(desc(orders.orderDate));
}

export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateOrder(id: number, data: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set(data).where(eq(orders.id, id));
  return getOrderById(id);
}

export async function deleteOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(orders).where(eq(orders.id, id));
}

export async function generateOrderNumber() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const year = new Date().getFullYear();
  const prefix = `A-${year}-`;
  const result = await db.select({ orderNumber: orders.orderNumber })
    .from(orders)
    .where(like(orders.orderNumber, `${prefix}%`))
    .orderBy(desc(orders.orderNumber))
    .limit(1);
  let nextNumber = 1;
  if (result.length > 0) {
    const lastNumber = parseInt(result[0].orderNumber.split('-').pop() || '0');
    nextNumber = lastNumber + 1;
  }
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

// ============================================
// WARRANTY QUERIES (Garantien)
// ============================================
export async function getAllWarranties() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(warranties).orderBy(desc(warranties.createdAt));
}

export async function getWarrantyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(warranties).where(eq(warranties.id, id)).limit(1);
  return result[0];
}

export async function getWarrantiesByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(warranties).where(eq(warranties.companyId, companyId)).orderBy(desc(warranties.startDate));
}

export async function getWarrantiesByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(warranties).where(eq(warranties.status, status as any)).orderBy(desc(warranties.endDate));
}

export async function getActiveWarranties() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(warranties)
    .where(eq(warranties.status, 'aktiv'))
    .orderBy(desc(warranties.endDate));
}

export async function createWarranty(data: InsertWarranty) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(warranties).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateWarranty(id: number, data: Partial<InsertWarranty>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(warranties).set(data).where(eq(warranties.id, id));
  return getWarrantyById(id);
}

export async function generateWarrantyNumber() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const year = new Date().getFullYear();
  const prefix = `G-${year}-`;
  const result = await db.select({ warrantyNumber: warranties.warrantyNumber })
    .from(warranties)
    .where(like(warranties.warrantyNumber, `${prefix}%`))
    .orderBy(desc(warranties.warrantyNumber))
    .limit(1);
  let nextNumber = 1;
  if (result.length > 0) {
    const lastNumber = parseInt(result[0].warrantyNumber.split('-').pop() || '0');
    nextNumber = lastNumber + 1;
  }
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

// ============================================
// APPOINTMENT QUERIES (Termine)
// ============================================
export async function getAllAppointments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).orderBy(desc(appointments.confirmedDate));
}

export async function getAppointmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result[0];
}

export async function getAppointmentsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).where(eq(appointments.assignedToId, userId)).orderBy(desc(appointments.confirmedDate));
}

export async function getAppointmentsByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).where(eq(appointments.status, status as any)).orderBy(asc(appointments.confirmedDate));
}

export async function getUpcomingAppointments(days: number = 7) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);
  return db.select().from(appointments)
    .where(and(
      gte(appointments.confirmedDate, now),
      lte(appointments.confirmedDate, future)
    ))
    .orderBy(asc(appointments.confirmedDate));
}

export async function createAppointment(data: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(appointments).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateAppointment(id: number, data: Partial<InsertAppointment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(appointments).set(data).where(eq(appointments.id, id));
  return getAppointmentById(id);
}

export async function deleteAppointment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(appointments).where(eq(appointments.id, id));
}

// ============================================
// INVOICE QUERIES (Rechnungen)
// ============================================
export async function getAllInvoices() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).orderBy(desc(invoices.invoiceDate));
}

export async function getInvoiceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
  return result[0];
}

export async function getInvoicesByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.companyId, companyId)).orderBy(desc(invoices.invoiceDate));
}

export async function getInvoicesByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.status, status as any)).orderBy(desc(invoices.invoiceDate));
}

export async function getOverdueInvoices() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db.select().from(invoices)
    .where(and(
      eq(invoices.status, 'versendet'),
      lte(invoices.dueDate, now)
    ))
    .orderBy(asc(invoices.dueDate));
}

export async function createInvoice(data: InsertInvoice) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(invoices).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateInvoice(id: number, data: Partial<InsertInvoice>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(invoices).set(data).where(eq(invoices.id, id));
  return getInvoiceById(id);
}

export async function generateInvoiceNumber() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const year = new Date().getFullYear();
  const prefix = `R-${year}-`;
  const result = await db.select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .where(like(invoices.invoiceNumber, `${prefix}%`))
    .orderBy(desc(invoices.invoiceNumber))
    .limit(1);
  let nextNumber = 1;
  if (result.length > 0) {
    const lastNumber = parseInt(result[0].invoiceNumber.split('-').pop() || '0');
    nextNumber = lastNumber + 1;
  }
  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}

// ============================================
// PAYMENT QUERIES (Zahlungen)
// ============================================
export async function getAllPayments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).orderBy(desc(payments.paymentDate));
}

export async function getPaymentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  return result[0];
}

export async function getPaymentsByInvoiceId(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.invoiceId, invoiceId)).orderBy(desc(payments.paymentDate));
}

export async function getPaymentsByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.status, status as any)).orderBy(desc(payments.paymentDate));
}

export async function getUnmatchedPayments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments)
    .where(eq(payments.status, 'eingegangen'))
    .orderBy(desc(payments.paymentDate));
}

export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payments).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updatePayment(id: number, data: Partial<InsertPayment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(payments).set(data).where(eq(payments.id, id));
  return getPaymentById(id);
}

export async function generatePaymentNumber() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const year = new Date().getFullYear();
  const prefix = `Z-${year}-`;
  const result = await db.select({ paymentNumber: payments.paymentNumber })
    .from(payments)
    .where(like(payments.paymentNumber, `${prefix}%`))
    .orderBy(desc(payments.paymentNumber))
    .limit(1);
  let nextNumber = 1;
  if (result.length > 0) {
    const lastNumber = parseInt(result[0].paymentNumber.split('-').pop() || '0');
    nextNumber = lastNumber + 1;
  }
  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}

// ============================================
// BUDGET QUERIES (Budgets)
// ============================================
export async function getAllBudgets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(budgets).orderBy(desc(budgets.periodStart));
}

export async function getBudgetById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(budgets).where(eq(budgets.id, id)).limit(1);
  return result[0];
}

export async function getBudgetsByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(budgets).where(eq(budgets.projectId, projectId)).orderBy(desc(budgets.periodStart));
}

export async function getActiveBudgets() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(budgets)
    .where(eq(budgets.status, 'aktiv'))
    .orderBy(desc(budgets.periodStart));
}

export async function createBudget(data: InsertBudget) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(budgets).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateBudget(id: number, data: Partial<InsertBudget>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(budgets).set(data).where(eq(budgets.id, id));
  return getBudgetById(id);
}

export async function deleteBudget(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(budgets).where(eq(budgets.id, id));
}

// ============================================
// CUSTOMER REPORT QUERIES (Kundenmeldungen)
// ============================================
export async function getAllCustomerReports() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customerReports).orderBy(desc(customerReports.createdAt));
}

export async function getCustomerReportById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customerReports).where(eq(customerReports.id, id)).limit(1);
  return result[0];
}

export async function getCustomerReportsByCompanyId(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customerReports).where(eq(customerReports.companyId, companyId)).orderBy(desc(customerReports.createdAt));
}

export async function getCustomerReportsByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customerReports).where(eq(customerReports.status, status as any)).orderBy(desc(customerReports.createdAt));
}

export async function getOpenCustomerReports() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customerReports)
    .where(or(
      eq(customerReports.status, 'neu'),
      eq(customerReports.status, 'in_bearbeitung')
    ))
    .orderBy(desc(customerReports.priority), desc(customerReports.createdAt));
}

export async function createCustomerReport(data: InsertCustomerReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customerReports).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateCustomerReport(id: number, data: Partial<InsertCustomerReport>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customerReports).set(data).where(eq(customerReports.id, id));
  return getCustomerReportById(id);
}

export async function generateCustomerReportNumber() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const year = new Date().getFullYear();
  const prefix = `KM-${year}-`;
  const result = await db.select({ reportNumber: customerReports.reportNumber })
    .from(customerReports)
    .where(like(customerReports.reportNumber, `${prefix}%`))
    .orderBy(desc(customerReports.reportNumber))
    .limit(1);
  let nextNumber = 1;
  if (result.length > 0) {
    const lastNumber = parseInt(result[0].reportNumber.split('-').pop() || '0');
    nextNumber = lastNumber + 1;
  }
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

// ============================================
// TEAM MEMBER QUERIES (Teammitglieder)
// ============================================
export async function getAllTeamMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teamMembers).orderBy(asc(teamMembers.employeeNumber));
}

export async function getTeamMemberById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  return result[0];
}

export async function getTeamMemberByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teamMembers).where(eq(teamMembers.userId, userId)).limit(1);
  return result[0];
}

export async function getTeamMembersByDepartment(department: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teamMembers).where(eq(teamMembers.department, department as any)).orderBy(asc(teamMembers.employeeNumber));
}

export async function getActiveTeamMembers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teamMembers)
    .where(eq(teamMembers.status, 'aktiv'))
    .orderBy(asc(teamMembers.employeeNumber));
}

export async function createTeamMember(data: InsertTeamMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(teamMembers).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateTeamMember(id: number, data: Partial<InsertTeamMember>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(teamMembers).set(data).where(eq(teamMembers.id, id));
  return getTeamMemberById(id);
}

export async function deleteTeamMember(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(teamMembers).where(eq(teamMembers.id, id));
}

// ============================================
// EXTENDED PROJECT QUERIES (für Filter-Seiten)
// ============================================
export async function getOpenProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects)
    .where(or(
      eq(projects.phase, 'objektaufnahme'),
      eq(projects.phase, 'angebot_erstellt'),
      eq(projects.phase, 'angebot_versendet'),
      eq(projects.phase, 'nachfassen'),
      eq(projects.phase, 'auftrag_gewonnen'),
      eq(projects.phase, 'planung'),
      eq(projects.phase, 'vorbereitung')
    ))
    .orderBy(desc(projects.createdAt));
}

export async function getOverdueProjects() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db.select().from(projects)
    .where(and(
      lte(projects.endDate, now),
      or(
        eq(projects.phase, 'durchfuehrung'),
        eq(projects.phase, 'vorbereitung'),
        eq(projects.phase, 'planung')
      )
    ))
    .orderBy(asc(projects.endDate));
}

// ============================================
// EXTENDED CONSTRUCTION SITE QUERIES (für Filter-Seiten)
// ============================================
export async function getOpenConstructionSites() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(constructionSites)
    .where(or(
      eq(constructionSites.status, 'geplant'),
      eq(constructionSites.status, 'aktiv')
    ))
    .orderBy(asc(constructionSites.startDate));
}

export async function getOverdueConstructionSites() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db.select().from(constructionSites)
    .where(and(
      lte(constructionSites.endDate, now),
      or(
        eq(constructionSites.status, 'aktiv'),
        eq(constructionSites.status, 'pausiert')
      )
    ))
    .orderBy(asc(constructionSites.endDate));
}

// ============================================
// CROSS-ENTITY QUERIES (Verknüpfungs-Abfragen)
// ============================================

export async function getDocumentsByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.orderId, orderId)).orderBy(desc(documents.createdAt));
}

export async function getDocumentsByInvoiceId(invoiceId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.invoiceId, invoiceId)).orderBy(desc(documents.createdAt));
}

export async function getDocumentsByWarrantyId(warrantyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.warrantyId, warrantyId)).orderBy(desc(documents.createdAt));
}

export async function getDocumentsByConstructionSiteId(constructionSiteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.constructionSiteId, constructionSiteId)).orderBy(desc(documents.createdAt));
}

export async function getDocumentsByAppointmentId(appointmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(documents).where(eq(documents.appointmentId, appointmentId)).orderBy(desc(documents.createdAt));
}

export async function getOrdersByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.projectId, projectId)).orderBy(desc(orders.orderDate));
}

export async function getInvoicesByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.projectId, projectId)).orderBy(desc(invoices.invoiceDate));
}

export async function getInvoicesByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(invoices).where(eq(invoices.orderId, orderId)).orderBy(desc(invoices.invoiceDate));
}

export async function getWarrantiesByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(warranties).where(eq(warranties.projectId, projectId)).orderBy(desc(warranties.startDate));
}

export async function getWarrantiesByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(warranties).where(eq(warranties.orderId, orderId)).orderBy(desc(warranties.startDate));
}

export async function getTasksByConstructionSiteId(constructionSiteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.constructionSiteId, constructionSiteId)).orderBy(asc(tasks.dueDate));
}

export async function getAppointmentsByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).where(eq(appointments.projectId, projectId)).orderBy(desc(appointments.createdAt));
}

export async function getCustomerReportsByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customerReports).where(eq(customerReports.projectId, projectId)).orderBy(desc(customerReports.createdAt));
}

export async function searchDocumentsAdvanced(filters: {
  companyId?: number; projectId?: number; offerId?: number; orderId?: number;
  invoiceId?: number; warrantyId?: number; constructionSiteId?: number;
  propertyId?: number; contactId?: number; category?: string; fileType?: string;
  query?: string; dateFrom?: Date; dateTo?: Date;
}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (filters.companyId) conditions.push(eq(documents.companyId, filters.companyId));
  if (filters.projectId) conditions.push(eq(documents.projectId, filters.projectId));
  if (filters.offerId) conditions.push(eq(documents.offerId, filters.offerId));
  if (filters.orderId) conditions.push(eq(documents.orderId, filters.orderId));
  if (filters.invoiceId) conditions.push(eq(documents.invoiceId, filters.invoiceId));
  if (filters.warrantyId) conditions.push(eq(documents.warrantyId, filters.warrantyId));
  if (filters.constructionSiteId) conditions.push(eq(documents.constructionSiteId, filters.constructionSiteId));
  if (filters.propertyId) conditions.push(eq(documents.propertyId, filters.propertyId));
  if (filters.contactId) conditions.push(eq(documents.contactId, filters.contactId));
  if (filters.category) conditions.push(eq(documents.category, filters.category as any));
  if (filters.fileType) conditions.push(eq(documents.fileType, filters.fileType as any));
  if (filters.query) {
    conditions.push(or(like(documents.name, `%${filters.query}%`), like(documents.originalName, `%${filters.query}%`), like(documents.description, `%${filters.query}%`)));
  }
  if (filters.dateFrom) conditions.push(gte(documents.createdAt, filters.dateFrom));
  if (filters.dateTo) conditions.push(lte(documents.createdAt, filters.dateTo));
  if (conditions.length === 0) return db.select().from(documents).orderBy(desc(documents.createdAt)).limit(200);
  return db.select().from(documents).where(and(...conditions)).orderBy(desc(documents.createdAt)).limit(200);
}

export async function getProjectWithRelations(projectId: number) {
  const [project, projectOffers, projectOrders, projectInvoices, projectWarranties, projectSites, projectTasks, projectDocs, projectProperties, projectAppointments] = await Promise.all([
    getProjectById(projectId), getOffersByProjectId(projectId), getOrdersByProjectId(projectId),
    getInvoicesByProjectId(projectId), getWarrantiesByProjectId(projectId),
    getConstructionSitesByProjectId(projectId), getTasksByProjectId(projectId),
    getDocumentsByProjectId(projectId), getPropertiesByProjectId(projectId),
    getAppointmentsByProjectId(projectId),
  ]);
  if (!project) return null;
  return { ...project, offers: projectOffers, orders: projectOrders, invoices: projectInvoices, warranties: projectWarranties, constructionSites: projectSites, tasks: projectTasks, documents: projectDocs, properties: projectProperties, appointments: projectAppointments };
}

export async function getOrderWithRelations(orderId: number) {
  const [order, orderInvoices, orderWarranties, orderDocs] = await Promise.all([
    getOrderById(orderId), getInvoicesByOrderId(orderId), getWarrantiesByOrderId(orderId), getDocumentsByOrderId(orderId),
  ]);
  if (!order) return null;
  const [offer, project, company, sites] = await Promise.all([
    order.offerId ? getOfferById(order.offerId) : null, order.projectId ? getProjectById(order.projectId) : null,
    order.companyId ? getCompanyById(order.companyId) : null, order.projectId ? getConstructionSitesByProjectId(order.projectId) : [],
  ]);
  return { ...order, offer, project, company, invoices: orderInvoices, warranties: orderWarranties, documents: orderDocs, constructionSites: sites };
}

export async function getInvoiceWithRelations(invoiceId: number) {
  const [invoice, invoiceDocs] = await Promise.all([getInvoiceById(invoiceId), getDocumentsByInvoiceId(invoiceId)]);
  if (!invoice) return null;
  const [order, project, company, invoicePayments] = await Promise.all([
    invoice.orderId ? getOrderById(invoice.orderId) : null, invoice.projectId ? getProjectById(invoice.projectId) : null,
    invoice.companyId ? getCompanyById(invoice.companyId) : null, getPaymentsByInvoiceId(invoiceId),
  ]);
  return { ...invoice, order, project, company, payments: invoicePayments, documents: invoiceDocs };
}

export async function getWarrantyWithRelations(warrantyId: number) {
  const [warranty, warrantyDocs] = await Promise.all([getWarrantyById(warrantyId), getDocumentsByWarrantyId(warrantyId)]);
  if (!warranty) return null;
  const [order, project, company] = await Promise.all([
    warranty.orderId ? getOrderById(warranty.orderId) : null, warranty.projectId ? getProjectById(warranty.projectId) : null,
    warranty.companyId ? getCompanyById(warranty.companyId) : null,
  ]);
  return { ...warranty, order, project, company, documents: warrantyDocs };
}


// ============================================
// PHOTOS (Foto-Verwaltung)
// ============================================

export async function createPhoto(data: InsertPhoto) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  const result = await database.insert(photos).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function getPhotoById(id: number) {
  const database = await getDb();
  if (!database) return null;
  const rows = await database.select().from(photos).where(eq(photos.id, id));
  return rows[0] ?? null;
}

export async function getPhotosByPropertyId(propertyId: number) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(photos).where(eq(photos.propertyId, propertyId)).orderBy(photos.sortOrder);
}

export async function getPhotosByConstructionSiteId(constructionSiteId: number) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(photos).where(eq(photos.constructionSiteId, constructionSiteId)).orderBy(photos.sortOrder);
}

export async function getPhotosByProjectId(projectId: number) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(photos).where(eq(photos.projectId, projectId)).orderBy(photos.sortOrder);
}

export async function getPhotosByLogEntryId(logEntryId: number) {
  const database = await getDb();
  if (!database) return [];
  return database.select().from(photos).where(eq(photos.logEntryId, logEntryId)).orderBy(photos.sortOrder);
}

export async function getPhotosByContext(context: string, entityId?: number) {
  const database = await getDb();
  if (!database) return [];
  const conditions = [eq(photos.context, context as any)];
  if (entityId) {
    conditions.push(
      or(
        eq(photos.propertyId, entityId),
        eq(photos.constructionSiteId, entityId),
        eq(photos.projectId, entityId)
      )!
    );
  }
  return database.select().from(photos).where(and(...conditions)).orderBy(photos.sortOrder);
}

export async function updatePhoto(id: number, data: Partial<InsertPhoto>) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  await database.update(photos).set(data).where(eq(photos.id, id));
}

export async function deletePhoto(id: number) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  await database.delete(photos).where(eq(photos.id, id));
}

export async function getPhotoCount(filters: {
  propertyId?: number;
  constructionSiteId?: number;
  projectId?: number;
  context?: string;
}) {
  const database = await getDb();
  if (!database) return 0;
  const conditions = [];
  if (filters.propertyId) conditions.push(eq(photos.propertyId, filters.propertyId));
  if (filters.constructionSiteId) conditions.push(eq(photos.constructionSiteId, filters.constructionSiteId));
  if (filters.projectId) conditions.push(eq(photos.projectId, filters.projectId));
  if (filters.context) conditions.push(eq(photos.context, filters.context as any));
  const rows = await database.select({ count: sql<number>`COUNT(*)` }).from(photos).where(conditions.length > 0 ? and(...conditions) : undefined);
  return rows[0]?.count ?? 0;
}


// ============================================
// VORBEREITUNGSAUFGABEN-BOARD
// ============================================
export async function getPreparationBoardTasks(
  constructionSiteId?: number,
  responsibleParty?: "auftraggeber" | "auftragnehmer"
) {
  const database = await getDb();
  if (!database) return [];
  
  const conditions = [];
  
  // Only tasks that belong to a construction site (= Vorbereitungsaufgaben)
  conditions.push(isNotNull(tasks.constructionSiteId));
  
  if (constructionSiteId) {
    conditions.push(eq(tasks.constructionSiteId, constructionSiteId));
  }
  
  if (responsibleParty) {
    conditions.push(eq(tasks.responsibleParty, responsibleParty));
  }
  
  // Exclude cancelled tasks
  conditions.push(
    or(eq(tasks.status, 'offen'), eq(tasks.status, 'in_bearbeitung'), eq(tasks.status, 'erledigt'))!
  );
  
  const result = await database
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      assignedRole: tasks.assignedRole,
      responsibleParty: tasks.responsibleParty,
      completedAt: tasks.completedAt,
      createdAt: tasks.createdAt,
      constructionSiteId: tasks.constructionSiteId,
      projectId: tasks.projectId,
      // Join construction site info
      siteName: constructionSites.name,
      siteNumber: constructionSites.siteNumber,
      siteStatus: constructionSites.status,
      siteStartDate: constructionSites.startDate,
      // Join project info
      projectName: projects.name,
    })
    .from(tasks)
    .leftJoin(constructionSites, eq(tasks.constructionSiteId, constructionSites.id))
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(...conditions))
    .orderBy(asc(tasks.dueDate));
  
  return result;
}


// ============================================
// TASK COMMENTS (Aufgaben-Kommentare)
// ============================================
export async function getTaskComments(taskId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(taskComments)
    .where(eq(taskComments.taskId, taskId))
    .orderBy(desc(taskComments.createdAt));
}

export async function addTaskComment(data: {
  taskId: number;
  userId: number;
  userName: string;
  text: string;
  attachmentUrls?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(taskComments).values({
    taskId: data.taskId,
    userId: data.userId,
    userName: data.userName,
    text: data.text,
    attachmentUrls: data.attachmentUrls ?? null,
  });
  return result.insertId;
}

export async function getTaskWithComments(taskId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
  if (!task) return null;
  
  const comments = await db.select().from(taskComments)
    .where(eq(taskComments.taskId, taskId))
    .orderBy(asc(taskComments.createdAt));
  
  return { ...task, comments };
}


// ============================================
// ARCHIVE OVERVIEW - Aggregiert ALLE Datenquellen
// ============================================
import { dunningEntries } from "../drizzle/schema";

/**
 * Aggregierter Archiv-Überblick: Sammelt ALLE Datenquellen in einer einheitlichen Liste.
 * Quellen: documents, photos, offers (pdfUrl), invoices (pdfUrl), warranties (certificateUrl), dunningEntries (pdfUrl)
 */
export async function getArchiveOverview(filters?: {
  companyId?: number; projectId?: number; constructionSiteId?: number;
  propertyId?: number; contactId?: number; offerId?: number; orderId?: number;
  category?: string; fileType?: string; query?: string;
  dateFrom?: Date; dateTo?: Date; source?: string;
}) {
  const db = await getDb();
  if (!db) return { items: [], stats: { total: 0, documents: 0, photos: 0, offerPdfs: 0, invoicePdfs: 0, warrantyPdfs: 0, dunningPdfs: 0, autoArchived: 0, manualUploaded: 0 } };

  // 1. Documents (already in archive)
  const docConditions: any[] = [];
  if (filters?.companyId) docConditions.push(eq(documents.companyId, filters.companyId));
  if (filters?.projectId) docConditions.push(eq(documents.projectId, filters.projectId));
  if (filters?.constructionSiteId) docConditions.push(eq(documents.constructionSiteId, filters.constructionSiteId));
  if (filters?.propertyId) docConditions.push(eq(documents.propertyId, filters.propertyId));
  if (filters?.contactId) docConditions.push(eq(documents.contactId, filters.contactId));
  if (filters?.offerId) docConditions.push(eq(documents.offerId, filters.offerId));
  if (filters?.orderId) docConditions.push(eq(documents.orderId, filters.orderId));
  if (filters?.category) docConditions.push(eq(documents.category, filters.category as any));
  if (filters?.fileType) docConditions.push(eq(documents.fileType, filters.fileType as any));
  if (filters?.query) docConditions.push(or(like(documents.name, `%${filters.query}%`), like(documents.originalName, `%${filters.query}%`), like(documents.description, `%${filters.query}%`)));
  if (filters?.dateFrom) docConditions.push(gte(documents.createdAt, filters.dateFrom));
  if (filters?.dateTo) docConditions.push(lte(documents.createdAt, filters.dateTo));

  const allDocs = docConditions.length > 0
    ? await db.select().from(documents).where(and(...docConditions)).orderBy(desc(documents.createdAt)).limit(500)
    : await db.select().from(documents).orderBy(desc(documents.createdAt)).limit(500);

  // 2. Photos
  const shouldIncludePhotos = !filters?.source || filters.source === 'alle' || filters.source === 'fotos';
  let allPhotos: any[] = [];
  if (shouldIncludePhotos) {
    const photoConditions: any[] = [];
    if (filters?.projectId) photoConditions.push(eq(photos.projectId, filters.projectId));
    if (filters?.constructionSiteId) photoConditions.push(eq(photos.constructionSiteId, filters.constructionSiteId));
    if (filters?.propertyId) photoConditions.push(eq(photos.propertyId, filters.propertyId));
    if (filters?.query) photoConditions.push(or(like(photos.filename, `%${filters.query}%`), like(photos.description, `%${filters.query}%`)));
    if (filters?.dateFrom) photoConditions.push(gte(photos.createdAt, filters.dateFrom));
    if (filters?.dateTo) photoConditions.push(lte(photos.createdAt, filters.dateTo));
    allPhotos = photoConditions.length > 0
      ? await db.select().from(photos).where(and(...photoConditions)).orderBy(desc(photos.createdAt)).limit(500)
      : await db.select().from(photos).orderBy(desc(photos.createdAt)).limit(500);
  }

  // 3. Offers with PDF
  const shouldIncludeOffers = !filters?.source || filters.source === 'alle' || filters.source === 'angebote';
  let offerPdfs: any[] = [];
  if (shouldIncludeOffers) {
    const offerConds: any[] = [isNotNull(offers.pdfUrl)];
    if (filters?.companyId) offerConds.push(eq(offers.companyId, filters.companyId));
    if (filters?.projectId) offerConds.push(eq(offers.projectId, filters.projectId));
    if (filters?.query) offerConds.push(like(offers.offerNumber, `%${filters.query}%`));
    if (filters?.dateFrom) offerConds.push(gte(offers.createdAt, filters.dateFrom));
    if (filters?.dateTo) offerConds.push(lte(offers.createdAt, filters.dateTo));
    offerPdfs = await db.select().from(offers).where(and(...offerConds)).orderBy(desc(offers.createdAt)).limit(200);
  }

  // 4. Invoices with PDF
  const shouldIncludeInvoices = !filters?.source || filters.source === 'alle' || filters.source === 'rechnungen';
  let invoicePdfs: any[] = [];
  if (shouldIncludeInvoices) {
    const invConds: any[] = [isNotNull(invoices.pdfUrl)];
    if (filters?.companyId) invConds.push(eq(invoices.companyId, filters.companyId));
    if (filters?.projectId) invConds.push(eq(invoices.projectId, filters.projectId));
    if (filters?.query) invConds.push(like(invoices.invoiceNumber, `%${filters.query}%`));
    if (filters?.dateFrom) invConds.push(gte(invoices.createdAt, filters.dateFrom));
    if (filters?.dateTo) invConds.push(lte(invoices.createdAt, filters.dateTo));
    invoicePdfs = await db.select().from(invoices).where(and(...invConds)).orderBy(desc(invoices.createdAt)).limit(200);
  }

  // 5. Warranties with certificate
  const shouldIncludeWarranties = !filters?.source || filters.source === 'alle' || filters.source === 'garantien';
  let warrantyCerts: any[] = [];
  if (shouldIncludeWarranties) {
    const warConds: any[] = [isNotNull(warranties.certificateUrl)];
    if (filters?.companyId) warConds.push(eq(warranties.companyId, filters.companyId));
    if (filters?.projectId) warConds.push(eq(warranties.projectId, filters.projectId));
    if (filters?.query) warConds.push(like(warranties.warrantyNumber, `%${filters.query}%`));
    warrantyCerts = await db.select().from(warranties).where(and(...warConds)).orderBy(desc(warranties.createdAt)).limit(200);
  }

  // 6. Dunning entries with PDF
  const shouldIncludeDunning = !filters?.source || filters.source === 'alle' || filters.source === 'mahnungen';
  let dunningPdfs: any[] = [];
  if (shouldIncludeDunning) {
    dunningPdfs = await db.select().from(dunningEntries).where(isNotNull(dunningEntries.pdfUrl)).orderBy(desc(dunningEntries.sentAt)).limit(200);
  }

  // Normalize all into unified archive items
  type ArchiveItem = {
    id: string; source: string; name: string; fileType: string; category: string;
    url: string; mimeType: string; fileSize: number | null; createdAt: Date | null;
    projectId: number | null; companyId: number | null; constructionSiteId: number | null;
    propertyId: number | null; offerId: number | null; orderId: number | null;
    invoiceId: number | null; warrantyId: number | null; contactId: number | null;
    description: string | null; thumbnailUrl: string | null; autoArchived: boolean;
  };

  const items: ArchiveItem[] = [];

  // Documents → direct mapping
  for (const doc of allDocs) {
    items.push({
      id: `doc-${doc.id}`, source: 'dokument', name: doc.name, fileType: doc.fileType || 'sonstiges',
      category: doc.category || 'sonstiges', url: doc.s3Url, mimeType: doc.mimeType || 'application/octet-stream',
      fileSize: doc.fileSize, createdAt: doc.createdAt,
      projectId: doc.projectId, companyId: doc.companyId,
      constructionSiteId: doc.constructionSiteId, propertyId: doc.propertyId,
      offerId: doc.offerId, orderId: doc.orderId,
      invoiceId: doc.invoiceId, warrantyId: doc.warrantyId,
      contactId: doc.contactId, description: doc.description,
      thumbnailUrl: null, autoArchived: doc.description?.includes('[Auto-Archiv]') || false,
    });
  }

  // Photos → normalized (skip if already archived in documents)
  for (const photo of allPhotos) {
    const alreadyArchived = allDocs.some(d => d.s3Url === photo.url);
    if (alreadyArchived) continue;
    items.push({
      id: `photo-${photo.id}`, source: 'foto', name: photo.filename || photo.originalFilename || 'Foto',
      fileType: 'bild', category: 'foto', url: photo.url, mimeType: photo.mimeType || 'image/jpeg',
      fileSize: photo.fileSize, createdAt: photo.createdAt,
      projectId: photo.projectId, companyId: null,
      constructionSiteId: photo.constructionSiteId, propertyId: photo.propertyId,
      offerId: null, orderId: null, invoiceId: null, warrantyId: null,
      contactId: null, description: photo.description,
      thumbnailUrl: photo.thumbnailUrl, autoArchived: false,
    });
  }

  // Offers with PDF → normalized (skip if already archived)
  for (const offer of offerPdfs) {
    const alreadyArchived = allDocs.some(d => d.offerId === offer.id && d.category === 'angebot');
    if (alreadyArchived) continue;
    items.push({
      id: `offer-${offer.id}`, source: 'angebot', name: `Angebot ${offer.offerNumber}`,
      fileType: 'dokument', category: 'angebot', url: offer.pdfUrl!, mimeType: 'application/pdf',
      fileSize: null, createdAt: offer.createdAt,
      projectId: offer.projectId, companyId: offer.companyId,
      constructionSiteId: null, propertyId: null,
      offerId: offer.id, orderId: null, invoiceId: null, warrantyId: null,
      contactId: null, description: `Angebot ${offer.offerNumber} – ${offer.title || ''}`,
      thumbnailUrl: null, autoArchived: false,
    });
  }

  // Invoices with PDF → normalized (skip if already archived)
  for (const invoice of invoicePdfs) {
    const alreadyArchived = allDocs.some(d => d.invoiceId === invoice.id && d.category === 'rechnung');
    if (alreadyArchived) continue;
    items.push({
      id: `invoice-${invoice.id}`, source: 'rechnung', name: `Rechnung ${invoice.invoiceNumber}`,
      fileType: 'dokument', category: 'rechnung', url: invoice.pdfUrl!, mimeType: 'application/pdf',
      fileSize: null, createdAt: invoice.createdAt,
      projectId: invoice.projectId, companyId: invoice.companyId,
      constructionSiteId: null, propertyId: null,
      offerId: null, orderId: invoice.orderId, invoiceId: invoice.id, warrantyId: null,
      contactId: null, description: `Rechnung ${invoice.invoiceNumber}`,
      thumbnailUrl: null, autoArchived: false,
    });
  }

  // Warranties with certificate → normalized (skip if already archived)
  for (const warranty of warrantyCerts) {
    const alreadyArchived = allDocs.some(d => d.warrantyId === warranty.id && d.category === 'garantie');
    if (alreadyArchived) continue;
    items.push({
      id: `warranty-${warranty.id}`, source: 'garantie', name: `Garantie ${warranty.warrantyNumber}`,
      fileType: 'dokument', category: 'garantie', url: warranty.certificateUrl!, mimeType: 'application/pdf',
      fileSize: null, createdAt: warranty.createdAt,
      projectId: warranty.projectId, companyId: warranty.companyId,
      constructionSiteId: null, propertyId: warranty.propertyId,
      offerId: null, orderId: warranty.orderId, invoiceId: null, warrantyId: warranty.id,
      contactId: null, description: `Garantie ${warranty.warrantyNumber} (${warranty.warrantyType})`,
      thumbnailUrl: null, autoArchived: false,
    });
  }

  // Dunning entries with PDF → normalized
  for (const dunning of dunningPdfs) {
    items.push({
      id: `dunning-${dunning.id}`, source: 'mahnung', name: `Mahnung Stufe ${dunning.level}`,
      fileType: 'dokument', category: 'sonstiges', url: dunning.pdfUrl!, mimeType: 'application/pdf',
      fileSize: null, createdAt: dunning.sentAt,
      projectId: null, companyId: null,
      constructionSiteId: null, propertyId: null,
      offerId: null, orderId: null, invoiceId: dunning.invoiceId, warrantyId: null,
      contactId: null, description: `Mahnung Stufe ${dunning.level}`,
      thumbnailUrl: null, autoArchived: false,
    });
  }

  // Sort by date descending
  items.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const stats = {
    total: items.length,
    documents: allDocs.length,
    photos: allPhotos.filter(p => !allDocs.some(d => d.s3Url === p.url)).length,
    offerPdfs: offerPdfs.filter(o => !allDocs.some(d => d.offerId === o.id && d.category === 'angebot')).length,
    invoicePdfs: invoicePdfs.filter(i => !allDocs.some(d => d.invoiceId === i.id && d.category === 'rechnung')).length,
    warrantyPdfs: warrantyCerts.filter(w => !allDocs.some(d => d.warrantyId === w.id && d.category === 'garantie')).length,
    dunningPdfs: dunningPdfs.length,
    autoArchived: allDocs.filter(d => d.description?.includes('[Auto-Archiv]')).length,
    manualUploaded: allDocs.filter(d => !d.description?.includes('[Auto-Archiv]')).length,
  };

  return { items, stats };
}

/**
 * Auto-Archivierung: Erstellt einen documents-Eintrag für ein generiertes PDF/Foto
 */
export async function autoArchiveDocument(data: {
  name: string;
  originalName: string;
  fileType: 'dokument' | 'bild' | 'video' | 'sonstiges';
  mimeType: string;
  fileSize?: number;
  storageUrl: string;
  storageKey: string;
  category: string;
  companyId?: number;
  projectId?: number;
  offerId?: number;
  orderId?: number;
  invoiceId?: number;
  warrantyId?: number;
  constructionSiteId?: number;
  propertyId?: number;
  contactId?: number;
  description?: string;
}) {
  return createDocumentInArchive({
    ...data,
    fileSize: data.fileSize || 0,
    category: data.category as any,
    description: `[Auto-Archiv] ${data.description || data.name}`,
  });
}


// ============================================
// TOOLTIP FEEDBACK HELPERS
// ============================================

/**
 * Upsert: Bewertung speichern oder aktualisieren.
 * Ein User kann pro helpTextKey genau eine Bewertung abgeben.
 */
export async function upsertTooltipFeedback(data: {
  helpTextKey: string;
  userId: number;
  rating: "helpful" | "not_helpful";
  comment?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Check if feedback already exists
  const existing = await db
    .select()
    .from(tooltipFeedback)
    .where(
      and(
        eq(tooltipFeedback.helpTextKey, data.helpTextKey),
        eq(tooltipFeedback.userId, data.userId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing feedback
    await db
      .update(tooltipFeedback)
      .set({
        rating: data.rating,
        comment: data.comment ?? null,
      })
      .where(eq(tooltipFeedback.id, existing[0].id));
    return { ...existing[0], rating: data.rating, comment: data.comment ?? null, updated: true };
  }

  // Insert new feedback
  const [result] = await db.insert(tooltipFeedback).values({
    helpTextKey: data.helpTextKey,
    userId: data.userId,
    rating: data.rating,
    comment: data.comment ?? null,
  });
  return { id: result.insertId, ...data, updated: false };
}

/**
 * Eigene Bewertungen eines Users abrufen (für UI-State).
 */
export async function getMyTooltipFeedback(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      helpTextKey: tooltipFeedback.helpTextKey,
      rating: tooltipFeedback.rating,
    })
    .from(tooltipFeedback)
    .where(eq(tooltipFeedback.userId, userId));
}

/**
 * Aggregierte Statistiken pro helpTextKey (für Admin).
 */
export async function getTooltipFeedbackStats() {
  const db = await getDb();
  if (!db) return [];
  const allFeedback = await db
    .select({
      helpTextKey: tooltipFeedback.helpTextKey,
      rating: tooltipFeedback.rating,
    })
    .from(tooltipFeedback);

  // Aggregate in JS (simpler than complex SQL for this small dataset)
  const statsMap = new Map<string, { helpful: number; not_helpful: number; total: number }>();
  for (const row of allFeedback) {
    const existing = statsMap.get(row.helpTextKey) || { helpful: 0, not_helpful: 0, total: 0 };
    if (row.rating === "helpful") existing.helpful++;
    else existing.not_helpful++;
    existing.total++;
    statsMap.set(row.helpTextKey, existing);
  }

  return Array.from(statsMap.entries()).map(([key, stats]) => ({
    helpTextKey: key,
    ...stats,
    helpfulPercent: stats.total > 0 ? Math.round((stats.helpful / stats.total) * 100) : 0,
  }));
}


// ============================================
// GATE PHOTOS
// ============================================

export async function createGatePhoto(data: {
  constructionSiteId: number;
  gateType: "vorher" | "nachher";
  photoUrl: string;
  fileKey: string;
  fileName: string;
  caption?: string;
  uploadedById: number;
  uploadedByName?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(gatePhotos).values(data);
  return { id: result.insertId, ...data };
}

export async function getGatePhotos(constructionSiteId: number, gateType?: "vorher" | "nachher") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  if (gateType) {
    return db.select().from(gatePhotos)
      .where(and(
        eq(gatePhotos.constructionSiteId, constructionSiteId),
        eq(gatePhotos.gateType, gateType)
      ))
      .orderBy(gatePhotos.createdAt);
  }
  return db.select().from(gatePhotos)
    .where(eq(gatePhotos.constructionSiteId, constructionSiteId))
    .orderBy(gatePhotos.createdAt);
}

export async function deleteGatePhoto(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(gatePhotos).where(eq(gatePhotos.id, id));
}

export async function getGatePhotoCount(constructionSiteId: number, gateType: "vorher" | "nachher") {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const photos = await db.select({ id: gatePhotos.id }).from(gatePhotos)
    .where(and(
      eq(gatePhotos.constructionSiteId, constructionSiteId),
      eq(gatePhotos.gateType, gateType)
    ));
  return photos.length;
}

// ============================================
// GATE: TEAMLEITERCHECK FÜR ARBEITSBEGINN
// ============================================

export async function createArbeitsbeginnCheck(data: {
  projectId: number;
  constructionSiteId: number;
  userId: number;
  checkItems: { id: string; category: string; label: string; checked: boolean; notes?: string }[];
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const [result] = await db.insert(teamleiterChecks).values({
    ...data,
    checkType: "arbeitsbeginn_check",
    completedAt: new Date(),
  });
  return { id: result.insertId, ...data };
}

export async function getArbeitsbeginnCheck(constructionSiteId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const checks = await db.select().from(teamleiterChecks)
    .where(and(
      eq(teamleiterChecks.constructionSiteId, constructionSiteId),
      eq(teamleiterChecks.checkType, "arbeitsbeginn_check")
    ))
    .orderBy(teamleiterChecks.createdAt);
  return checks.length > 0 ? checks[checks.length - 1] : null;
}

// ============================================
// GATE: DOCUMENTATION STATUS UPDATES
// ============================================

export async function completePreDocumentation(constructionSiteId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(constructionSites)
    .set({
      preDocumentationStatus: "completed",
      preDocumentationCompletedAt: new Date(),
    })
    .where(eq(constructionSites.id, constructionSiteId));
}

export async function completePostDocumentation(constructionSiteId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(constructionSites)
    .set({
      postDocumentationStatus: "completed",
      postDocumentationCompletedAt: new Date(),
    })
    .where(eq(constructionSites.id, constructionSiteId));
}

export async function completeTeamleiterCheck(constructionSiteId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(constructionSites)
    .set({
      teamleiterCheckStatus: "completed",
      teamleiterCheckCompletedAt: new Date(),
      teamleiterCheckUserId: userId,
    })
    .where(eq(constructionSites.id, constructionSiteId));
}


// ============================================
// BIBLIOTHEK – CRUD-Hilfsfunktionen
// ============================================

// Generische Library-CRUD-Funktionen (DRY-Prinzip)
function createLibraryCRUD<TTable extends Record<string, any>>(table: TTable, tableName: string) {
  return {
    async list(filters?: { status?: string }) {
      const db = await getDb();
      if (!db) return [];
      const t = table as any;
      if (filters?.status) {
        return db.select().from(t).where(eq(t.status, filters.status)).orderBy(desc(t.updatedAt));
      }
      return db.select().from(t).orderBy(desc(t.updatedAt));
    },
    async getById(id: number) {
      const db = await getDb();
      if (!db) return null;
      const t = table as any;
      const result = await db.select().from(t).where(eq(t.id, id)).limit(1);
      return result[0] ?? null;
    },
    async create(data: any) {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      const t = table as any;
      const result = await db.insert(t).values(data);
      const insertId = (result as any)[0]?.insertId;
      if (insertId) {
        const created = await db.select().from(t).where(eq(t.id, insertId)).limit(1);
        return created[0] ?? null;
      }
      return null;
    },
    async update(id: number, data: any) {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      const t = table as any;
      await db.update(t).set(data).where(eq(t.id, id));
      const updated = await db.select().from(t).where(eq(t.id, id)).limit(1);
      return updated[0] ?? null;
    },
    async deactivate(id: number) {
      const db = await getDb();
      if (!db) throw new Error("DB not available");
      const t = table as any;
      await db.update(t).set({ status: "inaktiv" }).where(eq(t.id, id));
      return true;
    },
  };
}

export const libraryVehiclesCRUD = createLibraryCRUD(libraryVehicles, "libraryVehicles");
export const libraryEquipmentCRUD = createLibraryCRUD(libraryEquipment, "libraryEquipment");
export const libraryCleaningAgentsCRUD = createLibraryCRUD(libraryCleaningAgents, "libraryCleaningAgents");
export const libraryDiscountsCRUD = createLibraryCRUD(libraryDiscounts, "libraryDiscounts");
export const libraryServicesCRUD = createLibraryCRUD(libraryServices, "libraryServices");
export const libraryWorkClothingCRUD = createLibraryCRUD(libraryWorkClothing, "libraryWorkClothing");
export const libraryAssetsCRUD = createLibraryCRUD(libraryAssets, "libraryAssets");

// Bibliothek-Berechtigungen prüfen
export async function checkLibraryPermission(userId: number, action: "view" | "edit") {
  const db = await getDb();
  if (!db) return false;
  const member = await db.select().from(teamMembers).where(eq(teamMembers.userId, userId)).limit(1);
  if (!member[0]) return false;
  if (action === "view") return member[0].canViewLibrary === true;
  if (action === "edit") return member[0].canEditLibrary === true;
  return false;
}

// ============================================
// HR & PERSONAL – DB Helper Functions
// ============================================
import { employees, InsertEmployee, employeeDocuments, InsertEmployeeDocument } from "../drizzle/schema";

// --- Employees ---
export async function getAllEmployees() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employees).orderBy(asc(employees.lastName), asc(employees.firstName));
}

export async function getEmployeeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  return result[0];
}

export async function getEmployeesByStatus(status: "active" | "inactive" | "onboarding" | "leave") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employees).where(eq(employees.status, status)).orderBy(asc(employees.lastName));
}

export async function searchEmployees(query: string) {
  const db = await getDb();
  if (!db) return [];
  const term = `%${query}%`;
  return db.select().from(employees).where(
    or(
      like(employees.firstName, term),
      like(employees.lastName, term),
      like(employees.email, term),
      like(employees.position, term),
      like(employees.department, term)
    )
  ).orderBy(asc(employees.lastName));
}

export async function createEmployee(data: InsertEmployee) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(employees).values(data);
  return result[0].insertId;
}

export async function updateEmployee(id: number, data: Partial<InsertEmployee>) {
  const db = await getDb();
  if (!db) return false;
  await db.update(employees).set(data).where(eq(employees.id, id));
  return true;
}

export async function getEmployeeStats() {
  const db = await getDb();
  if (!db) return { total: 0, active: 0, inactive: 0, onboarding: 0, leave: 0, departments: [], positions: [] };
  const all = await db.select().from(employees);
  const active = all.filter(e => e.status === "active").length;
  const inactive = all.filter(e => e.status === "inactive").length;
  const onboarding = all.filter(e => e.status === "onboarding").length;
  const leave = all.filter(e => e.status === "leave").length;
  const deptMap = new Map<string, number>();
  const posMap = new Map<string, number>();
  all.forEach(e => {
    if (e.department) deptMap.set(e.department, (deptMap.get(e.department) || 0) + 1);
    if (e.position) posMap.set(e.position, (posMap.get(e.position) || 0) + 1);
  });
  return {
    total: all.length, active, inactive, onboarding, leave,
    departments: Array.from(deptMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    positions: Array.from(posMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
  };
}

// --- Employee Documents ---
export async function getDocumentsByEmployeeId(employeeId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employeeDocuments).where(eq(employeeDocuments.employeeId, employeeId)).orderBy(desc(employeeDocuments.uploadedAt));
}

export async function getAllEmployeeDocuments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employeeDocuments).orderBy(desc(employeeDocuments.uploadedAt));
}

export async function createEmployeeDocument(data: InsertEmployeeDocument) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(employeeDocuments).values(data);
  return result[0].insertId;
}

export async function deleteEmployeeDocument(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(employeeDocuments).where(eq(employeeDocuments.id, id));
  return true;
}

export async function searchEmployeeDocuments(query: string) {
  const db = await getDb();
  if (!db) return [];
  const term = `%${query}%`;
  return db.select().from(employeeDocuments).where(
    or(like(employeeDocuments.filename, term), like(employeeDocuments.category, term))
  ).orderBy(desc(employeeDocuments.uploadedAt));
}

export async function getDocumentStats() {
  const db = await getDb();
  if (!db) return { total: 0, categories: [] };
  const all = await db.select().from(employeeDocuments);
  const catMap = new Map<string, number>();
  all.forEach(d => { catMap.set(d.category, (catMap.get(d.category) || 0) + 1); });
  return {
    total: all.length,
    categories: Array.from(catMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
  };
}


// ============================================
// GLOBAL SEARCH (KA-10)
// ============================================
export async function globalSearch(query: string, limit = 8) {
  const db = await getDb();
  if (!db || !query || query.length < 2) return [];
  
  const q = `%${query}%`;
  const results: Array<{ type: string; id: number; title: string; subtitle: string; href: string }> = [];
  
  // Projekte durchsuchen
  const projectResults = await db.select({
    id: projects.id,
    name: projects.name,
    projectNumber: projects.projectNumber,
  }).from(projects)
    .where(or(
      like(projects.name, q),
      like(projects.projectNumber, q),
    ))
    .limit(limit);
  
  for (const p of projectResults) {
    results.push({
      type: "Projekt",
      id: p.id,
      title: p.name || "Unbenanntes Projekt",
      subtitle: p.projectNumber || "",
      href: `/projekte/${p.id}`,
    });
  }
  
  // Unternehmen durchsuchen
  const companyResults = await db.select({
    id: companies.id,
    name: companies.name,
    city: companies.city,
  }).from(companies)
    .where(or(
      like(companies.name, q),
      like(companies.city, q),
    ))
    .limit(limit);
  
  for (const c of companyResults) {
    results.push({
      type: "Unternehmen",
      id: c.id,
      title: c.name || "Unbenanntes Unternehmen",
      subtitle: c.city || "",
      href: `/kontakte?company=${c.id}`,
    });
  }
  
  // Kontakte durchsuchen
  const contactResults = await db.select({
    id: contacts.id,
    firstName: contacts.firstName,
    lastName: contacts.lastName,
    email: contacts.email,
  }).from(contacts)
    .where(or(
      like(contacts.firstName, q),
      like(contacts.lastName, q),
      like(contacts.email, q),
    ))
    .limit(limit);
  
  for (const c of contactResults) {
    results.push({
      type: "Kontakt",
      id: c.id,
      title: `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Unbenannter Kontakt",
      subtitle: c.email || "",
      href: `/kontakte?contact=${c.id}`,
    });
  }
  
  // Angebote durchsuchen
  const offerResults = await db.select({
    id: offers.id,
    offerNumber: offers.offerNumber,
    status: offers.status,
  }).from(offers)
    .where(or(
      like(offers.offerNumber, q),
    ))
    .limit(limit);
  
  for (const o of offerResults) {
    results.push({
      type: "Angebot",
      id: o.id,
      title: o.offerNumber || "Angebot",
      subtitle: o.status || "",
      href: `/angebote/${o.id}`,
    });
  }
  
  // Immobilien durchsuchen
  const propertyResults = await db.select({
    id: properties.id,
    name: properties.name,
    street: properties.street,
    city: properties.city,
  }).from(properties)
    .where(or(
      like(properties.name, q),
      like(properties.street, q),
      like(properties.city, q),
    ))
    .limit(limit);
  
  for (const p of propertyResults) {
    results.push({
      type: "Immobilie",
      id: p.id,
      title: p.name || p.street || "Immobilie",
      subtitle: [p.street, p.city].filter(Boolean).join(", "),
      href: `/immobilien/${p.id}`,
    });
  }
  
  // Baustellen durchsuchen
  const siteResults = await db.select({
    id: constructionSites.id,
    name: constructionSites.name,
    address: constructionSites.address,
  }).from(constructionSites)
    .where(or(
      like(constructionSites.name, q),
      like(constructionSites.address, q),
    ))
    .limit(limit);
  
  for (const s of siteResults) {
    results.push({
      type: "Baustelle",
      id: s.id,
      title: s.name || "Baustelle",
      subtitle: s.address || "",
      href: `/baustellen/${s.id}`,
    });
  }
  
  // Ergebnisse auf Gesamtlimit begrenzen
  return results.slice(0, limit * 2);
}
