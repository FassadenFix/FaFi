import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

/**
 * FassadenFix Projektmanagement - Database Schema
 * 
 * Core entities:
 * - users: System users (from OAuth)
 * - companies: Unternehmen/Kunden
 * - contacts: Ansprechpartner
 * - projects: Projekte
 * - properties: Immobilien
 * - constructionSites: Baustellen
 * - offers: Angebote
 * - activityLogs: Aktivitäts-Logbuch
 * - tasks: Aufgaben
 * - dashboardWidgets: Personalisierte Dashboard-Widgets
 */

// ============================================
// USERS TABLE (Core Auth)
// ============================================
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // FaFi-specific fields
  fafiRole: mysqlEnum("fafiRole", ["gf", "kundenberater", "at_leiter", "projektleiter", "buero"]).default("buero"),
  phone: varchar("phone", { length: 50 }),
  avatarUrl: text("avatarUrl"),
  // Microsoft 365 SSO fields (v7.1)
  microsoftId: varchar("microsoftId", { length: 128 }),
  microsoftAccessToken: text("microsoftAccessToken"),
  microsoftRefreshToken: text("microsoftRefreshToken"),
  microsoftTokenExpiry: timestamp("microsoftTokenExpiry"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// COMPANIES TABLE (Unternehmen)
// ============================================
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  hubspotId: varchar("hubspotId", { length: 64 }),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["wohnungsgesellschaft", "hausverwaltung", "privatperson", "gewerbe", "oeffentlich"]).default("hausverwaltung"),
  street: varchar("street", { length: 255 }),
  postalCode: varchar("postalCode", { length: 20 }),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }).default("Deutschland"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ============================================
// CONTACTS TABLE (Ansprechpartner)
// ============================================
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  hubspotId: varchar("hubspotId", { length: 64 }),
  companyId: int("companyId").references(() => companies.id),
  salutation: mysqlEnum("salutation", ["herr", "frau", "divers"]),
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  position: varchar("position", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  email: varchar("email", { length: 320 }),
  isPrimary: boolean("isPrimary").default(false),
  isOrphaned: boolean("isOrphaned").default(false),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

// ============================================
// PROJECTS TABLE (Projekte)
// ============================================
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  projectNumber: varchar("projectNumber", { length: 50 }).notNull().unique(), // e.g., "2026-WBG-01"
  name: varchar("name", { length: 255 }).notNull(),
  displayName: varchar("displayName", { length: 500 }), // Auto-generiert: YYYY_Slug_Kontext_NNN
  companyId: int("companyId").references(() => companies.id),
  contactId: int("contactId").references(() => contacts.id),
  phase: mysqlEnum("phase", [
    "objektaufnahme",
    "angebot_erstellt",
    "angebot_versendet",
    "nachfassen",
    "auftrag_gewonnen",
    "planung",
    "vorbereitung",
    "durchfuehrung",
    "abnahme",
    "abgeschlossen",
    "verloren"
  ]).default("objektaufnahme").notNull(),
  totalArea: decimal("totalArea", { precision: 12, scale: 2 }).default("0"),
  propertyCount: int("propertyCount").default(0),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  progress: int("progress").default(0), // 0-100
  kundenberaterId: int("kundenberaterId").references(() => users.id),
  projektleiterId: int("projektleiterId").references(() => users.id),
  notes: text("notes"),
  // HubSpot Integration
  hubspotDealId: varchar("hubspotDealId", { length: 64 }),
  // v7.3: Ampel-System
  phaseStatus: mysqlEnum("phaseStatus", ["green", "yellow", "red"]).default("green"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

// ============================================
// PROPERTIES TABLE (Immobilien)
// ============================================
export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").references(() => projects.id),
  companyId: int("companyId").references(() => companies.id), // A3: Eigentümer-Zuordnung (kann wechseln)
  constructionSiteId: int("constructionSiteId"),
  name: varchar("name", { length: 255 }).notNull(),
  street: varchar("street", { length: 255 }),
  postalCode: varchar("postalCode", { length: 10 }),
  city: varchar("city", { length: 100 }),
  // Facade data per side (JSON for flexibility)
  frontSide: json("frontSide").$type<{
    area: number;
    facadeType: string;
    cleanable: boolean;
    notCleanableReason?: string;
    notes?: string;
    // Loom-Feedback: Teilflächen für unterbrochene Fassaden
    hasSubAreas?: boolean;
    subAreas?: { width: number; height: number; area: number; note: string }[];
  }>(),
  backSide: json("backSide").$type<{
    area: number;
    facadeType: string;
    cleanable: boolean;
    notCleanableReason?: string;
    notes?: string;
    hasSubAreas?: boolean;
    subAreas?: { width: number; height: number; area: number; note: string }[];
  }>(),
  leftGable: json("leftGable").$type<{
    area: number;
    facadeType: string;
    cleanable: boolean;
    notCleanableReason?: string;
    notes?: string;
    hasSubAreas?: boolean;
    subAreas?: { width: number; height: number; area: number; note: string }[];
  }>(),
  rightGable: json("rightGable").$type<{
    area: number;
    facadeType: string;
    cleanable: boolean;
    notCleanableReason?: string;
    notes?: string;
    hasSubAreas?: boolean;
    subAreas?: { width: number; height: number; area: number; note: string }[];
  }>(),
  totalCleanableArea: decimal("totalCleanableArea", { precision: 12, scale: 2 }).default("0"),
  specialFeatures: json("specialFeatures").$type<string[]>(), // ["Balkone", "Loggien", etc.]
  accessNotes: text("accessNotes"),
  photos: json("photos").$type<{
    url: string;
    category: string;
    side?: string;
    caption?: string;
    uploadedAt: string;
  }[]>(),
  satelliteImageUrl: text("satelliteImageUrl"),
  // Entwurfs-Funktion
  isDraft: boolean("isDraft").default(false).notNull(),
  wizardStep: int("wizardStep").default(0), // Letzter Wizard-Schritt
  wizardData: json("wizardData").$type<Record<string, any>>(), // Vollständiger Wizard-Zustand
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

// A2: M:N Zwischentabelle Projekte ↔ Immobilien
export const projectProperties = mysqlTable("projectProperties", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").references(() => projects.id).notNull(),
  propertyId: int("propertyId").references(() => properties.id).notNull(),
  role: varchar("role", { length: 50 }).default("primary"), // primary, secondary
  addedAt: timestamp("addedAt").defaultNow().notNull(),
});

export type ProjectProperty = typeof projectProperties.$inferSelect;
export type InsertProjectProperty = typeof projectProperties.$inferInsert;

// ============================================
// CONSTRUCTION SITES TABLE (Baustellen)
// ============================================
export const constructionSites = mysqlTable("constructionSites", {
  id: int("id").autoincrement().primaryKey(),
  siteNumber: varchar("siteNumber", { length: 50 }).notNull().unique(), // e.g., "B-2026-001"
  projectId: int("projectId").references(() => projects.id).notNull(),
  orderId: int("orderId").references(() => orders.id), // Verknüpfung zum Auftrag
  offerId: int("offerId").references(() => offers.id), // Verknüpfung zum Angebot (für Seiten-Details)
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  status: mysqlEnum("status", ["geplant", "aktiv", "pausiert", "abgeschlossen"]).default("geplant").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  progress: int("progress").default(0), // 0-100
  totalArea: decimal("totalArea", { precision: 12, scale: 2 }).default("0"),
  projektleiterId: int("projektleiterId").references(() => users.id),
  teamMembers: json("teamMembers").$type<number[]>(), // User IDs
  equipment: json("equipment").$type<string[]>(),
  // Weather cache (updated periodically)
  weatherData: json("weatherData").$type<{
    temp: number;
    condition: string;
    wind: number;
    precipitation: number;
    humidity: number;
    updatedAt: string;
  }>(),
  notes: text("notes"),
  // v7.0b: Vorher-Dokumentation
  preDocumentationStatus: mysqlEnum("preDocumentationStatus", ["pending", "in_progress", "completed"]).default("pending").notNull(),
  preDocumentationCompletedAt: timestamp("preDocumentationCompletedAt"),
  // v7.0d: Nachher-Dokumentation
  postDocumentationStatus: mysqlEnum("postDocumentationStatus", ["pending", "in_progress", "completed"]).default("pending").notNull(),
  postDocumentationCompletedAt: timestamp("postDocumentationCompletedAt"),
  // v8.0: Teamleitercheck Gate
  teamleiterCheckStatus: mysqlEnum("teamleiterCheckStatus", ["pending", "completed"]).default("pending").notNull(),
  teamleiterCheckCompletedAt: timestamp("teamleiterCheckCompletedAt"),
  teamleiterCheckUserId: int("teamleiterCheckUserId").references(() => users.id),
  // v7.3: Ampel-System
  siteStatus: mysqlEnum("siteStatus", ["green", "yellow", "red"]).default("green"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConstructionSite = typeof constructionSites.$inferSelect;
export type InsertConstructionSite = typeof constructionSites.$inferInsert;

// ============================================
// OFFERS TABLE (Angebote)
// ============================================
export const offers = mysqlTable("offers", {
  id: int("id").autoincrement().primaryKey(),
  offerNumber: varchar("offerNumber", { length: 50 }).notNull(), // e.g., "FF-2026-0042"
  displayName: varchar("displayName", { length: 500 }), // Auto-generiert: YYYY_Slug_Angebot_NNNN_vN
  version: int("version").default(1).notNull(),
  projectId: int("projectId").references(() => projects.id),
  companyId: int("companyId").references(() => companies.id),
  contactId: int("contactId").references(() => contacts.id),
  status: mysqlEnum("status", ["entwurf", "erstellt", "versendet", "angenommen", "abgelehnt", "abgelaufen", "obsolet"]).default("entwurf").notNull(),
  // Pricing
  totalArea: decimal("totalArea", { precision: 12, scale: 2 }).default("0"),
  pricePerSqm: decimal("pricePerSqm", { precision: 8, scale: 2 }).default("0"),
  basePrice: decimal("basePrice", { precision: 12, scale: 2 }).default("0"),
  discount: decimal("discount", { precision: 5, scale: 2 }).default("0"), // Percentage
  discountReason: varchar("discountReason", { length: 255 }),
  travelCosts: decimal("travelCosts", { precision: 10, scale: 2 }).default("0"),
  netTotal: decimal("netTotal", { precision: 12, scale: 2 }).default("0"),
  vatRate: decimal("vatRate", { precision: 5, scale: 2 }).default("19.00"),
  vatAmount: decimal("vatAmount", { precision: 12, scale: 2 }).default("0"),
  grossTotal: decimal("grossTotal", { precision: 12, scale: 2 }).default("0"),
  // Calculation details
  scaffoldingDays: int("scaffoldingDays").default(0),
  overnightStays: int("overnightStays").default(0),
  distanceKm: int("distanceKm").default(0),
  // Content
  positions: json("positions").$type<{
    propertyId: number;
    propertyName: string;
    sides: {
      name: string;
      area: number;
      pricePerSqm: number;
      total: number;
    }[];
    subtotal: number;
  }[]>(),
  textBlocks: json("textBlocks").$type<string[]>(), // Selected template text blocks
  customText: text("customText"),
  validUntil: timestamp("validUntil"),
  sentAt: timestamp("sentAt"),
  acceptedAt: timestamp("acceptedAt"),
  pdfUrl: text("pdfUrl"),
  // Nachfass-System (Phase 0e)
  followUpDueAt: timestamp("followUpDueAt"),
  followUpCount: int("followUpCount").default(0),
  // HubSpot Integration
  hubspotDealId: varchar("hubspotDealId", { length: 64 }),
  createdById: int("createdById").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

// ============================================
// TASKS TABLE (Aufgaben)
// ============================================
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").references(() => projects.id),
  constructionSiteId: int("constructionSiteId").references(() => constructionSites.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["offen", "in_bearbeitung", "erledigt", "abgebrochen"]).default("offen").notNull(),
  priority: mysqlEnum("priority", ["niedrig", "normal", "hoch", "dringend"]).default("normal").notNull(),
  dueDate: timestamp("dueDate"),
  assignedToId: int("assignedToId").references(() => users.id),
  assignedRole: varchar("assignedRole", { length: 50 }), // e.g., "Büro", "AT-Leiter"
  completedAt: timestamp("completedAt"),
  createdById: int("createdById").references(() => users.id),
  // v7.3: Kundenportal Aufgaben-Unterscheidung
  responsibleParty: mysqlEnum("responsibleParty", ["auftraggeber", "auftragnehmer"]).default("auftragnehmer"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// ============================================
// ACTIVITY LOGS TABLE (Aktivitäts-Logbuch)
// ============================================
export const activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  userName: varchar("userName", { length: 255 }),
  action: mysqlEnum("action", [
    "created",
    "updated",
    "deleted",
    "sent",
    "synced",
    "status_changed",
    "assigned",
    "completed",
    "uploaded",
    "downloaded",
    "login",
    "logout",
    "deactivated"
  ]).notNull(),
  entityType: mysqlEnum("entityType", [
    "project",
    "property",
    "construction_site",
    "offer",
    "company",
    "contact",
    "task",
    "user",
    "hubspot",
    "system",
    "document",
    "library_vehicle",
    "library_equipment",
    "library_cleaning_agent",
    "library_discount",
    "library_service",
    "library_work_clothing",
    "library_asset"
  ]).notNull(),
  entityId: int("entityId"),
  entityName: varchar("entityName", { length: 255 }),
  details: text("details"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// ============================================
// CONSTRUCTION SITE LOGS TABLE (Baustellen-Logbuch)
// ============================================
export const constructionSiteLogs = mysqlTable("constructionSiteLogs", {
  id: int("id").autoincrement().primaryKey(),
  constructionSiteId: int("constructionSiteId").references(() => constructionSites.id).notNull(),
  userId: int("userId").references(() => users.id),
  userName: varchar("userName", { length: 255 }),
  logType: mysqlEnum("logType", [
    "arbeitsbeginn",
    "fortschritt",
    "pause",
    "problem",
    "material",
    "arbeitsende",
    "wetter",
    "sicherheit",
    "kundenkontakt",
    "geraeteausfall",
    "sonstiges"
  ]).notNull(),
  entry: text("entry").notNull(),
  photos: json("photos").$type<string[]>(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  // v7.0c: Tagesablauf-Felder
  workDayStarted: timestamp("workDayStarted"),
  workDayEnded: timestamp("workDayEnded"),
  plannedAreas: json("plannedAreas").$type<string[]>(),
  completedAreas: json("completedAreas").$type<string[]>(),
  planningOnTrack: boolean("planningOnTrack"),
  planningDeviation: text("planningDeviation"),
  urgency: mysqlEnum("urgency", ["normal", "hoch", "kritisch"]).default("normal"),
  weatherMorning: json("weatherMorning").$type<{ temp: number; condition: string; wind: number; humidity: number }>(),
  weatherNoon: json("weatherNoon").$type<{ temp: number; condition: string; wind: number; humidity: number }>(),
  weatherEvening: json("weatherEvening").$type<{ temp: number; condition: string; wind: number; humidity: number }>(),
  loggedAt: timestamp("loggedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConstructionSiteLog = typeof constructionSiteLogs.$inferSelect;
export type InsertConstructionSiteLog = typeof constructionSiteLogs.$inferInsert;

// ============================================
// TEAMLEITER CHECKS TABLE
// ============================================
export const teamleiterChecks = mysqlTable("teamleiterChecks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").references(() => projects.id).notNull(),
  constructionSiteId: int("constructionSiteId").references(() => constructionSites.id),
  checkType: mysqlEnum("checkType", ["projektbesprechung", "freitag_check", "arbeitsbeginn_check"]).notNull(),
  userId: int("userId").references(() => users.id),
  checkItems: json("checkItems").$type<{
    id: string;
    category: string;
    label: string;
    checked: boolean;
    notes?: string;
  }[]>(),
  completedAt: timestamp("completedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamleiterCheck = typeof teamleiterChecks.$inferSelect;
export type InsertTeamleiterCheck = typeof teamleiterChecks.$inferInsert;

// ============================================
// DASHBOARD WIDGETS TABLE (Personalisierte Widgets)
// ============================================
export const dashboardWidgets = mysqlTable("dashboardWidgets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  widgetType: varchar("widgetType", { length: 50 }).notNull(), // e.g., "kpi", "projects", "tasks", "weather"
  title: varchar("title", { length: 255 }),
  position: int("position").default(0),
  width: mysqlEnum("width", ["small", "medium", "large", "full"]).default("medium"),
  config: json("config").$type<Record<string, unknown>>(),
  isVisible: boolean("isVisible").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type InsertDashboardWidget = typeof dashboardWidgets.$inferInsert;

// ============================================
// NOTIFICATIONS TABLE (Benachrichtigungen)
// ============================================
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull(),
  type: mysqlEnum("type", [
    "task_assigned",
    "task_due",
    "project_status",
    "offer_status",
    "system",
    "reminder",
    "dunning",
    "follow_up",
    "hubspot_sync",
    "workflow"
  ]).notNull(),
  priority: mysqlEnum("priority", ["normal", "high", "critical"]).default("normal").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  entityType: varchar("entityType", { length: 50 }),
  entityId: int("entityId"),
  link: varchar("link", { length: 500 }),
  isRead: boolean("isRead").default(false),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============================================
// CUSTOMER PORTAL TOKENS TABLE
// ============================================
export const customerPortalTokens = mysqlTable("customerPortalTokens", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => companies.id).notNull(),
  contactId: int("contactId").references(() => contacts.id),
  token: varchar("token", { length: 255 }).notNull().unique(),
  projectIds: json("projectIds").$type<number[]>(), // Accessible projects
  permissions: json("permissions").$type<string[]>(), // e.g., ["view_status", "view_documents", "view_photos"]
  expiresAt: timestamp("expiresAt"),
  lastAccessedAt: timestamp("lastAccessedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CustomerPortalToken = typeof customerPortalTokens.$inferSelect;
export type InsertCustomerPortalToken = typeof customerPortalTokens.$inferInsert;

// ============================================
// CALENDAR EVENTS TABLE (Kalendereinträge)
// ============================================
export const calendarEvents = mysqlTable("calendarEvents", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventType: mysqlEnum("eventType", [
    "baustelle",
    "besprechung",
    "termin",
    "urlaub",
    "krank",
    "sonstiges"
  ]).default("termin").notNull(),
  projectId: int("projectId").references(() => projects.id),
  constructionSiteId: int("constructionSiteId").references(() => constructionSites.id),
  assignedToId: int("assignedToId").references(() => users.id),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  allDay: boolean("allDay").default(false),
  color: varchar("color", { length: 20 }),
  createdById: int("createdById").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = typeof calendarEvents.$inferInsert;


// ============================================
// DOCUMENTS TABLE (Archiv)
// ============================================
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  displayName: varchar("displayName", { length: 500 }), // Auto-generiert: YYYY_Slug_Kontext_NNN
  originalName: varchar("originalName", { length: 255 }).notNull(),
  fileType: mysqlEnum("fileType", ["dokument", "bild", "video", "sonstiges"]).default("dokument"),
  mimeType: varchar("mimeType", { length: 100 }),
  fileSize: int("fileSize"), // in bytes
  s3Key: varchar("s3Key", { length: 500 }).notNull(),
  s3Url: text("s3Url").notNull(),
  // Relations - vollständige Verknüpfung zu allen Entitäten
  companyId: int("companyId").references(() => companies.id),
  projectId: int("projectId").references(() => projects.id),
  propertyId: int("propertyId").references(() => properties.id),
  constructionSiteId: int("constructionSiteId").references(() => constructionSites.id),
  offerId: int("offerId").references(() => offers.id),
  orderId: int("orderId").references(() => orders.id),
  invoiceId: int("invoiceId").references(() => invoices.id),
  warrantyId: int("warrantyId").references(() => warranties.id),
  appointmentId: int("appointmentId").references(() => appointments.id),
  taskId: int("taskId").references(() => tasks.id),
  contactId: int("contactId").references(() => contacts.id),
  // HubSpot-Verknüpfung
  hubspotNoteId: varchar("hubspotNoteId", { length: 64 }),
  // Metadata
  category: varchar("category", { length: 100 }), // angebot, auftragsbestaetigung, rechnung, garantie, abnahmeprotokoll, foto, protokoll, sonstiges
  description: text("description"),
  uploadedById: int("uploadedById").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// ============================================
// TEXT BLOCKS TABLE (Textbausteine)
// ============================================
export const textBlocks = mysqlTable("text_blocks", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["einleitung", "abschluss", "rabatt", "konditionen", "versprechen", "sonstiges"]).notNull(),
  content: text("content").notNull(),
  // Placeholders that can be replaced: [DATUM], [PROZENT], [PROJEKT], [KUNDE], etc.
  placeholders: json("placeholders").$type<string[]>(),
  isActive: boolean("isActive").default(true),
  usageCount: int("usageCount").default(0),
  createdById: int("createdById").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TextBlock = typeof textBlocks.$inferSelect;
export type InsertTextBlock = typeof textBlocks.$inferInsert;

// ============================================
// OFFER TEMPLATES TABLE (Angebotsvorlagen)
// ============================================
export const offerTemplates = mysqlTable("offer_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // e.g., "Fassadenreinigung", "Großprojekt", "Gewerbe"
  // Template content
  introductionBlockId: int("introductionBlockId").references(() => textBlocks.id),
  conclusionBlockId: int("conclusionBlockId").references(() => textBlocks.id),
  conditionBlockIds: json("conditionBlockIds").$type<number[]>(), // Multiple condition blocks
  // Settings
  defaultPaymentDays: int("defaultPaymentDays").default(7),
  defaultValidityDays: int("defaultValidityDays").default(28),
  isActive: boolean("isActive").default(true),
  usageCount: int("usageCount").default(0),
  createdById: int("createdById").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OfferTemplate = typeof offerTemplates.$inferSelect;
export type InsertOfferTemplate = typeof offerTemplates.$inferInsert;

// ============================================
// EMAIL TEMPLATES TABLE (E-Mail-Vorlagen)
// ============================================
export const emailTemplates = mysqlTable("email_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["angebot", "nachfassen", "auftrag", "rechnung", "sonstiges"]).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(), // Can contain placeholders
  body: text("body").notNull(), // Can contain placeholders
  placeholders: json("placeholders").$type<string[]>(),
  isActive: boolean("isActive").default(true),
  usageCount: int("usageCount").default(0),
  createdById: int("createdById").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

// ============================================
// ORDERS TABLE (Aufträge)
// ============================================
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(), // e.g., "A-2026-001"
  displayName: varchar("displayName", { length: 500 }), // Auto-generiert: YYYY_Slug_Auftrag_NNN
  projectId: int("projectId").references(() => projects.id),
  offerId: int("offerId").references(() => offers.id),
  companyId: int("companyId").references(() => companies.id),
  contactId: int("contactId").references(() => contacts.id),
  status: mysqlEnum("status", [
    "bestaetigt",
    "in_vorbereitung",
    "in_durchfuehrung",
    "abgeschlossen",
    "storniert"
  ]).default("bestaetigt").notNull(),
  // Financial data
  netTotal: decimal("netTotal", { precision: 12, scale: 2 }).default("0"),
  vatAmount: decimal("vatAmount", { precision: 12, scale: 2 }).default("0"),
  grossTotal: decimal("grossTotal", { precision: 12, scale: 2 }).default("0"),
  // Dates
  orderDate: timestamp("orderDate").defaultNow().notNull(),
  plannedStartDate: timestamp("plannedStartDate"),
  plannedEndDate: timestamp("plannedEndDate"),
  actualStartDate: timestamp("actualStartDate"),
  actualEndDate: timestamp("actualEndDate"),
  // Relations
  kundenberaterId: int("kundenberaterId").references(() => users.id),
  projektleiterId: int("projektleiterId").references(() => users.id),
  // Positionen aus Angebot (welche Immobilien, welche Seiten, Flächen, Preise)
  positions: json("positions").$type<{
    propertyId: number;
    propertyName: string;
    propertyAddress?: string;
    sides: {
      name: string;
      area: number;
      pricePerSqm: number;
      total: number;
    }[];
    subtotal: number;
  }[]>(),
  // Besonderheiten die Vorbereitungs-Aufgaben generieren
  specialConditions: json("specialConditions").$type<{
    type: string; // z.B. "gruenschnitt", "sperrung", "balkonbruestung", "gerueststellung"
    description: string;
    responsibleParty: "auftraggeber" | "auftragnehmer";
    propertyId?: number;
    side?: string;
    dueBeforeStart: boolean; // Muss vor Baustellenstart erledigt sein
  }[]>(),
  // Konditionen
  discount: decimal("discount", { precision: 5, scale: 2 }).default("0"),
  discountReason: varchar("discountReason", { length: 255 }),
  scaffoldingDays: int("scaffoldingDays").default(0),
  overnightStays: int("overnightStays").default(0),
  distanceKm: int("distanceKm").default(0),
  // HubSpot Integration
  hubspotDealId: varchar("hubspotDealId", { length: 64 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// ============================================
// WARRANTIES TABLE (Garantien)
// ============================================
export const warranties = mysqlTable("warranties", {
  id: int("id").autoincrement().primaryKey(),
  warrantyNumber: varchar("warrantyNumber", { length: 50 }).notNull().unique(), // e.g., "G-2026-001"
  displayName: varchar("displayName", { length: 500 }), // Auto-generiert: YYYY_Slug_Garantie_NNN
  orderId: int("orderId").references(() => orders.id),
  projectId: int("projectId").references(() => projects.id),
  companyId: int("companyId").references(() => companies.id),
  propertyId: int("propertyId").references(() => properties.id),
  // Warranty details
  warrantyType: mysqlEnum("warrantyType", [
    "algenfrei_garantie",
    "ergebnisgarantie",
    "materialgarantie"
  ]).default("algenfrei_garantie").notNull(),
  status: mysqlEnum("status", [
    "aktiv",
    "abgelaufen",
    "beansprucht",
    "erfuellt"
  ]).default("aktiv").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  durationYears: int("durationYears").default(5),
  // Claim information
  claimDate: timestamp("claimDate"),
  claimDescription: text("claimDescription"),
  claimResolution: text("claimResolution"),
  claimResolvedAt: timestamp("claimResolvedAt"),
  // Certificate
  certificateUrl: text("certificateUrl"),
  notes: text("notes"),
  createdById: int("createdById").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Warranty = typeof warranties.$inferSelect;
export type InsertWarranty = typeof warranties.$inferInsert;

// ============================================
// APPOINTMENTS TABLE (Termine/Terminfinder)
// ============================================
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  appointmentType: mysqlEnum("appointmentType", [
    "objektaufnahme",
    "kundentermin",
    "baustellenbesichtigung",
    "abnahme",
    "nachbesserung",
    "intern"
  ]).default("kundentermin").notNull(),
  status: mysqlEnum("status", [
    "vorgeschlagen",
    "bestaetigt",
    "abgesagt",
    "verschoben",
    "durchgefuehrt"
  ]).default("vorgeschlagen").notNull(),
  // Relations
  projectId: int("projectId").references(() => projects.id),
  companyId: int("companyId").references(() => companies.id),
  contactId: int("contactId").references(() => contacts.id),
  propertyId: int("propertyId").references(() => properties.id),
  // Scheduling
  proposedDates: json("proposedDates").$type<{
    date: string;
    startTime: string;
    endTime: string;
    available: boolean;
  }[]>(),
  confirmedDate: timestamp("confirmedDate"),
  confirmedStartTime: varchar("confirmedStartTime", { length: 10 }),
  confirmedEndTime: varchar("confirmedEndTime", { length: 10 }),
  // Location
  location: varchar("location", { length: 500 }),
  isOnsite: boolean("isOnsite").default(true),
  // Participants
  assignedToId: int("assignedToId").references(() => users.id),
  participants: json("participants").$type<{
    userId?: number;
    contactId?: number;
    name: string;
    email?: string;
    role: string;
  }[]>(),
  // Reminders
  reminderSent: boolean("reminderSent").default(false),
  reminderSentAt: timestamp("reminderSentAt"),
  notes: text("notes"),
  createdById: int("createdById").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// ============================================
// INVOICES TABLE (Rechnungen)
// ============================================
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(), // e.g., "R-2026-001"
  displayName: varchar("displayName", { length: 500 }), // Auto-generiert: YYYY_Slug_Rechnung_NNNN
  orderId: int("orderId").references(() => orders.id),
  projectId: int("projectId").references(() => projects.id),
  companyId: int("companyId").references(() => companies.id),
  contactId: int("contactId").references(() => contacts.id),
  // Invoice type
  invoiceType: mysqlEnum("invoiceType", [
    "abschlagsrechnung",
    "schlussrechnung",
    "teilrechnung",
    "gutschrift"
  ]).default("schlussrechnung").notNull(),
  status: mysqlEnum("status", [
    "entwurf",
    "erstellt",
    "versendet",
    "bezahlt",
    "teilbezahlt",
    "ueberfaellig",
    "storniert",
    "gemahnt"
  ]).default("entwurf").notNull(),
  // Financial data
  netTotal: decimal("netTotal", { precision: 12, scale: 2 }).default("0"),
  vatRate: decimal("vatRate", { precision: 5, scale: 2 }).default("19.00"),
  vatAmount: decimal("vatAmount", { precision: 12, scale: 2 }).default("0"),
  grossTotal: decimal("grossTotal", { precision: 12, scale: 2 }).default("0"),
  paidAmount: decimal("paidAmount", { precision: 12, scale: 2 }).default("0"),
  openAmount: decimal("openAmount", { precision: 12, scale: 2 }).default("0"),
  // Positions
  positions: json("positions").$type<{
    position: number;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    total: number;
  }[]>(),
  // Dates
  invoiceDate: timestamp("invoiceDate").defaultNow().notNull(),
  dueDate: timestamp("dueDate"),
  sentAt: timestamp("sentAt"),
  paidAt: timestamp("paidAt"),
  // Dunning
  dunningLevel: int("dunningLevel").default(0),
  lastDunningDate: timestamp("lastDunningDate"),
  // Documents
  pdfUrl: text("pdfUrl"),
  notes: text("notes"),
  createdById: int("createdById").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// ============================================
// PAYMENTS TABLE (Zahlungen)
// ============================================
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  paymentNumber: varchar("paymentNumber", { length: 50 }).notNull().unique(), // e.g., "Z-2026-001"
  invoiceId: int("invoiceId").references(() => invoices.id),
  companyId: int("companyId").references(() => companies.id),
  // Payment details
  paymentType: mysqlEnum("paymentType", [
    "ueberweisung",
    "lastschrift",
    "bar",
    "scheck",
    "kreditkarte",
    "paypal"
  ]).default("ueberweisung").notNull(),
  status: mysqlEnum("status", [
    "ausstehend",
    "eingegangen",
    "zugeordnet",
    "rueckbuchung"
  ]).default("ausstehend").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR"),
  // Bank details
  bankReference: varchar("bankReference", { length: 255 }),
  bankAccountIban: varchar("bankAccountIban", { length: 34 }),
  paymentDate: timestamp("paymentDate").notNull(),
  valueDate: timestamp("valueDate"),
  // Matching
  matchedAt: timestamp("matchedAt"),
  matchedById: int("matchedById").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// ============================================
// BUDGETS TABLE (Budgets)
// ============================================
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  budgetType: mysqlEnum("budgetType", [
    "projekt",
    "abteilung",
    "marketing",
    "personal",
    "material",
    "sonstiges"
  ]).default("projekt").notNull(),
  // Relations
  projectId: int("projectId").references(() => projects.id),
  // Period
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  // Financial data
  plannedAmount: decimal("plannedAmount", { precision: 12, scale: 2 }).default("0"),
  actualAmount: decimal("actualAmount", { precision: 12, scale: 2 }).default("0"),
  remainingAmount: decimal("remainingAmount", { precision: 12, scale: 2 }).default("0"),
  // Categories breakdown
  categories: json("categories").$type<{
    name: string;
    planned: number;
    actual: number;
    remaining: number;
  }[]>(),
  status: mysqlEnum("status", [
    "aktiv",
    "ueberschritten",
    "abgeschlossen"
  ]).default("aktiv").notNull(),
  // Alerts
  warningThreshold: int("warningThreshold").default(80), // Percentage
  alertSent: boolean("alertSent").default(false),
  notes: text("notes"),
  responsibleId: int("responsibleId").references(() => users.id),
  createdById: int("createdById").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

// ============================================
// CUSTOMER REPORTS TABLE (Kundenmeldungen)
// ============================================
export const customerReports = mysqlTable("customerReports", {
  id: int("id").autoincrement().primaryKey(),
  reportNumber: varchar("reportNumber", { length: 50 }).notNull().unique(), // e.g., "KM-2026-001"
  // Relations
  companyId: int("companyId").references(() => companies.id),
  contactId: int("contactId").references(() => contacts.id),
  projectId: int("projectId").references(() => projects.id),
  propertyId: int("propertyId").references(() => properties.id),
  orderId: int("orderId").references(() => orders.id),
  warrantyId: int("warrantyId").references(() => warranties.id),
  // Report details
  reportType: mysqlEnum("reportType", [
    "reklamation",
    "anfrage",
    "lob",
    "beschwerde",
    "garantiefall",
    "sonstiges"
  ]).default("anfrage").notNull(),
  priority: mysqlEnum("priority", [
    "niedrig",
    "normal",
    "hoch",
    "dringend"
  ]).default("normal").notNull(),
  status: mysqlEnum("status", [
    "neu",
    "in_bearbeitung",
    "warten_auf_kunde",
    "geloest",
    "abgeschlossen"
  ]).default("neu").notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  description: text("description").notNull(),
  // Resolution
  resolution: text("resolution"),
  resolvedAt: timestamp("resolvedAt"),
  resolvedById: int("resolvedById").references(() => users.id),
  // Attachments
  attachments: json("attachments").$type<{
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
  }[]>(),
  // Communication
  internalNotes: text("internalNotes"),
  customerNotified: boolean("customerNotified").default(false),
  lastCustomerContact: timestamp("lastCustomerContact"),
  // Assignment
  assignedToId: int("assignedToId").references(() => users.id),
  createdById: int("createdById").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerReport = typeof customerReports.$inferSelect;
export type InsertCustomerReport = typeof customerReports.$inferInsert;

// ============================================
// TEAM MEMBERS EXTENDED TABLE (Erweiterte Teammitglieder-Daten)
// ============================================
export const teamMembers = mysqlTable("teamMembers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id).notNull().unique(),
  // Personal data
  employeeNumber: varchar("employeeNumber", { length: 50 }),
  department: mysqlEnum("department", [
    "geschaeftsfuehrung",
    "vertrieb",
    "projektleitung",
    "ausfuehrung",
    "buero",
    "buchhaltung"
  ]).default("ausfuehrung"),
  position: varchar("position", { length: 100 }),
  // Employment
  employmentType: mysqlEnum("employmentType", [
    "vollzeit",
    "teilzeit",
    "minijob",
    "praktikum",
    "freelancer"
  ]).default("vollzeit"),
  hireDate: timestamp("hireDate"),
  exitDate: timestamp("exitDate"),
  // Contact
  workPhone: varchar("workPhone", { length: 50 }),
  workMobile: varchar("workMobile", { length: 50 }),
  emergencyContact: varchar("emergencyContact", { length: 255 }),
  emergencyPhone: varchar("emergencyPhone", { length: 50 }),
  // Skills & Certifications
  skills: json("skills").$type<string[]>(),
  certifications: json("certifications").$type<{
    name: string;
    issuedAt: string;
    expiresAt?: string;
    documentUrl?: string;
  }[]>(),
  // Availability
  workingHours: json("workingHours").$type<{
    monday: { start: string; end: string };
    tuesday: { start: string; end: string };
    wednesday: { start: string; end: string };
    thursday: { start: string; end: string };
    friday: { start: string; end: string };
  }>(),
  vacationDaysTotal: int("vacationDaysTotal").default(30),
  vacationDaysUsed: int("vacationDaysUsed").default(0),
  // Status
  status: mysqlEnum("status", [
    "aktiv",
    "urlaub",
    "krank",
    "inaktiv"
  ]).default("aktiv"),
  notes: text("notes"),
  // Bibliothek-Berechtigungen
  canViewLibrary: boolean("canViewLibrary").default(false),
  canEditLibrary: boolean("canEditLibrary").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;


// ============================================
// SYNC STATUS TABLE (HubSpot Sync Tracking)
// ============================================
export const syncStatus = mysqlTable("syncStatus", {
  id: int("id").autoincrement().primaryKey(),
  entityType: mysqlEnum("entityType", [
    "contact",
    "company",
    "deal",
    "project",
    "property"
  ]).notNull(),
  localId: int("localId").notNull(),
  hubspotId: varchar("hubspotId", { length: 64 }),
  syncDirection: mysqlEnum("syncDirection", [
    "import",    // HubSpot → FaFi PM
    "export",    // FaFi PM → HubSpot
    "bidirectional"
  ]).default("import"),
  lastSyncAt: timestamp("lastSyncAt"),
  lastLocalUpdate: timestamp("lastLocalUpdate"),
  lastHubspotUpdate: timestamp("lastHubspotUpdate"),
  syncStatus: mysqlEnum("syncStatus", [
    "synced",
    "pending",
    "conflict",
    "error"
  ]).default("pending"),
  conflictData: json("conflictData").$type<{
    localValue: unknown;
    hubspotValue: unknown;
    field: string;
    resolvedAt?: string;
    resolvedBy?: string;
  }[]>(),

  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SyncStatus = typeof syncStatus.$inferSelect;
export type InsertSyncStatus = typeof syncStatus.$inferInsert;

// ============================================
// WORKFLOW HISTORY TABLE (Phasenübergangs-Audit-Trail)
// ============================================
export const workflowHistory = mysqlTable("workflowHistory", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").references(() => projects.id).notNull(),
  fromPhase: varchar("fromPhase", { length: 50 }).notNull(),
  toPhase: varchar("toPhase", { length: 50 }).notNull(),
  triggeredBy: varchar("triggeredBy", { length: 20 }).notNull(), // 'auto' | 'manual' | 'system'
  userId: int("userId").references(() => users.id),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WorkflowHistory = typeof workflowHistory.$inferSelect;
export type InsertWorkflowHistory = typeof workflowHistory.$inferInsert;

// ============================================
// SCHEDULED TASKS TABLE (DB-basierte Task-Queue)
// ============================================
export const scheduledTasks = mysqlTable("scheduledTasks", {
  id: int("id").autoincrement().primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // 'follow_up' | 'dunning' | 'hubspot_sync' | 'reminder'
  entityType: varchar("entityType", { length: 50 }), // 'offer' | 'invoice' | 'project'
  entityId: int("entityId"),
  dueAt: timestamp("dueAt").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("pending").notNull(),
  attempts: int("attempts").default(0),
  maxAttempts: int("maxAttempts").default(3),
  lastAttemptAt: timestamp("lastAttemptAt"),
  completedAt: timestamp("completedAt"),
  errorMessage: text("errorMessage"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledTask = typeof scheduledTasks.$inferSelect;
export type InsertScheduledTask = typeof scheduledTasks.$inferInsert;

// ============================================
// FOLLOW-UP REMINDERS TABLE (Nachfass-Erinnerungen)
// ============================================
export const followUpReminders = mysqlTable("followUpReminders", {
  id: int("id").autoincrement().primaryKey(),
  offerId: int("offerId").references(() => offers.id).notNull(),
  projectId: int("projectId").references(() => projects.id),
  dueAt: timestamp("dueAt").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "dismissed", "overdue"]).default("pending").notNull(),
  reminderType: mysqlEnum("reminderType", ["auto_7d", "auto_14d", "auto_30d", "custom"]).default("auto_7d").notNull(),
  notes: text("notes"),
  completedAt: timestamp("completedAt"),
  completedById: int("completedById").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FollowUpReminder = typeof followUpReminders.$inferSelect;
export type InsertFollowUpReminder = typeof followUpReminders.$inferInsert;

// ============================================
// DUNNING ENTRIES TABLE (Mahneinträge)
// ============================================
export const dunningEntries = mysqlTable("dunningEntries", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").references(() => invoices.id).notNull(),
  projectId: int("projectId").references(() => projects.id),
  companyId: int("companyId").references(() => companies.id),
  // Dunning details
  level: int("level").notNull(), // 1 = Zahlungserinnerung, 2 = 1. Mahnung, 3 = 2. Mahnung, 4 = letzte Mahnung
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(), // Offener Betrag zum Zeitpunkt
  dunningFee: decimal("dunningFee", { precision: 8, scale: 2 }).default("0"), // Mahngebühr
  sentVia: mysqlEnum("sentVia", ["email", "post", "manual"]).default("email").notNull(),
  sentAt: timestamp("sentAt"),
  // Status
  status: mysqlEnum("status", ["draft", "sent", "paid", "escalated", "cancelled"]).default("draft").notNull(),
  // Content
  subject: varchar("subject", { length: 500 }),
  body: text("body"),
  pdfUrl: text("pdfUrl"),
  // Tracking
  notes: text("notes"),
  createdById: int("createdById").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DunningEntry = typeof dunningEntries.$inferSelect;
export type InsertDunningEntry = typeof dunningEntries.$inferInsert;

// ============================================
// PHOTOS TABLE (Foto-Verwaltung)
// ============================================
export const photos = mysqlTable("photos", {
  id: int("id").autoincrement().primaryKey(),
  // Verknüpfungen
  propertyId: int("propertyId").references(() => properties.id),
  constructionSiteId: int("constructionSiteId").references(() => constructionSites.id),
  logEntryId: int("logEntryId").references(() => constructionSiteLogs.id),
  projectId: int("projectId").references(() => projects.id),
  uploadedById: int("uploadedById").references(() => users.id),
  // Datei-Informationen
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  filename: varchar("filename", { length: 500 }).notNull(),
  displayName: varchar("displayName", { length: 500 }), // Auto-generiert: YYYY_Slug_Foto-Kontext_NNN
  originalFilename: varchar("originalFilename", { length: 500 }),
  mimeType: varchar("mimeType", { length: 100 }).default("image/jpeg"),
  fileSize: int("fileSize"), // in bytes
  // Kontext & Kategorisierung
  context: mysqlEnum("context", [
    "objektaufnahme",
    "vorher_dokumentation",
    "nachher_dokumentation",
    "baustelle_fortschritt",
    "ereignis",
    "abnahme",
    "schaden",
    "allgemein"
  ]).default("allgemein").notNull(),
  category: varchar("category", { length: 100 }), // z.B. "Algenbefall", "Riss", "Übersicht"
  side: mysqlEnum("side", ["front", "back", "left_gable", "right_gable", "roof", "other"]),
  // Beschreibung
  description: text("description"),
  companyName: varchar("companyName", { length: 255 }),
  address: varchar("address", { length: 500 }),
  // GPS-Daten
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  // Sortierung
  sortOrder: int("sortOrder").default(0),
  // Timestamps
  takenAt: timestamp("takenAt"), // Wann das Foto aufgenommen wurde
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = typeof photos.$inferInsert;

// ============================================
// PERFORMANCE INDEXES (Infrastruktur-Phase)
// ============================================
// Note: MySQL indexes are created via raw SQL migration
// See drizzle/custom-indexes.sql for the CREATE INDEX statements


// ============================================
// KUNDENPORTAL – Erweiterte Tabellen (Phase 5)
// ============================================

// Portal-Nachrichten (Kunde ↔ FassadenFix)
export const portalMessages = mysqlTable("portalMessages", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => companies.id).notNull(),
  projectId: int("projectId").references(() => projects.id),
  // Sender
  senderType: mysqlEnum("senderType", ["customer", "fassadenfix"]).notNull(),
  senderName: varchar("senderName", { length: 255 }).notNull(),
  senderContactId: int("senderContactId").references(() => contacts.id),
  senderUserId: int("senderUserId").references(() => users.id),
  // Message
  subject: varchar("subject", { length: 500 }),
  message: text("message").notNull(),
  attachmentUrls: json("attachmentUrls").$type<string[]>(),
  // Status
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PortalMessage = typeof portalMessages.$inferSelect;
export type InsertPortalMessage = typeof portalMessages.$inferInsert;

// Portal-Feedback (nach Projektabschluss)
export const portalFeedback = mysqlTable("portalFeedback", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => companies.id).notNull(),
  projectId: int("projectId").references(() => projects.id).notNull(),
  contactId: int("contactId").references(() => contacts.id),
  // Bewertung
  overallRating: int("overallRating").notNull(), // 1-5 Sterne
  qualityRating: int("qualityRating"), // 1-5
  communicationRating: int("communicationRating"), // 1-5
  timelinessRating: int("timelinessRating"), // 1-5
  // Freitext
  positiveComment: text("positiveComment"),
  improvementComment: text("improvementComment"),
  wouldRecommend: boolean("wouldRecommend"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PortalFeedback = typeof portalFeedback.$inferSelect;
export type InsertPortalFeedback = typeof portalFeedback.$inferInsert;

// Portal-Dokumenten-Uploads (Kunde → FassadenFix)
export const portalUploads = mysqlTable("portalUploads", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").references(() => companies.id).notNull(),
  projectId: int("projectId").references(() => projects.id),
  contactId: int("contactId").references(() => contacts.id),
  // Dokument
  fileName: varchar("fileName", { length: 500 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 2000 }).notNull(),
  fileSize: int("fileSize"),
  mimeType: varchar("mimeType", { length: 100 }),
  category: mysqlEnum("category", [
    "vollmacht",
    "genehmigung",
    "vertrag",
    "sonstiges"
  ]).default("sonstiges").notNull(),
  description: text("description"),
  // Status
  status: mysqlEnum("status", ["eingegangen", "geprueft", "abgelehnt"]).default("eingegangen").notNull(),
  reviewedBy: int("reviewedBy").references(() => users.id),
  reviewNote: text("reviewNote"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PortalUpload = typeof portalUploads.$inferSelect;
export type InsertPortalUpload = typeof portalUploads.$inferInsert;

// ============================================
// TASK COMMENTS TABLE (Aufgaben-Kommentare)
// ============================================
export const taskComments = mysqlTable("taskComments", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").references(() => tasks.id).notNull(),
  userId: int("userId").references(() => users.id).notNull(),
  userName: varchar("userName", { length: 255 }).notNull(),
  text: text("text").notNull(),
  attachmentUrls: json("attachmentUrls").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TaskComment = typeof taskComments.$inferSelect;
export type InsertTaskComment = typeof taskComments.$inferInsert;


// ============================================
// TOOLTIP FEEDBACK TABLE
// ============================================
// Speichert Bewertungen der Hilfe-Tooltips durch Mitarbeiter.
// Ein User kann pro helpTextKey genau eine Bewertung abgeben (upsert).
export const tooltipFeedback = mysqlTable("tooltipFeedback", {
  id: int("id").autoincrement().primaryKey(),
  helpTextKey: varchar("helpTextKey", { length: 100 }).notNull(),
  userId: int("userId").references(() => users.id).notNull(),
  rating: mysqlEnum("rating", ["helpful", "not_helpful"]).notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type TooltipFeedback = typeof tooltipFeedback.$inferSelect;
export type InsertTooltipFeedback = typeof tooltipFeedback.$inferInsert;


// ============================================
// GATE PHOTOS TABLE (Vorher/Nachher-Dokumentation Fotos)
// ============================================
// Speichert Fotos für die Qualitäts-Gates (Vorher-Doku, Nachher-Doku).
// Fotos werden in S3 gespeichert, hier nur Metadaten + URL.
export const gatePhotos = mysqlTable("gatePhotos", {
  id: int("id").autoincrement().primaryKey(),
  constructionSiteId: int("constructionSiteId").references(() => constructionSites.id).notNull(),
  gateType: mysqlEnum("gateType", ["vorher", "nachher"]).notNull(),
  photoUrl: text("photoUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(), // Auto-generiert: YYYY_Baustelle_Gate_NNN.jpg
  caption: text("caption"),
  uploadedById: int("uploadedById").references(() => users.id).notNull(),
  uploadedByName: varchar("uploadedByName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type GatePhoto = typeof gatePhotos.$inferSelect;
export type InsertGatePhoto = typeof gatePhotos.$inferInsert;


// ============================================
// BIBLIOTHEK – ZENTRALE STAMMDATEN-PLATTFORM
// Intention: Eine einzige Quelle der Wahrheit für alle modularen Bausteine
// ============================================

// --- LAGER & FUHRPARK ---

export const libraryVehicles = mysqlTable("libraryVehicles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // z.B. "Waschbus 1 - MAN TGE"
  vehicleType: mysqlEnum("vehicleType", [
    "waschbus",
    "dienstwagen",
    "poolfahrzeug",
    "anhaenger",
    "transporter"
  ]).notNull(),
  licensePlate: varchar("licensePlate", { length: 20 }),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  year: int("year"),
  capacity: varchar("capacity", { length: 100 }), // z.B. "3,5t" oder "5 Personen"
  tuevDate: timestamp("tuevDate"),
  insuranceExpiry: timestamp("insuranceExpiry"),
  mileage: int("mileage"),
  fuelType: mysqlEnum("fuelType", ["diesel", "benzin", "elektro", "hybrid"]),
  dailyCost: decimal("dailyCost", { precision: 10, scale: 2 }),
  assignedTo: varchar("assignedTo", { length: 255 }), // Zugewiesener Mitarbeiter/Team
  notes: text("notes"),
  documents: json("documents").$type<{ name: string; url: string; type: string }[]>(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  status: mysqlEnum("status", ["aktiv", "inaktiv", "werkstatt", "verkauft"]).default("aktiv").notNull(),
  createdBy: int("createdBy").references(() => users.id),
  updatedBy: int("updatedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LibraryVehicle = typeof libraryVehicles.$inferSelect;
export type InsertLibraryVehicle = typeof libraryVehicles.$inferInsert;

export const libraryEquipment = mysqlTable("libraryEquipment", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // z.B. "Hubsteiger 18m"
  equipmentType: mysqlEnum("equipmentType", [
    "gelenkteleskop",
    "teleskop",
    "scherenlift",
    "anhaengerlift",
    "hochdruckreiniger",
    "sprühgeraet",
    "sonstiges"
  ]).notNull(),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  maxHeight: decimal("maxHeight", { precision: 5, scale: 1 }), // in Metern
  maxReach: decimal("maxReach", { precision: 5, scale: 1 }),
  weight: decimal("weight", { precision: 8, scale: 0 }), // in kg
  ownership: mysqlEnum("ownership", ["eigen", "miete", "dauermiete", "leasing"]).default("eigen"),
  dailyRate: decimal("dailyRate", { precision: 10, scale: 2 }), // Tagespreis in €
  purchasePrice: decimal("purchasePrice", { precision: 10, scale: 2 }),
  inspectionDate: timestamp("inspectionDate"), // Nächste UVV-Prüfung
  serialNumber: varchar("serialNumber", { length: 100 }),
  description: text("description"),
  notes: text("notes"),
  documents: json("documents").$type<{ name: string; url: string; type: string }[]>(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  status: mysqlEnum("status", ["aktiv", "inaktiv", "wartung", "defekt"]).default("aktiv").notNull(),
  createdBy: int("createdBy").references(() => users.id),
  updatedBy: int("updatedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LibraryEquipment = typeof libraryEquipment.$inferSelect;
export type InsertLibraryEquipment = typeof libraryEquipment.$inferInsert;

export const libraryCleaningAgents = mysqlTable("libraryCleaningAgents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // z.B. "FassadenFix Pro"
  articleNumber: varchar("articleNumber", { length: 50 }),
  applicationArea: text("applicationArea"), // z.B. "WDVS, Putz – Algen, Moos, Flechten"
  containerSize: varchar("containerSize", { length: 50 }), // z.B. "25 Liter"
  purchasePrice: decimal("purchasePrice", { precision: 10, scale: 2 }),
  sellingPrice: decimal("sellingPrice", { precision: 10, scale: 2 }),
  coveragePerLiter: varchar("coveragePerLiter", { length: 100 }), // z.B. "ca. 5-8 m²/Liter"
  safetyDataSheetUrl: text("safetyDataSheetUrl"),
  supplier: varchar("supplier", { length: 255 }),
  minStock: int("minStock"), // Mindestbestand
  currentStock: int("currentStock"),
  description: text("description"),
  notes: text("notes"),
  documents: json("documents").$type<{ name: string; url: string; type: string }[]>(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  status: mysqlEnum("status", ["aktiv", "inaktiv", "auslaufend"]).default("aktiv").notNull(),
  createdBy: int("createdBy").references(() => users.id),
  updatedBy: int("updatedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LibraryCleaningAgent = typeof libraryCleaningAgents.$inferSelect;
export type InsertLibraryCleaningAgent = typeof libraryCleaningAgents.$inferInsert;

// --- MARKETING & VERTRIEB ---

export const libraryDiscounts = mysqlTable("libraryDiscounts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // z.B. "Frühbucher-Rabatt Saison 2026"
  discountType: mysqlEnum("discountType", [
    "preisstaffel",
    "fruehbucher",
    "mengenrabatt",
    "treuerabatt",
    "kennenlern",
    "aktion",
    "sonstiges"
  ]).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }), // z.B. 5.00 für 5%
  absoluteAmount: decimal("absoluteAmount", { precision: 10, scale: 2 }), // Alternativ: Festbetrag
  conditions: text("conditions"), // z.B. "Beauftragung bis 31.12.2025"
  validFrom: timestamp("validFrom"),
  validUntil: timestamp("validUntil"),
  stoererText: text("stoererText"), // Text für den Störer im Angebot
  stoererSubtext: text("stoererSubtext"),
  minFlaeche: int("minFlaeche"), // Mindestfläche für Preisstaffel
  maxFlaeche: int("maxFlaeche"), // Maximalfläche für Preisstaffel
  pricePerSqm: decimal("pricePerSqm", { precision: 10, scale: 2 }), // €/m² für Preisstaffel
  combinable: boolean("combinable").default(true), // Mit anderen Rabatten kombinierbar?
  code: varchar("code", { length: 50 }), // Aktionscode
  description: text("description"),
  notes: text("notes"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  status: mysqlEnum("status", ["aktiv", "inaktiv", "abgelaufen"]).default("aktiv").notNull(),
  createdBy: int("createdBy").references(() => users.id),
  updatedBy: int("updatedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LibraryDiscount = typeof libraryDiscounts.$inferSelect;
export type InsertLibraryDiscount = typeof libraryDiscounts.$inferInsert;

// --- LEISTUNGEN & TECHNIK ---

export const libraryServices = mysqlTable("libraryServices", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // z.B. "Fassadenreinigung Standard"
  serviceType: mysqlEnum("serviceType", [
    "hauptleistung",
    "zusatzleistung",
    "garantie",
    "wartung",
    "inspektion"
  ]).notNull(),
  description: text("description"),
  scope: text("scope"), // Leistungsumfang
  duration: varchar("duration", { length: 100 }), // z.B. "5 Jahre" für Garantie
  basePrice: decimal("basePrice", { precision: 10, scale: 2 }),
  pricingUnit: varchar("pricingUnit", { length: 50 }), // z.B. "pro m²", "pauschal", "pro Tag"
  includedInOffer: boolean("includedInOffer").default(true), // Standardmäßig im Angebot?
  notes: text("notes"),
  documents: json("documents").$type<{ name: string; url: string; type: string }[]>(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  status: mysqlEnum("status", ["aktiv", "inaktiv"]).default("aktiv").notNull(),
  createdBy: int("createdBy").references(() => users.id),
  updatedBy: int("updatedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LibraryService = typeof libraryServices.$inferSelect;
export type InsertLibraryService = typeof libraryServices.$inferInsert;

// --- HR & PERSONAL ---

export const libraryWorkClothing = mysqlTable("libraryWorkClothing", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // z.B. "Sicherheitsschuhe S3"
  clothingType: mysqlEnum("clothingType", [
    "oberteil",
    "hose",
    "schuhe",
    "handschuhe",
    "helm",
    "brille",
    "gehoerschutz",
    "weste",
    "regenkleidung",
    "sonstiges"
  ]).notNull(),
  size: varchar("size", { length: 20 }), // z.B. "XL", "44"
  supplier: varchar("supplier", { length: 255 }),
  articleNumber: varchar("articleNumber", { length: 50 }),
  purchasePrice: decimal("purchasePrice", { precision: 10, scale: 2 }),
  minStock: int("minStock"),
  currentStock: int("currentStock"),
  isPSA: boolean("isPSA").default(false), // Persönliche Schutzausrüstung?
  certificationRequired: boolean("certificationRequired").default(false),
  description: text("description"),
  notes: text("notes"),
  documents: json("documents").$type<{ name: string; url: string; type: string }[]>(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  status: mysqlEnum("status", ["aktiv", "inaktiv", "bestellt"]).default("aktiv").notNull(),
  createdBy: int("createdBy").references(() => users.id),
  updatedBy: int("updatedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LibraryWorkClothing = typeof libraryWorkClothing.$inferSelect;
export type InsertLibraryWorkClothing = typeof libraryWorkClothing.$inferInsert;

export const libraryAssets = mysqlTable("libraryAssets", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // z.B. "Laptop Dell Latitude 5540"
  assetType: mysqlEnum("assetType", [
    "laptop",
    "smartphone",
    "tablet",
    "schluessel",
    "tankkarte",
    "kreditkarte",
    "werkzeug",
    "sonstiges"
  ]).notNull(),
  serialNumber: varchar("serialNumber", { length: 100 }),
  inventoryNumber: varchar("inventoryNumber", { length: 50 }),
  manufacturer: varchar("manufacturer", { length: 100 }),
  model: varchar("model", { length: 100 }),
  purchaseDate: timestamp("purchaseDate"),
  purchasePrice: decimal("purchasePrice", { precision: 10, scale: 2 }),
  warrantyUntil: timestamp("warrantyUntil"),
  assignedToMemberId: int("assignedToMemberId").references(() => teamMembers.id),
  assignedToName: varchar("assignedToName", { length: 255 }),
  assignedAt: timestamp("assignedAt"),
  cardNumber: varchar("cardNumber", { length: 50 }), // Für Tankkarten/Kreditkarten
  pin: varchar("pin", { length: 10 }), // Verschlüsselt speichern in Produktion
  description: text("description"),
  notes: text("notes"),
  documents: json("documents").$type<{ name: string; url: string; type: string }[]>(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  status: mysqlEnum("status", ["aktiv", "inaktiv", "verloren", "defekt", "zurueckgegeben"]).default("aktiv").notNull(),
  createdBy: int("createdBy").references(() => users.id),
  updatedBy: int("updatedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type LibraryAsset = typeof libraryAssets.$inferSelect;
export type InsertLibraryAsset = typeof libraryAssets.$inferInsert;

// ============================================
// TEXTBAUSTEINE TABLE (Angebots-Textvorlagen)
// ============================================
export const textbausteine = mysqlTable("textbausteine", {
  id: int("id").autoincrement().primaryKey(),
  kategorie: mysqlEnum("kategorie", ["anschreiben", "bedingungen", "fussnoten", "leistungsbeschreibung", "sonstiges"]).notNull(),
  titel: varchar("titel", { length: 255 }).notNull(),
  inhalt: text("inhalt").notNull(),
  sortierung: int("sortierung").default(0).notNull(),
  aktiv: boolean("aktiv").default(true).notNull(),
  tags: json("tags").$type<string[]>(),
  createdBy: int("createdBy").references(() => users.id),
  updatedBy: int("updatedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Textbaustein = typeof textbausteine.$inferSelect;
export type InsertTextbaustein = typeof textbausteine.$inferInsert;


// ============================================
// HR & PERSONAL (Personio-Daten)
// Absicht: Leitungsebene soll jederzeit zentral
// auf alle Personalinformationen zugreifen können
// ============================================
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  personioId: int("personioId").unique(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }),
  gender: varchar("gender", { length: 20 }),
  status: mysqlEnum("status", ["active", "inactive", "onboarding", "leave"]).default("active").notNull(),
  position: varchar("position", { length: 200 }),
  department: varchar("department", { length: 100 }),
  office: varchar("office", { length: 100 }),
  supervisor: varchar("supervisor", { length: 200 }),
  employmentType: varchar("employmentType", { length: 50 }),
  weeklyWorkingHours: varchar("weeklyWorkingHours", { length: 10 }),
  hireDate: varchar("hireDate", { length: 20 }),
  contractEndDate: varchar("contractEndDate", { length: 20 }),
  terminationDate: varchar("terminationDate", { length: 20 }),
  terminationType: varchar("terminationType", { length: 50 }),
  probationPeriodEnd: varchar("probationPeriodEnd", { length: 20 }),
  lastWorkingDay: varchar("lastWorkingDay", { length: 20 }),
  subcompany: varchar("subcompany", { length: 200 }),
  fixSalary: varchar("fixSalary", { length: 20 }),
  fixSalaryInterval: varchar("fixSalaryInterval", { length: 20 }),
  hourlySalary: varchar("hourlySalary", { length: 20 }),
  workSchedule: varchar("workSchedule", { length: 200 }),
  profilePicture: text("profilePicture"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

export const employeeDocuments = mysqlTable("employee_documents", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employeeId").notNull().references(() => employees.id),
  filename: varchar("filename", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 500 }),
  mimeType: varchar("mimeType", { length: 100 }),
  sizeBytes: int("sizeBytes"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});
export type EmployeeDocument = typeof employeeDocuments.$inferSelect;
export type InsertEmployeeDocument = typeof employeeDocuments.$inferInsert;
