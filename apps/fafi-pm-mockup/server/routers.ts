import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { getWeatherForLocation, checkWeatherSuitability } from "./services/weather";
import { 
  fetchHubSpotContacts, 
  fetchHubSpotCompanies, 
  fetchHubSpotDeals,
  searchHubSpotDeals,
  getDealsForCompany,
  createHubSpotDeal,
  createHubSpotContact,
  createHubSpotCompany,
  createHubSpotEngagement,
  getHubSpotAccountInfo, 
  hubspotContactToLocal, 
  hubspotCompanyToLocal,
  getSyncStatus,
  startAutoSync,
  stopAutoSync,
  getAutoSyncStatus,
} from "./services/hubspot";
import { sendOfferEmail, sendOfferNotification, generateOfferEmailContent } from "./services/email";
import { advanceProjectPhase, tryAutoAdvance, getWorkflowStatus } from "./workflow/stateMachine";
import { AdvancePhaseInputSchema, ProjectPhaseEnum, getAllowedTransitions, getPhaseMetadata, PHASE_METADATA } from "../shared/schemas/workflow";
import type { ProjectPhase } from "../shared/schemas/workflow";

// ============================================
// COMPANY ROUTER
// ============================================
const companyRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllCompanies();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getCompanyById(input.id);
    }),
  
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return db.searchCompanies(input.query);
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      category: z.enum(["wohnungsgesellschaft", "hausverwaltung", "privatperson", "gewerbe", "oeffentlich"]).optional(),
      street: z.string().optional(),
      postalCode: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().optional(),
      notes: z.string().optional(),
      hubspotId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const company = await db.createCompany(input);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'company',
        entityId: company.id,
        entityName: company.name,
        details: 'Unternehmen erstellt'
      });
      return company;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      category: z.enum(["wohnungsgesellschaft", "hausverwaltung", "privatperson", "gewerbe", "oeffentlich"]).optional(),
      street: z.string().optional(),
      postalCode: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const company = await db.updateCompany(id, data);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'updated',
        entityType: 'company',
        entityId: id,
        entityName: company?.name,
        details: 'Unternehmen aktualisiert'
      });
      return company;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const company = await db.getCompanyById(input.id);
      await db.deleteCompany(input.id);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'deleted',
        entityType: 'company',
        entityId: input.id,
        entityName: company?.name,
        details: 'Unternehmen gelöscht'
      });
      return { success: true };
    }),
});

// ============================================
// CONTACT ROUTER
// ============================================
const contactRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllContacts();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getContactById(input.id);
    }),
  
  getByCompanyId: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      return db.getContactsByCompanyId(input.companyId);
    }),

  listOrphaned: protectedProcedure.query(async () => {
    return db.getOrphanedContacts();
  }),

  assignToCompany: protectedProcedure
    .input(z.object({ contactId: z.number(), companyId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const contact = await db.assignContactToCompany(input.contactId, input.companyId);
      if (contact) {
        await db.createActivityLog({
          userId: ctx.user.id,
          userName: ctx.user.name || 'Unbekannt',
          action: 'updated',
          entityType: 'contact',
          entityId: input.contactId,
          entityName: `${contact.firstName || ''} ${contact.lastName}`.trim(),
          details: `Verwaister Kontakt dem Unternehmen zugeordnet`
        });
      }
      return contact;
    }),

  create: protectedProcedure
    .input(z.object({
      companyId: z.number().optional(),
      salutation: z.enum(["herr", "frau", "divers"]).optional(),
      firstName: z.string().optional(),
      lastName: z.string().min(1),
      position: z.string().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      email: z.string().email().optional(),
      isPrimary: z.boolean().optional(),
      notes: z.string().optional(),
      hubspotId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const contact = await db.createContact(input);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'contact',
        entityId: contact.id,
        entityName: `${contact.firstName || ''} ${contact.lastName}`.trim(),
        details: 'Kontakt erstellt'
      });
      return contact;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      companyId: z.number().optional(),
      salutation: z.enum(["herr", "frau", "divers"]).optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      position: z.string().optional(),
      phone: z.string().optional(),
      mobile: z.string().optional(),
      email: z.string().email().optional(),
      isPrimary: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const contact = await db.updateContact(id, data);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'updated',
        entityType: 'contact',
        entityId: id,
        entityName: contact ? `${contact.firstName || ''} ${contact.lastName}`.trim() : undefined,
        details: 'Kontakt aktualisiert'
      });
      return contact;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const contact = await db.getContactById(input.id);
      await db.deleteContact(input.id);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'deleted',
        entityType: 'contact',
        entityId: input.id,
        entityName: contact ? `${contact.firstName || ''} ${contact.lastName}`.trim() : undefined,
        details: 'Kontakt gelöscht'
      });
      return { success: true };
    }),
});

// ============================================
// PROJECT ROUTER
// ============================================
const projectRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllProjects();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getProjectById(input.id);
    }),

  getWithRelations: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getProjectWithRelations(input.id);
    }),
  
  getByNumber: protectedProcedure
    .input(z.object({ projectNumber: z.string() }))
    .query(async ({ input }) => {
      return db.getProjectByNumber(input.projectNumber);
    }),
  
  getByPhase: protectedProcedure
    .input(z.object({ phase: z.string() }))
    .query(async ({ input }) => {
      return db.getProjectsByPhase(input.phase);
    }),
  
  getByCompanyId: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      return db.getProjectsByCompanyId(input.companyId);
    }),
  
  generateNumber: protectedProcedure
    .input(z.object({ companyShortName: z.string() }))
    .mutation(async ({ input }) => {
      return db.generateProjectNumber(input.companyShortName);
    }),
  
  create: protectedProcedure
    .input(z.object({
      projectNumber: z.string().min(1),
      name: z.string().min(1),
      companyId: z.number().optional(),
      contactId: z.number().optional(),
      phase: z.enum([
        "objektaufnahme", "angebot_erstellt", "angebot_versendet", "nachfassen",
        "auftrag_gewonnen", "planung", "vorbereitung", "durchfuehrung",
        "abnahme", "abgeschlossen", "verloren"
      ]).optional(),
      totalArea: z.string().optional(),
      propertyCount: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      kundenberaterId: z.number().optional(),
      projektleiterId: z.number().optional(),
      notes: z.string().optional(),
      hubspotDealId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.createProject(input);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'project',
        entityId: project.id,
        entityName: project.name,
        details: `Projekt ${project.projectNumber} erstellt`
      });
      return project;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      companyId: z.number().optional(),
      contactId: z.number().optional(),
      phase: z.enum([
        "objektaufnahme", "angebot_erstellt", "angebot_versendet", "nachfassen",
        "auftrag_gewonnen", "planung", "vorbereitung", "durchfuehrung",
        "abnahme", "abgeschlossen", "verloren"
      ]).optional(),
      totalArea: z.string().optional(),
      propertyCount: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      progress: z.number().min(0).max(100).optional(),
      kundenberaterId: z.number().optional(),
      projektleiterId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const oldProject = await db.getProjectById(id);
      
      // Phase 0b: Phasen-Validierung – keine willkürlichen Sprünge erlauben
      if (data.phase && oldProject?.phase && oldProject.phase !== data.phase) {
        const { isTransitionAllowed: isAllowed } = await import('../shared/schemas/workflow');
        if (!isAllowed(oldProject.phase as ProjectPhase, data.phase as ProjectPhase)) {
          const fromMeta = getPhaseMetadata(oldProject.phase as ProjectPhase);
          const toMeta = getPhaseMetadata(data.phase as ProjectPhase);
          const allowed = getAllowedTransitions(oldProject.phase as ProjectPhase);
          const allowedLabels = allowed.map(t => t.label).join(', ');
          throw new Error(
            `Ungültiger Phasenübergang: "${fromMeta?.label || oldProject.phase}" → "${toMeta?.label || data.phase}" ist nicht erlaubt. ` +
            `Erlaubte Übergänge: ${allowedLabels || 'keine'}. ` +
            `Nutzen Sie die Workflow-Funktion für validierte Phasenübergänge.`
          );
        }
      }
      
      const project = await db.updateProject(id, data);
      
      // Log phase change specifically
      if (data.phase && oldProject?.phase !== data.phase) {
        await db.createActivityLog({
          userId: ctx.user.id,
          userName: ctx.user.name || 'Unbekannt',
          action: 'status_changed',
          entityType: 'project',
          entityId: id,
          entityName: project?.name,
          details: `Phase geändert: ${oldProject?.phase} → ${data.phase}`
        });
      } else {
        await db.createActivityLog({
          userId: ctx.user.id,
          userName: ctx.user.name || 'Unbekannt',
          action: 'updated',
          entityType: 'project',
          entityId: id,
          entityName: project?.name,
          details: 'Projekt aktualisiert'
        });
      }
      return project;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const project = await db.getProjectById(input.id);
      await db.deleteProject(input.id);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'deleted',
        entityType: 'project',
        entityId: input.id,
        entityName: project?.name,
        details: 'Projekt gelöscht'
      });
      return { success: true };
    }),

  // ============================================
  // WORKFLOW: Phasenübergänge (Phase 0a/0b)
  // ============================================
  
  /**
   * Validierter Phasenübergang über die State-Machine.
   * Prüft Guards (DB-Voraussetzungen) und erstellt History + Activity-Log.
   */
  advancePhase: protectedProcedure
    .input(AdvancePhaseInputSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await advanceProjectPhase(
        input.projectId,
        input.targetPhase,
        input.trigger,
        ctx.user.id,
        input.reason,
      );
      return result;
    }),

  /**
   * Gibt den Workflow-Status eines Projekts zurück:
   * aktuelle Phase, erlaubte Übergänge, Guard-Status, nächster Schritt.
   */
  getWorkflowStatus: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return getWorkflowStatus(input.projectId);
    }),

  /**
   * Gibt die nächsten Schritte für alle aktiven Projekte zurück.
   * Für das Dashboard "Nächste Schritte" Widget.
   */
  getNextSteps: protectedProcedure.query(async () => {
    const allProjects = await db.getAllProjects();
    const activeProjects = allProjects.filter(
      (p) => p.phase !== 'abgeschlossen' && p.phase !== 'verloren'
    );
    
    const nextSteps = await Promise.all(
      activeProjects.map(async (project) => {
        const status = await getWorkflowStatus(project.id);
        if (!status) return null;
        
        const metadata = getPhaseMetadata(project.phase as ProjectPhase);
        
        return {
          projectId: project.id,
          projectName: project.name,
          projectNumber: project.projectNumber,
          currentPhase: project.phase,
          phaseLabel: metadata?.label ?? project.phase,
          phaseColor: metadata?.color ?? '#6b7280',
          nextStepLabel: metadata?.nextStepLabel ?? '',
          nextStepRoute: metadata?.nextStepRoute(project.id) ?? '',
          companyName: null as string | null, // Wird später mit Join gefüllt
          allowedTransitions: status.allowedTransitions.filter(t => t.guardPassed),
          startDate: project.startDate,
          endDate: project.endDate,
        };
      })
    );
    
    return nextSteps.filter(Boolean);
  }),

  /**
   * Gibt alle Phasen-Metadaten zurück (für Frontend-Anzeige).
   */
  getPhaseMetadata: protectedProcedure.query(() => {
    return PHASE_METADATA;
  }),

  // v7.3: Ampel-Status für ein Projekt
  getAmpelStatus: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const { calculateProjectAmpel } = await import("./services/ampelSystem");
      const project = await db.getProjectById(input.projectId);
      if (!project) return { status: "green" as const, reasons: ["Projekt nicht gefunden"], overdueTasks: 0, pendingTasks: 0, blockers: [] };
      const tasks = await db.getTasksByProjectId(input.projectId);
      return calculateProjectAmpel(
        { id: project.id, phase: project.phase, startDate: project.startDate, endDate: project.endDate, progress: project.progress ?? 0 },
        tasks.map(t => ({ id: t.id, title: t.title, status: t.status, dueDate: t.dueDate, priority: t.priority }))
      );
    }),

  // v7.3: Ampel-Zusammenfassung für alle Projekte (Dashboard)
  getAmpelSummary: protectedProcedure.query(async () => {
    const { calculateProjectAmpel } = await import("./services/ampelSystem");
    const projects = await db.getAllProjects();
    let green = 0, yellow = 0, red = 0;
    for (const p of projects) {
      if (p.phase === "abgeschlossen" || p.phase === "verloren") continue;
      const tasks = await db.getTasksByProjectId(p.id);
      const ampel = calculateProjectAmpel(
        { id: p.id, phase: p.phase, startDate: p.startDate, endDate: p.endDate, progress: p.progress ?? 0 },
        tasks.map(t => ({ id: t.id, title: t.title, status: t.status, dueDate: t.dueDate, priority: t.priority }))
      );
      if (ampel.status === "green") green++;
      else if (ampel.status === "yellow") yellow++;
      else red++;
    }
    return { green, yellow, red, total: green + yellow + red };
  }),

  // Immobilie einem Projekt zuordnen
  assignProperty: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      propertyId: z.number(),
      role: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { eq, and } = await import('drizzle-orm');
      const { projectProperties } = await import('../drizzle/schema');
      const { TRPCError } = await import('@trpc/server');
      const database = await db.getDb();
      if (!database) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'DB nicht verfügbar' });
      // Prüfe ob Zuordnung bereits existiert
      const existing = await database.select().from(projectProperties)
        .where(and(
          eq(projectProperties.projectId, input.projectId),
          eq(projectProperties.propertyId, input.propertyId)
        ));
      if (existing.length > 0) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Immobilie ist bereits diesem Projekt zugeordnet' });
      }
      await database.insert(projectProperties).values({
        projectId: input.projectId,
        propertyId: input.propertyId,
        role: input.role || 'primary',
      });
      const property = await db.getPropertyById(input.propertyId);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'property',
        entityId: input.propertyId,
        entityName: property?.name,
        details: `Immobilie dem Projekt zugeordnet`
      });
      return { success: true };
    }),

  // Immobilie von Projekt entfernen
  removeProperty: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      propertyId: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { eq, and } = await import('drizzle-orm');
      const { projectProperties } = await import('../drizzle/schema');
      const database = await db.getDb();
      if (!database) return { success: false };
      await database.delete(projectProperties)
        .where(and(
          eq(projectProperties.projectId, input.projectId),
          eq(projectProperties.propertyId, input.propertyId)
        ));
      return { success: true };
    }),
});

// ============================================
// PROPERTY ROUTER
// ============================================
const subAreaSchema = z.object({
  width: z.number(),
  height: z.number(),
  area: z.number(),
  note: z.string(),
});

const facadeSideSchema = z.object({
  area: z.number(),
  facadeType: z.string(),
  cleanable: z.boolean(),
  notCleanableReason: z.string().optional(),
  notes: z.string().optional(),
  // Loom-Feedback: Teilflächen für unterbrochene Fassaden
  hasSubAreas: z.boolean().optional(),
  subAreas: z.array(subAreaSchema).optional(),
}).optional();

const propertyRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllProperties();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getPropertyById(input.id);
    }),
  
  getByProjectId: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.getPropertiesByProjectId(input.projectId);
    }),
  
  getByConstructionSiteId: protectedProcedure
    .input(z.object({ constructionSiteId: z.number() }))
    .query(async ({ input }) => {
      return db.getPropertiesByConstructionSiteId(input.constructionSiteId);
    }),
  
  create: protectedProcedure
    .input(z.object({
      projectId: z.number().optional(),
      constructionSiteId: z.number().optional(),
      name: z.string().min(1),
      street: z.string().optional(),
      postalCode: z.string().optional(),
      city: z.string().optional(),
      frontSide: facadeSideSchema,
      backSide: facadeSideSchema,
      leftGable: facadeSideSchema,
      rightGable: facadeSideSchema,
      totalCleanableArea: z.string().optional(),
      specialFeatures: z.array(z.string()).optional(),
      accessNotes: z.string().optional(),
      photos: z.array(z.object({
        url: z.string(),
        category: z.string(),
        side: z.string().optional(),
        caption: z.string().optional(),
        uploadedAt: z.string(),
      })).optional(),
      satelliteImageUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Nr.39: Duplikat-Erkennung bei Immobilien (gleiche Adresse warnen)
      if (input.street) {
        const allProperties = await db.getAllProperties();
        const duplicate = allProperties.find(p => 
          p.street && p.street.toLowerCase().trim() === input.street!.toLowerCase().trim() &&
          p.city && input.city && p.city.toLowerCase().trim() === input.city.toLowerCase().trim()
        );
        if (duplicate) {
          // Warnung als Teil der Antwort, aber nicht blockierend
          const property = await db.createProperty(input);
          await db.createActivityLog({
            userId: ctx.user.id,
            userName: ctx.user.name || 'Unbekannt',
            action: 'created',
            entityType: 'property',
            entityId: property.id,
            entityName: property.name,
            details: `Immobilie erstellt (mögliches Duplikat von ${duplicate.name})`
          });
          return { ...property, duplicateWarning: `Mögliches Duplikat: ${duplicate.name} (${duplicate.street}, ${duplicate.city})` };
        }
      }
      const property = await db.createProperty(input);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'property',
        entityId: property.id,
        entityName: property.name,
        details: 'Immobilie erstellt'
      });
      return property;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      projectId: z.number().optional(),
      constructionSiteId: z.number().optional(),
      name: z.string().optional(),
      street: z.string().optional(),
      postalCode: z.string().optional(),
      city: z.string().optional(),
      frontSide: facadeSideSchema,
      backSide: facadeSideSchema,
      leftGable: facadeSideSchema,
      rightGable: facadeSideSchema,
      totalCleanableArea: z.string().optional(),
      specialFeatures: z.array(z.string()).optional(),
      accessNotes: z.string().optional(),
      photos: z.array(z.object({
        url: z.string(),
        category: z.string(),
        side: z.string().optional(),
        caption: z.string().optional(),
        uploadedAt: z.string(),
      })).optional(),
      satelliteImageUrl: z.string().optional(),
      companyId: z.number().nullable().optional(),
      isDraft: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const property = await db.updateProperty(id, data);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'updated',
        entityType: 'property',
        entityId: id,
        entityName: property?.name,
        details: 'Immobilie aktualisiert'
      });
      return property;
    }),
  
  // Entwurfs-Funktionen
  saveDraft: protectedProcedure
    .input(z.object({
      id: z.number().optional(), // Falls bestehender Entwurf aktualisiert wird
      projectId: z.number().optional(),
      name: z.string().min(1),
      street: z.string().optional(),
      postalCode: z.string().optional(),
      city: z.string().optional(),
      frontSide: facadeSideSchema,
      backSide: facadeSideSchema,
      leftGable: facadeSideSchema,
      rightGable: facadeSideSchema,
      totalCleanableArea: z.string().optional(),
      specialFeatures: z.array(z.string()).optional(),
      accessNotes: z.string().optional(),
      photos: z.array(z.object({
        url: z.string(),
        category: z.string(),
        side: z.string().optional(),
        caption: z.string().optional(),
        uploadedAt: z.string(),
      })).optional(),
      satelliteImageUrl: z.string().optional(),
      wizardStep: z.number().optional(),
      wizardData: z.record(z.string(), z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (input.id) {
        // Bestehenden Entwurf aktualisieren
        const { id, ...data } = input;
        return db.updatePropertyDraft(id, data);
      } else {
        // Neuen Entwurf erstellen
        const draft = await db.savePropertyDraft(input);
        await db.createActivityLog({
          userId: ctx.user.id,
          userName: ctx.user.name || 'Unbekannt',
          action: 'created',
          entityType: 'property',
          entityId: draft.id,
          entityName: draft.name,
          details: 'Objektaufnahme-Entwurf gespeichert'
        });
        return draft;
      }
    }),

  finalizeDraft: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const property = await db.finalizeDraft(input.id);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'updated',
        entityType: 'property',
        entityId: input.id,
        entityName: property?.name,
        details: 'Objektaufnahme abgeschlossen'
      });
      return property;
    }),

  listDrafts: protectedProcedure
    .input(z.object({ projectId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      return db.getPropertyDrafts(input?.projectId);
    }),

  deleteDraft: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return db.deletePropertyDraft(input.id);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const property = await db.getPropertyById(input.id);
      await db.deleteProperty(input.id);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'deleted',
        entityType: 'property',
        entityId: input.id,
        entityName: property?.name,
        details: 'Immobilie gelöscht'
      });
      return { success: true };
    }),
});

// ============================================
// CONSTRUCTION SITE ROUTER
// ============================================
const constructionSiteRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllConstructionSites();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getConstructionSiteById(input.id);
    }),
  
  getByProjectId: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.getConstructionSitesByProjectId(input.projectId);
    }),
  
  getByStatus: protectedProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return db.getConstructionSitesByStatus(input.status);
    }),
  
  generateNumber: protectedProcedure.mutation(async () => {
    return db.generateConstructionSiteNumber();
  }),
  
  create: protectedProcedure
    .input(z.object({
      siteNumber: z.string().min(1),
      projectId: z.number(),
      orderId: z.number().optional(),
      offerId: z.number().optional(),
      name: z.string().min(1),
      address: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      status: z.enum(["geplant", "aktiv", "pausiert", "abgeschlossen"]).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      totalArea: z.string().optional(),
      projektleiterId: z.number().optional(),
      teamMembers: z.array(z.number()).optional(),
      equipment: z.array(z.string()).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const site = await db.createConstructionSite(input);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'construction_site',
        entityId: site.id,
        entityName: site.name,
        details: `Baustelle ${site.siteNumber} erstellt`
      });
      return site;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      address: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      status: z.enum(["geplant", "aktiv", "pausiert", "abgeschlossen"]).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      progress: z.number().min(0).max(100).optional(),
      totalArea: z.string().optional(),
      projektleiterId: z.number().optional(),
      teamMembers: z.array(z.number()).optional(),
      equipment: z.array(z.string()).optional(),
      weatherData: z.object({
        temp: z.number(),
        condition: z.string(),
        wind: z.number(),
        precipitation: z.number(),
        humidity: z.number(),
        updatedAt: z.string(),
      }).optional(),
      notes: z.string().optional(),
      preDocumentationStatus: z.enum(["pending", "in_progress", "completed"]).optional(),
      preDocumentationCompletedAt: z.date().optional(),
      postDocumentationStatus: z.enum(["pending", "in_progress", "completed"]).optional(),
      postDocumentationCompletedAt: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const oldSite = await db.getConstructionSiteById(id);
      const site = await db.updateConstructionSite(id, data);
      
      if (data.status && oldSite?.status !== data.status) {
        await db.createActivityLog({
          userId: ctx.user.id,
          userName: ctx.user.name || 'Unbekannt',
          action: 'status_changed',
          entityType: 'construction_site',
          entityId: id,
          entityName: site?.name,
          details: `Status geändert: ${oldSite?.status} → ${data.status}`
        });
        
        // v7.0b: Baustellenstart-Blockierung – Vorher-Doku muss abgeschlossen sein
        if (data.status === 'aktiv' && oldSite?.preDocumentationStatus !== 'completed') {
          throw new Error('Vorher-Dokumentation muss vor dem Baustellenstart abgeschlossen sein.');
        }
        
        // Phase 0a: Auto-Advance bei Baustellen-Start → Projekt auf "durchfuehrung"
        if (data.status === 'aktiv' && oldSite?.projectId) {
          try {
            await tryAutoAdvance(oldSite.projectId, 'durchfuehrung', ctx.user.id, `Baustelle ${site?.name || site?.siteNumber} gestartet`);
          } catch (e) {
            console.warn('[Workflow] Auto-Advance nach Baustellenstart fehlgeschlagen:', e);
          }
        }
      } else {
        await db.createActivityLog({
          userId: ctx.user.id,
          userName: ctx.user.name || 'Unbekannt',
          action: 'updated',
          entityType: 'construction_site',
          entityId: id,
          entityName: site?.name,
          details: 'Baustelle aktualisiert'
        });
      }
      return site;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const site = await db.getConstructionSiteById(input.id);
      await db.deleteConstructionSite(input.id);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'deleted',
        entityType: 'construction_site',
        entityId: input.id,
        entityName: site?.name,
        details: 'Baustelle gelöscht'
      });
      return { success: true };
    }),
  
  // Construction site logs
  getLogs: protectedProcedure
    .input(z.object({ constructionSiteId: z.number() }))
    .query(async ({ input }) => {
      return db.getConstructionSiteLogs(input.constructionSiteId);
    }),
  
  createLog: protectedProcedure
    .input(z.object({
      constructionSiteId: z.number(),
      logType: z.enum(["arbeitsbeginn", "fortschritt", "pause", "problem", "material", "arbeitsende", "wetter", "sicherheit", "kundenkontakt", "geraeteausfall", "sonstiges"]),
      entry: z.string().min(1),
      photos: z.array(z.string()).optional(),
      metadata: z.any().optional(),
      // v7.0c: Tagesablauf-Felder
      workDayStarted: z.date().optional(),
      workDayEnded: z.date().optional(),
      plannedAreas: z.array(z.string()).optional(),
      completedAreas: z.array(z.string()).optional(),
      planningOnTrack: z.boolean().optional(),
      planningDeviation: z.string().optional(),
      urgency: z.enum(["normal", "hoch", "kritisch"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const log = await db.createConstructionSiteLog({
        ...input,
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
      });
      
      // Bei kritischer Dringlichkeit: Benachrichtigung an GF/Büro
      if (input.urgency === 'kritisch') {
        try {
          const { createNotification } = await import('./services/notificationService');
          await createNotification({
            userId: ctx.user.id,
            type: 'task_due',
            title: `Kritisches Ereignis: ${input.logType}`,
            message: input.entry.substring(0, 200),
            priority: 'critical',
            entityType: 'construction_site',
            entityId: input.constructionSiteId,
          });
        } catch (e) {
          console.warn('[Notification] Kritische Benachrichtigung fehlgeschlagen:', e);
        }
      }

      // Auto-Archivierung: Bautagebuch-Eintrag im Archiv ablegen
      try {
        const { archiveBautagebuchEntry } = await import('./services/autoArchive');
        const site = await db.getConstructionSiteById(input.constructionSiteId);
        await archiveBautagebuchEntry({
          id: log.id,
          constructionSiteId: input.constructionSiteId,
          logType: input.logType,
          entry: input.entry,
          photos: input.photos || null,
          userName: ctx.user.name || 'Unbekannt',
          projectId: site?.projectId || null,
          loggedAt: new Date(),
        }, ctx.user.name || undefined);
      } catch (e) {
        console.warn('[AutoArchiv] Bautagebuch-Archivierung fehlgeschlagen:', e);
      }

      return log;
    }),
});

// ============================================
// OFFER ROUTER
// ============================================
const offerRouter = router({
  // Aggregierte Daten für den Angebots-Wizard
  getCompaniesForWizard: protectedProcedure.query(async () => {
    return db.getCompaniesForOfferWizard();
  }),

  list: protectedProcedure.query(async () => {
    return db.getAllOffers();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getOfferById(input.id);
    }),
  
  getByProjectId: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.getOffersByProjectId(input.projectId);
    }),
  
  getByStatus: protectedProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return db.getOffersByStatus(input.status);
    }),

  byPropertyId: protectedProcedure
    .input(z.object({ propertyId: z.number() }))
    .query(async ({ input }) => {
      return db.getOffersByPropertyId(input.propertyId);
    }),
  
  generateNumber: protectedProcedure.mutation(async () => {
    return db.generateOfferNumber();
  }),
  
  // Angebot aus Wizard speichern (mit Auto-Advance auf "angebot_erstellt")
  saveFromWizard: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      companyId: z.number(),
      contactId: z.number(),
      totalArea: z.number(),
      pricePerSqm: z.number(),
      basePrice: z.number(),
      discount: z.number(),
      discountReason: z.string().optional(),
      netTotal: z.number(),
      vatAmount: z.number(),
      grossTotal: z.number(),
      scaffoldingDays: z.number(),
      overnightStays: z.number(),
      distanceKm: z.number(),
      positions: z.any(),
      textBlocks: z.array(z.string()).optional(),
      customText: z.string().optional(),
      validUntil: z.date(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await db.saveOfferFromWizard({
        ...input,
        createdById: ctx.user.id,
      });
      
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'offer',
        entityId: result.id,
        entityName: result.offerNumber,
        details: `Angebot ${result.offerNumber} aus Wizard erstellt`,
      });
      
      // Phase 0a: Auto-Advance auf "angebot_erstellt" wenn Projekt in "objektaufnahme"
      try {
        await tryAutoAdvance(input.projectId, 'angebot_erstellt', ctx.user.id, `Angebot ${result.offerNumber} erstellt`);
      } catch (e) {
        console.warn('[Workflow] Auto-Advance nach Angebotserstellung fehlgeschlagen:', e);
      }
      
      return result;
    }),
  
  // Neue Version eines Angebots erstellen
  createVersion: protectedProcedure
    .input(z.object({ offerId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const newVersionId = await db.createOfferVersion(input.offerId);
      const newOffer = await db.getOfferById(newVersionId);
      
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'offer',
        entityId: newVersionId,
        entityName: newOffer?.offerNumber,
        details: `Neue Version ${newOffer?.version} erstellt`,
      });
      
      return { id: newVersionId, version: newOffer?.version };
    }),
  
  // Alle Versionen eines Angebots abrufen
  getVersions: protectedProcedure
    .input(z.object({ offerNumber: z.string() }))
    .query(async ({ input }) => {
      return db.getOfferVersions(input.offerNumber);
    }),
  
  create: protectedProcedure
    .input(z.object({
      offerNumber: z.string().min(1),
      version: z.number().optional(),
      projectId: z.number().optional(),
      companyId: z.number().optional(),
      contactId: z.number().optional(),
      status: z.enum(["entwurf", "erstellt", "versendet", "angenommen", "abgelehnt", "abgelaufen", "obsolet"]).optional(),
      totalArea: z.string().optional(),
      pricePerSqm: z.string().optional(),
      basePrice: z.string().optional(),
      discount: z.string().optional(),
      discountReason: z.string().optional(),
      travelCosts: z.string().optional(),
      netTotal: z.string().optional(),
      vatRate: z.string().optional(),
      vatAmount: z.string().optional(),
      grossTotal: z.string().optional(),
      scaffoldingDays: z.number().optional(),
      overnightStays: z.number().optional(),
      distanceKm: z.number().optional(),
      positions: z.array(z.object({
        propertyId: z.number(),
        propertyName: z.string(),
        sides: z.array(z.object({
          name: z.string(),
          area: z.number(),
          pricePerSqm: z.number(),
          total: z.number(),
        })),
        subtotal: z.number(),
      })).optional(),
      textBlocks: z.array(z.string()).optional(),
      customText: z.string().optional(),
      validUntil: z.date().optional(),
      pdfUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const offer = await db.createOffer({
        ...input,
        createdById: ctx.user.id,
      });
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'offer',
        entityId: offer.id,
        entityName: offer.offerNumber,
        details: `Angebot ${offer.offerNumber} erstellt`
      });
      return offer;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["entwurf", "erstellt", "versendet", "angenommen", "abgelehnt", "abgelaufen", "obsolet"]).optional(),
      totalArea: z.string().optional(),
      pricePerSqm: z.string().optional(),
      basePrice: z.string().optional(),
      discount: z.string().optional(),
      discountReason: z.string().optional(),
      travelCosts: z.string().optional(),
      netTotal: z.string().optional(),
      vatRate: z.string().optional(),
      vatAmount: z.string().optional(),
      grossTotal: z.string().optional(),
      scaffoldingDays: z.number().optional(),
      overnightStays: z.number().optional(),
      distanceKm: z.number().optional(),
      positions: z.array(z.object({
        propertyId: z.number(),
        propertyName: z.string(),
        sides: z.array(z.object({
          name: z.string(),
          area: z.number(),
          pricePerSqm: z.number(),
          total: z.number(),
        })),
        subtotal: z.number(),
      })).optional(),
      textBlocks: z.array(z.string()).optional(),
      customText: z.string().optional(),
      validUntil: z.date().optional(),
      sentAt: z.date().optional(),
      acceptedAt: z.date().optional(),
      pdfUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const oldOffer = await db.getOfferById(id);
      const offer = await db.updateOffer(id, data);
      
      if (data.status && oldOffer?.status !== data.status) {
        await db.createActivityLog({
          userId: ctx.user.id,
          userName: ctx.user.name || 'Unbekannt',
          action: data.status === 'versendet' ? 'sent' : 'status_changed',
          entityType: 'offer',
          entityId: id,
          entityName: offer?.offerNumber,
          details: `Status geändert: ${oldOffer?.status} → ${data.status}`
        });
      } else {
        await db.createActivityLog({
          userId: ctx.user.id,
          userName: ctx.user.name || 'Unbekannt',
          action: 'updated',
          entityType: 'offer',
          entityId: id,
          entityName: offer?.offerNumber,
          details: 'Angebot aktualisiert'
        });
      }
      
      // Auto-Archiv: Wenn pdfUrl gesetzt wird, automatisch im Archiv ablegen
      if (data.pdfUrl && offer) {
        try {
          const { archiveOfferPdf } = await import('./services/autoArchive');
          await archiveOfferPdf({
            id: offer.id,
            offerNumber: offer.offerNumber,
            projectId: offer.projectId,
            companyId: offer.companyId,
            pdfUrl: data.pdfUrl,
          }, ctx.user.name || 'Unbekannt');
        } catch (e) {
          console.warn('[AutoArchiv] Angebots-PDF Archivierung fehlgeschlagen:', e);
        }
      }
      
      return offer;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const offer = await db.getOfferById(input.id);
      await db.deleteOffer(input.id);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'deleted',
        entityType: 'offer',
        entityId: input.id,
        entityName: offer?.offerNumber,
        details: 'Angebot gelöscht'
      });
      return { success: true };
    }),
});

// ============================================
// TASK ROUTER
// ============================================
const taskRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllTasks();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getTaskById(input.id);
    }),
  
  getByProjectId: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.getTasksByProjectId(input.projectId);
    }),
  
  getByAssignedUserId: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return db.getTasksByAssignedUserId(input.userId);
    }),
  
  getOverdue: protectedProcedure.query(async () => {
    return db.getOverdueTasks();
  }),
  
  getOverdueWithEscalation: protectedProcedure.query(async () => {
    return db.getOverdueTasksWithEscalation();
  }),
  
  getMyTasks: protectedProcedure.query(async ({ ctx }) => {
    return db.getMyTasks(ctx.user.id, ctx.user.role || undefined);
  }),
  
  create: protectedProcedure
    .input(z.object({
      projectId: z.number().optional(),
      constructionSiteId: z.number().optional(),
      title: z.string().min(1),
      description: z.string().optional(),
      status: z.enum(["offen", "in_bearbeitung", "erledigt", "abgebrochen"]).optional(),
      priority: z.enum(["niedrig", "normal", "hoch", "dringend"]).optional(),
      dueDate: z.date().optional(),
      assignedToId: z.number().optional(),
      assignedRole: z.string().optional(),
      responsibleParty: z.enum(["auftraggeber", "auftragnehmer"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const task = await db.createTask({
        ...input,
        createdById: ctx.user.id,
      });
      
      // Create notification for assigned user
      if (input.assignedToId) {
        await db.createNotification({
          userId: input.assignedToId,
          type: 'task_assigned',
          title: 'Neue Aufgabe zugewiesen',
          message: task.title,
          entityType: 'task',
          entityId: task.id,
        });
      }
      
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'task',
        entityId: task.id,
        entityName: task.title,
        details: 'Aufgabe erstellt'
      });
      return task;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["offen", "in_bearbeitung", "erledigt", "abgebrochen"]).optional(),
      priority: z.enum(["niedrig", "normal", "hoch", "dringend"]).optional(),
      dueDate: z.date().optional(),
      assignedToId: z.number().optional(),
      assignedRole: z.string().optional(),
      responsibleParty: z.enum(["auftraggeber", "auftragnehmer"]).optional(),
      completedAt: z.date().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const oldTask = await db.getTaskById(id);
      
      // Auto-set completedAt when status changes to erledigt
      if (data.status === 'erledigt' && !data.completedAt) {
        data.completedAt = new Date();
      }
      
      const task = await db.updateTask(id, data);
      
      if (data.status === 'erledigt' && oldTask?.status !== 'erledigt') {
        await db.createActivityLog({
          userId: ctx.user.id,
          userName: ctx.user.name || 'Unbekannt',
          action: 'completed',
          entityType: 'task',
          entityId: id,
          entityName: task?.title,
          details: 'Aufgabe abgeschlossen'
        });
      } else {
        await db.createActivityLog({
          userId: ctx.user.id,
          userName: ctx.user.name || 'Unbekannt',
          action: 'updated',
          entityType: 'task',
          entityId: id,
          entityName: task?.title,
          details: 'Aufgabe aktualisiert'
        });
      }
      return task;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const task = await db.getTaskById(input.id);
      await db.deleteTask(input.id);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'deleted',
        entityType: 'task',
        entityId: input.id,
        entityName: task?.title,
        details: 'Aufgabe gelöscht'
      });
      return { success: true };
    }),

  // Vorbereitungsaufgaben-Board: Alle Aufgaben mit Baustellen-Kontext
  getPreparationBoard: protectedProcedure
    .input(z.object({
      constructionSiteId: z.number().optional(),
      responsibleParty: z.enum(["auftraggeber", "auftragnehmer"]).optional(),
    }))
    .query(async ({ input }) => {
      return db.getPreparationBoardTasks(input.constructionSiteId, input.responsibleParty);
    }),

  // Vorbereitungsaufgaben: Status-Update per Klick
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["offen", "in_bearbeitung", "erledigt", "abgebrochen"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const data: any = { status: input.status };
      if (input.status === 'erledigt') {
        data.completedAt = new Date();
      }
      const task = await db.updateTask(input.id, data);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: input.status === 'erledigt' ? 'completed' : 'updated',
        entityType: 'task',
        entityId: input.id,
        entityName: task?.title,
        details: `Aufgabenstatus geändert: ${input.status}`
      });
      return task;
    }),

  // Aufgabe mit Kommentaren laden
  getWithComments: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getTaskWithComments(input.id);
    }),

  // Kommentar hinzufügen
  addComment: protectedProcedure
    .input(z.object({
      taskId: z.number(),
      text: z.string().min(1),
      attachmentUrls: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const commentId = await db.addTaskComment({
        taskId: input.taskId,
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        text: input.text,
        attachmentUrls: input.attachmentUrls,
      });
      const task = await db.getTaskById(input.taskId);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'updated',
        entityType: 'task',
        entityId: input.taskId,
        entityName: task?.title,
        details: `Kommentar hinzugefügt${input.attachmentUrls?.length ? ` mit ${input.attachmentUrls.length} Anhang/Anhängen` : ''}`
      });
      return { id: commentId };
    }),

  // Foto/Datei-Upload für Aufgaben-Nachweise
  uploadAttachment: protectedProcedure
    .input(z.object({
      taskId: z.number(),
      fileName: z.string(),
      contentType: z.string(),
      base64Data: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { storagePut } = await import('./storage');
      const { nanoid } = await import('nanoid');
      const buffer = Buffer.from(input.base64Data, 'base64');
      const fileKey = `task-attachments/${input.taskId}/${nanoid()}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.contentType);
      return { url, fileKey };
    }),
});

// ============================================
// ACTIVITY LOG ROUTER
// ============================================
const activityLogRouter = router({
  getRecent: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      return db.getRecentActivityLogs(input.limit || 50);
    }),
  
  getByEntityType: protectedProcedure
    .input(z.object({ entityType: z.string(), entityId: z.number().optional() }))
    .query(async ({ input }) => {
      return db.getActivityLogsByEntityType(input.entityType, input.entityId);
    }),
});

// ============================================
// NOTIFICATION ROUTER
// ============================================
const notificationRouter = router({
  getByUserId: protectedProcedure
    .input(z.object({ unreadOnly: z.boolean().optional() }))
    .query(async ({ input, ctx }) => {
      return db.getNotificationsByUserId(ctx.user.id, input.unreadOnly);
    }),
  
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const notifications = await db.getNotificationsByUserId(ctx.user.id, true);
    const total = notifications.length;
    const critical = notifications.filter((n: any) => n.priority === 'critical').length;
    const high = notifications.filter((n: any) => n.priority === 'high').length;
    return { total, critical, high };
  }),
  
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.markNotificationAsRead(input.id);
      return { success: true };
    }),
  
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await db.markAllNotificationsAsRead(ctx.user.id);
    return { success: true };
  }),
  
  deleteRead: protectedProcedure.mutation(async ({ ctx }) => {
    const database = await (await import("./db")).getDb();
    if (!database) return { success: false };
    const { eq, and } = await import("drizzle-orm");
    const { notifications } = await import("../drizzle/schema");
    await database.delete(notifications).where(
      and(
        eq(notifications.userId, ctx.user.id),
        eq(notifications.isRead, true)
      )
    );
    return { success: true };
  }),
});

// ============================================
// DASHBOARD ROUTER
// ============================================
const dashboardRouter = router({
  getKPIs: protectedProcedure.query(async () => {
    return db.getDashboardKPIs();
  }),
  
  getWidgets: protectedProcedure.query(async ({ ctx }) => {
    return db.getDashboardWidgetsByUserId(ctx.user.id);
  }),
  
  createWidget: protectedProcedure
    .input(z.object({
      widgetType: z.string(),
      title: z.string().optional(),
      position: z.number().optional(),
      width: z.enum(["small", "medium", "large", "full"]).optional(),
      config: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return db.createDashboardWidget({
        ...input,
        userId: ctx.user.id,
      });
    }),
  
  updateWidget: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      position: z.number().optional(),
      width: z.enum(["small", "medium", "large", "full"]).optional(),
      config: z.any().optional(),
      isVisible: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateDashboardWidget(id, data);
      return { success: true };
    }),
  
  deleteWidget: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteDashboardWidget(input.id);
      return { success: true };
    }),
});

// ============================================
// CALENDAR ROUTER
// ============================================
const calendarRouter = router({
  getEvents: protectedProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      return db.getCalendarEvents(input.startDate, input.endDate);
    }),
  
  getByUserId: protectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      return db.getCalendarEventsByUserId(ctx.user.id, input.startDate, input.endDate);
    }),
  
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      eventType: z.enum(["baustelle", "besprechung", "termin", "urlaub", "krank", "sonstiges"]).optional(),
      projectId: z.number().optional(),
      constructionSiteId: z.number().optional(),
      assignedToId: z.number().optional(),
      startDate: z.date(),
      endDate: z.date(),
      allDay: z.boolean().optional(),
      color: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return db.createCalendarEvent({
        ...input,
        createdById: ctx.user.id,
      });
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      eventType: z.enum(["baustelle", "besprechung", "termin", "urlaub", "krank", "sonstiges"]).optional(),
      projectId: z.number().optional(),
      constructionSiteId: z.number().optional(),
      assignedToId: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      allDay: z.boolean().optional(),
      color: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateCalendarEvent(id, data);
      return { success: true };
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteCalendarEvent(input.id);
      return { success: true };
    }),
});

// ============================================
// TEAMLEITER CHECK ROUTER
// ============================================
const teamleiterCheckRouter = router({
  getByProjectId: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.getTeamleiterChecksByProjectId(input.projectId);
    }),
  
  create: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      constructionSiteId: z.number().optional(),
      checkType: z.enum(["projektbesprechung", "freitag_check"]),
      checkItems: z.array(z.object({
        id: z.string(),
        category: z.string(),
        label: z.string(),
        checked: z.boolean(),
        notes: z.string().optional(),
      })),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return db.createTeamleiterCheck({
        ...input,
        userId: ctx.user.id,
      });
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      checkItems: z.array(z.object({
        id: z.string(),
        category: z.string(),
        label: z.string(),
        checked: z.boolean(),
        notes: z.string().optional(),
      })).optional(),
      completedAt: z.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateTeamleiterCheck(id, data);
      return { success: true };
    }),
});

// ============================================
// WEATHER ROUTER
// ============================================
const weatherRouter = router({
  getForLocation: protectedProcedure
    .input(z.object({
      latitude: z.number(),
      longitude: z.number(),
    }))
    .query(async ({ input }) => {
      const weather = await getWeatherForLocation(input.latitude, input.longitude);
      if (!weather) {
        return { weather: null, suitability: null };
      }
      const suitability = checkWeatherSuitability(weather);
      return { weather, suitability };
    }),
  
  getForConstructionSite: protectedProcedure
    .input(z.object({ constructionSiteId: z.number() }))
    .query(async ({ input }) => {
      const site = await db.getConstructionSiteById(input.constructionSiteId);
      if (!site || !site.latitude || !site.longitude) {
        return { weather: null, suitability: null };
      }
      const weather = await getWeatherForLocation(
        parseFloat(site.latitude),
        parseFloat(site.longitude)
      );
      if (!weather) {
        return { weather: null, suitability: null };
      }
      const suitability = checkWeatherSuitability(weather);
      
      // Update weather data in database
      await db.updateConstructionSite(input.constructionSiteId, {
        weatherData: weather,
      });
      
      return { weather, suitability };
    }),
  
  updateAllActiveSites: protectedProcedure.mutation(async () => {
    const activeSites = await db.getConstructionSitesByStatus('aktiv');
    const results: { siteId: number; success: boolean }[] = [];
    
    for (const site of activeSites) {
      if (site.latitude && site.longitude) {
        const weather = await getWeatherForLocation(
          parseFloat(site.latitude),
          parseFloat(site.longitude)
        );
        if (weather) {
          await db.updateConstructionSite(site.id, { weatherData: weather });
          results.push({ siteId: site.id, success: true });
        } else {
          results.push({ siteId: site.id, success: false });
        }
      }
    }
    
    return { updated: results.filter(r => r.success).length, total: activeSites.length };
  }),
});

// ============================================
// DOCUMENT ROUTER (Archiv)
// ============================================
const documentRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllDocuments();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getDocumentById(input.id);
    }),
  
  getByProjectId: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.getDocumentsByProjectId(input.projectId);
    }),
  
  getByType: protectedProcedure
    .input(z.object({ fileType: z.enum(["dokument", "bild", "video", "sonstiges"]) }))
    .query(async ({ input }) => {
      return db.getDocumentsByType(input.fileType);
    }),
  
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return db.searchDocuments(input.query);
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      originalName: z.string().min(1),
      fileType: z.enum(["dokument", "bild", "video", "sonstiges"]).optional(),
      mimeType: z.string().optional(),
      fileSize: z.number().optional(),
      s3Key: z.string().min(1),
      s3Url: z.string().min(1),
      companyId: z.number().optional(),
      projectId: z.number().optional(),
      propertyId: z.number().optional(),
      constructionSiteId: z.number().optional(),
      offerId: z.number().optional(),
      orderId: z.number().optional(),
      invoiceId: z.number().optional(),
      warrantyId: z.number().optional(),
      appointmentId: z.number().optional(),
      taskId: z.number().optional(),
      contactId: z.number().optional(),
      category: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Auto-Benennung für Dokument
      let docCompanyName = 'Unbekannt';
      if (input.companyId) {
        const docCompany = await db.getCompanyById(input.companyId);
        if (docCompany) docCompanyName = docCompany.name;
      }
      // Laufnummer ermitteln: Anzahl Dokumente für dieses Unternehmen + 1
      const existingDocs = input.companyId ? await db.getDocumentsByCompanyId(input.companyId) : [];
      const docSeqNum = existingDocs.length + 1;
      const docDisplayName = db.generateDocumentDisplayName(docCompanyName, input.category || input.fileType || 'dokument', docSeqNum);
      
      const doc = await db.createDocument({
        ...input,
        displayName: docDisplayName,
        uploadedById: ctx.user.id,
      });
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'document',
        entityId: doc.id,
        entityName: docDisplayName || doc.name,
        details: 'Dokument hochgeladen'
      });
      return doc;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      category: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateDocument(id, data);
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const doc = await db.getDocumentById(input.id);
      await db.deleteDocument(input.id);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'deleted',
        entityType: 'document',
        entityId: input.id,
        entityName: doc?.name,
        details: 'Dokument gelöscht'
      });
      return { success: true };
    }),
  
  // Unternehmens-Archiv Funktionen
  getByCompanyId: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      return db.getDocumentsByCompanyId(input.companyId);
    }),
  
  getByOfferId: protectedProcedure
    .input(z.object({ offerId: z.number() }))
    .query(async ({ input }) => {
      return db.getDocumentsByOfferId(input.offerId);
    }),
  
  getByOrderId: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      return db.getDocumentsByOrderId(input.orderId);
    }),

  getByInvoiceId: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ input }) => {
      return db.getDocumentsByInvoiceId(input.invoiceId);
    }),

  getByWarrantyId: protectedProcedure
    .input(z.object({ warrantyId: z.number() }))
    .query(async ({ input }) => {
      return db.getDocumentsByWarrantyId(input.warrantyId);
    }),

  getByConstructionSiteId: protectedProcedure
    .input(z.object({ constructionSiteId: z.number() }))
    .query(async ({ input }) => {
      return db.getDocumentsByConstructionSiteId(input.constructionSiteId);
    }),

  searchArchive: protectedProcedure
    .input(z.object({
      companyId: z.number().optional(),
      projectId: z.number().optional(),
      offerId: z.number().optional(),
      orderId: z.number().optional(),
      invoiceId: z.number().optional(),
      warrantyId: z.number().optional(),
      constructionSiteId: z.number().optional(),
      propertyId: z.number().optional(),
      category: z.string().optional(),
      fileType: z.string().optional(),
      query: z.string().optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
    }))
    .query(async ({ input }) => {
      return db.searchDocumentsAdvanced(input);
    }),
  
  // PDF im Archiv speichern
  saveToArchive: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      originalName: z.string().min(1),
      fileType: z.enum(['dokument', 'bild', 'video', 'sonstiges']),
      mimeType: z.string(),
      fileSize: z.number(),
      storageUrl: z.string(),
      storageKey: z.string(),
      category: z.enum(['angebot', 'auftragsbestaetigung', 'vertrag', 'rechnung', 'garantie', 'abnahmeprotokoll', 'protokoll', 'foto', 'sonstiges']),
      companyId: z.number().optional(),
      projectId: z.number().optional(),
      offerId: z.number().optional(),
      orderId: z.number().optional(),
      invoiceId: z.number().optional(),
      warrantyId: z.number().optional(),
      constructionSiteId: z.number().optional(),
      propertyId: z.number().optional(),
      contactId: z.number().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Auto-Benennung für Archiv-Dokument
      let archDocCompanyName = 'Unbekannt';
      if (input.companyId) {
        const archDocCompany = await db.getCompanyById(input.companyId);
        if (archDocCompany) archDocCompanyName = archDocCompany.name;
      }
      const archExistingDocs = input.companyId ? await db.getDocumentsByCompanyId(input.companyId) : [];
      const archDocSeqNum = archExistingDocs.length + 1;
      const archDocDisplayName = db.generateDocumentDisplayName(archDocCompanyName, input.category || 'dokument', archDocSeqNum);
      
      const doc = await db.createDocumentInArchive({
        ...input,
        displayName: archDocDisplayName,
        uploadedBy: ctx.user.name || 'Unbekannt',
      });
      
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'document',
        entityId: doc.id,
        entityName: archDocDisplayName || doc.name,
        details: `Dokument im Archiv gespeichert (${input.category})`
      });
      
      return doc;
    }),

  getArchiveOverview: protectedProcedure
    .input(z.object({
      companyId: z.number().optional(),
      projectId: z.number().optional(),
      constructionSiteId: z.number().optional(),
      propertyId: z.number().optional(),
      contactId: z.number().optional(),
      offerId: z.number().optional(),
      orderId: z.number().optional(),
      category: z.string().optional(),
      fileType: z.string().optional(),
      query: z.string().optional(),
      dateFrom: z.date().optional(),
      dateTo: z.date().optional(),
      source: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return db.getArchiveOverview(input || undefined);
    }),
});
// ============================================
// TEXT BLOCK ROUTER (Textbausteine))
// ============================================
const textBlockRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllTextBlocks();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getTextBlockById(input.id);
    }),
  
  getByCategory: protectedProcedure
    .input(z.object({ category: z.enum(["einleitung", "abschluss", "rabatt", "konditionen", "versprechen", "sonstiges"]) }))
    .query(async ({ input }) => {
      return db.getTextBlocksByCategory(input.category);
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      category: z.enum(["einleitung", "abschluss", "rabatt", "konditionen", "versprechen", "sonstiges"]),
      content: z.string().min(1),
      placeholders: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return db.createTextBlock({
        ...input,
        createdById: ctx.user.id,
      });
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      category: z.enum(["einleitung", "abschluss", "rabatt", "konditionen", "versprechen", "sonstiges"]).optional(),
      content: z.string().optional(),
      placeholders: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateTextBlock(id, data);
    }),
  
  incrementUsage: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.incrementTextBlockUsage(input.id);
      return { success: true };
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteTextBlock(input.id);
      return { success: true };
    }),
});

// ============================================
// OFFER TEMPLATE ROUTER (Angebotsvorlagen)
// ============================================
const offerTemplateRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllOfferTemplates();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getOfferTemplateById(input.id);
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.string().optional(),
      introductionBlockId: z.number().optional(),
      conclusionBlockId: z.number().optional(),
      conditionBlockIds: z.array(z.number()).optional(),
      defaultPaymentDays: z.number().optional(),
      defaultValidityDays: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return db.createOfferTemplate({
        ...input,
        createdById: ctx.user.id,
      });
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      introductionBlockId: z.number().optional(),
      conclusionBlockId: z.number().optional(),
      conditionBlockIds: z.array(z.number()).optional(),
      defaultPaymentDays: z.number().optional(),
      defaultValidityDays: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateOfferTemplate(id, data);
    }),
  
  incrementUsage: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.incrementOfferTemplateUsage(input.id);
      return { success: true };
    }),
});

// ============================================
// EMAIL TEMPLATE ROUTER (E-Mail-Vorlagen)
// ============================================
const emailTemplateRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllEmailTemplates();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getEmailTemplateById(input.id);
    }),
  
  getByCategory: protectedProcedure
    .input(z.object({ category: z.enum(["angebot", "nachfassen", "auftrag", "rechnung", "sonstiges"]) }))
    .query(async ({ input }) => {
      return db.getEmailTemplatesByCategory(input.category);
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      category: z.enum(["angebot", "nachfassen", "auftrag", "rechnung", "sonstiges"]),
      subject: z.string().min(1),
      body: z.string().min(1),
      placeholders: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return db.createEmailTemplate({
        ...input,
        createdById: ctx.user.id,
      });
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      category: z.enum(["angebot", "nachfassen", "auftrag", "rechnung", "sonstiges"]).optional(),
      subject: z.string().optional(),
      body: z.string().optional(),
      placeholders: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return db.updateEmailTemplate(id, data);
    }),
  
  incrementUsage: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.incrementEmailTemplateUsage(input.id);
      return { success: true };
    }),
});

// ============================================
// USER ROUTER
// ============================================
const userRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllUsers();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getUserById(input.id);
    }),
});

// ============================================
// HUBSPOT ROUTER
// ============================================
const hubspotRouter = router({
  // Account-Info abrufen
  getAccountInfo: protectedProcedure.query(async () => {
    return getHubSpotAccountInfo();
  }),
  
  // Kontakte aus HubSpot abrufen
  getContacts: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      const contacts = await fetchHubSpotContacts(input.limit || 50);
      return contacts.map(c => ({
        hubspotId: c.id,
        firstName: c.properties.firstname || null,
        lastName: c.properties.lastname || 'Unbekannt',
        email: c.properties.email || null,
        phone: c.properties.phone || null,
        updatedAt: c.updatedAt,
      }));
    }),
  
  // Unternehmen aus HubSpot abrufen
  getCompanies: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      const companies = await fetchHubSpotCompanies(input.limit || 50);
      return companies.map(c => ({
        hubspotId: c.id,
        name: c.properties.name || 'Unbekannt',
        phone: c.properties.phone || null,
        city: c.properties.city || null,
        country: c.properties.country || null,
        website: c.properties.domain ? `https://${c.properties.domain}` : null,
        updatedAt: c.updatedAt,
      }));
    }),
  
  // Deals aus HubSpot abrufen
  getDeals: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      const deals = await fetchHubSpotDeals(input.limit || 50);
      return deals.map(d => ({
        hubspotId: d.id,
        name: d.properties.dealname || 'Unbekannt',
        amount: d.properties.amount ? parseFloat(d.properties.amount) : null,
        stage: d.properties.dealstage || null,
        pipeline: d.properties.pipeline || null,
        closeDate: d.properties.closedate || null,
        updatedAt: d.updatedAt,
      }));
    }),
  
  // Deals für ein Unternehmen abrufen
  getDealsForCompany: protectedProcedure
    .input(z.object({ hubspotCompanyId: z.string() }))
    .query(async ({ input }) => {
      const deals = await getDealsForCompany(input.hubspotCompanyId);
      return deals.map(d => ({
        hubspotId: d.id,
        name: d.properties.dealname || 'Unbekannt',
        amount: d.properties.amount ? parseFloat(d.properties.amount) : null,
        stage: d.properties.dealstage || null,
        pipeline: d.properties.pipeline || null,
        closeDate: d.properties.closedate || null,
        description: d.properties.description || null,
        updatedAt: d.updatedAt,
      }));
    }),
  
  // Deals suchen
  searchDeals: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const deals = await searchHubSpotDeals(input.query);
      return deals.map(d => ({
        hubspotId: d.id,
        name: d.properties.dealname || 'Unbekannt',
        amount: d.properties.amount ? parseFloat(d.properties.amount) : null,
        stage: d.properties.dealstage || null,
        updatedAt: d.updatedAt,
      }));
    }),
  
  // Deal erstellen
  createDeal: protectedProcedure
    .input(z.object({
      dealname: z.string(),
      amount: z.number().optional(),
      pipeline: z.string().optional(),
      dealstage: z.string().optional(),
      closedate: z.string().optional(),
      description: z.string().optional(),
      contactId: z.number().optional(),
      companyId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const deal = await createHubSpotDeal(input);
      
      if (deal) {
        await db.createActivityLog({
          userId: ctx.user.id,
          userName: ctx.user.name || 'Unbekannt',
          action: 'created',
          entityType: 'hubspot',
          entityName: input.dealname,
          details: `Deal in HubSpot erstellt (ID: ${deal.id})`,
        });
      }
      
      return deal ? {
        hubspotId: deal.id,
        name: deal.properties.dealname || input.dealname,
        amount: deal.properties.amount ? parseFloat(deal.properties.amount) : null,
      } : null;
    }),
  
  // Kontakt zu HubSpot pushen
  pushContact: protectedProcedure
    .input(z.object({
      firstName: z.string().optional(),
      lastName: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      companyId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const hubspotId = await createHubSpotContact(input);
      
      if (hubspotId) {
        await db.createActivityLog({
          userId: ctx.user.id,
          userName: ctx.user.name || 'Unbekannt',
          action: 'synced',
          entityType: 'contact',
          entityName: `${input.firstName || ''} ${input.lastName}`.trim(),
          details: `Kontakt zu HubSpot gepusht (ID: ${hubspotId})`,
        });
      }
      
      return hubspotId;
    }),
  
  // Unternehmen zu HubSpot pushen
  pushCompany: protectedProcedure
    .input(z.object({
      name: z.string(),
      phone: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
      website: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const hubspotId = await createHubSpotCompany(input);
      
      if (hubspotId) {
        await db.createActivityLog({
          userId: ctx.user.id,
          userName: ctx.user.name || 'Unbekannt',
          action: 'synced',
          entityType: 'company',
          entityName: input.name,
          details: `Unternehmen zu HubSpot gepusht (ID: ${hubspotId})`,
        });
      }
      
      return hubspotId;
    }),
  
  // Engagement (Note) erstellen für Timeline
  createEngagement: protectedProcedure
    .input(z.object({
      type: z.enum(['NOTE', 'TASK']),
      body: z.string(),
      contactIds: z.array(z.number()).optional(),
      companyIds: z.array(z.number()).optional(),
      dealIds: z.array(z.number()).optional(),
    }))
    .mutation(async ({ input }) => {
      return createHubSpotEngagement(input);
    }),
  
  // Sync-Status abrufen (erweitert mit Auto-Sync-Info)
  getSyncStatus: protectedProcedure.query(async () => {
    const status = await getSyncStatus();
    const autoSync = getAutoSyncStatus();
    return {
      ...status,
      autoSync,
    };
  }),
  
  // Manuellen Sync auslösen
  triggerManualSync: protectedProcedure.mutation(async ({ ctx }) => {
    const result = {
      success: false,
      companiesImported: 0,
      contactsImported: 0,
      errors: [] as string[],
      timestamp: new Date().toISOString(),
    };
    
    try {
      const hubspotCompanies = await fetchHubSpotCompanies(500);
      const localCompanies = hubspotCompanies.map(hubspotCompanyToLocal);
      result.companiesImported = await db.importHubSpotCompanies(localCompanies);
      
      const hubspotContacts = await fetchHubSpotContacts(500);
      const localContacts = hubspotContacts.map(hubspotContactToLocal);
      result.contactsImported = await db.importHubSpotContacts(localContacts);
      
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'synced',
        entityType: 'hubspot',
        entityName: 'HubSpot',
        details: `Manueller Sync: ${result.companiesImported} Unternehmen, ${result.contactsImported} Kontakte`,
      });
      
      result.success = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(errorMessage);
    }
    
    return result;
  }),
  
  // Auto-Sync starten/stoppen
  toggleAutoSync: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ input }) => {
      if (input.enabled) {
        startAutoSync(async () => {
          const result = {
            success: false,
            companiesImported: 0,
            contactsImported: 0,
            errors: [] as string[],
          };
          try {
            const hubspotCompanies = await fetchHubSpotCompanies(500);
            const localCompanies = hubspotCompanies.map(hubspotCompanyToLocal);
            result.companiesImported = await db.importHubSpotCompanies(localCompanies);
            const hubspotContacts = await fetchHubSpotContacts(500);
            const localContacts = hubspotContacts.map(hubspotContactToLocal);
            result.contactsImported = await db.importHubSpotContacts(localContacts);
            result.success = true;
          } catch (error) {
            result.errors.push(error instanceof Error ? error.message : String(error));
          }
          return result;
        });
      } else {
        stopAutoSync();
      }
      return { active: input.enabled };
    }),
  
  // Vollständiger Sync
  syncAll: protectedProcedure.mutation(async ({ ctx }) => {
    const result = {
      success: false,
      companiesImported: 0,
      contactsImported: 0,
      errors: [] as string[],
      timestamp: new Date().toISOString(),
    };
    
    try {
      // Sync Companies
      const hubspotCompanies = await fetchHubSpotCompanies(500);
      const localCompanies = hubspotCompanies.map(hubspotCompanyToLocal);
      result.companiesImported = await db.importHubSpotCompanies(localCompanies);
      
      // Sync Contacts
      const hubspotContacts = await fetchHubSpotContacts(500);
      const localContacts = hubspotContacts.map(hubspotContactToLocal);
      result.contactsImported = await db.importHubSpotContacts(localContacts);
      
      // Log activity
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'synced',
        entityType: 'hubspot',
        entityName: 'HubSpot',
        details: `${result.companiesImported} Unternehmen, ${result.contactsImported} Kontakte synchronisiert`,
      });
      
      result.success = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.errors.push(errorMessage);
    }
    
    return result;
  }),
});

// ============================================
// EMAIL ROUTER
// ============================================
const emailRouter = router({
  // Angebot per E-Mail senden mit HubSpot-Verknüpfung + Auto-Advance
  sendOffer: protectedProcedure
    .input(z.object({
      recipientName: z.string(),
      recipientEmail: z.string().email(),
      offerNumber: z.string(),
      projectName: z.string(),
      totalAmount: z.string(),
      validUntil: z.string(),
      senderName: z.string(),
      senderEmail: z.string().optional(),
      senderPhone: z.string().optional(),
      pdfBase64: z.string().optional(),
      // Phase 0a: IDs für Auto-Advance
      offerId: z.number().optional(),
      projectId: z.number().optional(),
      // HubSpot-Verknüpfungen für Timeline-Erfassung
      hubspotContactId: z.number().optional(),
      hubspotCompanyId: z.number().optional(),
      hubspotDealId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // HubSpot-Associations aufbauen
      const hubspotAssociations = (input.hubspotContactId || input.hubspotCompanyId || input.hubspotDealId) ? {
        contactId: input.hubspotContactId,
        companyId: input.hubspotCompanyId,
        dealId: input.hubspotDealId,
      } : undefined;
      
      const result = await sendOfferEmail({
        recipient: {
          name: input.recipientName,
          email: input.recipientEmail,
        },
        offerNumber: input.offerNumber,
        projectName: input.projectName,
        totalAmount: input.totalAmount,
        validUntil: input.validUntil,
        senderName: input.senderName,
        senderEmail: input.senderEmail,
        senderPhone: input.senderPhone,
      }, input.pdfBase64, hubspotAssociations);
      
      // Phase 0a: Angebotsstatus auf "versendet" setzen + Projekt-Phase auto-advance
      const sentAt = new Date();
      if (input.offerId) {
        try {
          await db.updateOffer(input.offerId, { status: 'versendet', sentAt });
        } catch (e) {
          console.warn('[Workflow] Angebotsstatus-Update fehlgeschlagen:', e);
        }
        
        // Phase 0e: Automatisch 3 Nachfass-Erinnerungen erstellen (7/14/30 Tage)
        try {
          await createAutoFollowUpReminders(input.offerId, input.projectId ?? null, sentAt);
        } catch (e) {
          console.warn('[Workflow] Nachfass-Erinnerungen erstellen fehlgeschlagen:', e);
        }
      }
      if (input.projectId) {
        try {
          await tryAutoAdvance(input.projectId, 'angebot_versendet', ctx.user.id, `Angebot ${input.offerNumber} per E-Mail versendet`);
        } catch (e) {
          console.warn('[Workflow] Auto-Advance nach E-Mail-Versand fehlgeschlagen:', e);
        }
      }
      
      // Log activity
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'sent',
        entityType: 'offer',
        entityName: input.offerNumber,
        details: `Angebot per E-Mail an ${input.recipientEmail} gesendet`,
      });
      
      return result;
    }),
  
  // E-Mail-Vorschau generieren
  previewOfferEmail: protectedProcedure
    .input(z.object({
      recipientName: z.string(),
      offerNumber: z.string(),
      projectName: z.string(),
      totalAmount: z.string(),
      validUntil: z.string(),
      senderName: z.string(),
      senderEmail: z.string().optional(),
      senderPhone: z.string().optional(),
    }))
    .query(({ input }) => {
      return generateOfferEmailContent({
        recipient: {
          name: input.recipientName,
          email: '',
        },
        offerNumber: input.offerNumber,
        projectName: input.projectName,
        totalAmount: input.totalAmount,
        validUntil: input.validUntil,
        senderName: input.senderName,
        senderEmail: input.senderEmail,
        senderPhone: input.senderPhone,
      });
    }),

// v7.1b: E-Mail via Microsoft Graph API senden
  sendViaGraph: protectedProcedure
    .input(z.object({
      to: z.array(z.string().email()),
      cc: z.array(z.string().email()).optional(),
      bcc: z.array(z.string().email()).optional(),
      subject: z.string().min(1),
      htmlBody: z.string().min(1),
      attachmentUrls: z.array(z.object({
        url: z.string(),
        name: z.string(),
        contentType: z.string().optional(),
      })).optional(),
      // Verknüpfungen für Protokollierung
      projectId: z.number().optional(),
      offerId: z.number().optional(),
      orderId: z.number().optional(),
      companyId: z.number().optional(),
      contactId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { TRPCError } = await import('@trpc/server');
      const { ensureValidToken, sendEmailViaGraph, isConfigured } = await import("./services/microsoft365");
      
      if (!isConfigured()) {
        throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'Microsoft 365 ist nicht konfiguriert. Bitte Azure App Registration einrichten.' });
      }
      
      const accessToken = await ensureValidToken(ctx.user.id);
      if (!accessToken) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Microsoft 365 Token nicht verf\u00fcgbar. Bitte erneut anmelden.' });
      }
      
      // Anhänge von S3 laden und als Base64 konvertieren
      const attachments: Array<{ name: string; contentType: string; contentBytes: string }> = [];
      if (input.attachmentUrls?.length) {
        for (const att of input.attachmentUrls) {
          try {
            const response = await fetch(att.url);
            const buffer = await response.arrayBuffer();
            attachments.push({
              name: att.name,
              contentType: att.contentType || 'application/octet-stream',
              contentBytes: Buffer.from(buffer).toString('base64'),
            });
          } catch (e) {
            console.warn(`[Email] Anhang ${att.name} konnte nicht geladen werden:`, e);
          }
        }
      }
      
      const result = await sendEmailViaGraph({
        accessToken,
        to: input.to,
        cc: input.cc,
        bcc: input.bcc,
        subject: input.subject,
        htmlBody: input.htmlBody,
        attachments,
      });
      
      if (!result.success) {
        const { TRPCError: TRPCErr } = await import('@trpc/server');
        throw new TRPCErr({ code: 'INTERNAL_SERVER_ERROR', message: `E-Mail-Versand fehlgeschlagen: ${result.error}` });
      }
      
      // Vollständige E-Mail-Protokollierung im Aktivitätslog
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'sent',
        entityType: 'project',
        entityName: input.subject,
        details: `E-Mail via Microsoft 365 an ${input.to.join(', ')} gesendet${input.projectId ? ` (Projekt #${input.projectId})` : ''}`,
      });
      
      return { success: true };
    }),
  
  // v7.1: Microsoft 365 Status prüfen
  getMicrosoftStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const { isConfigured } = await import("./services/microsoft365");
      const user = await db.getUserById(ctx.user.id);
      return {
        configured: isConfigured(),
        connected: !!(user?.microsoftId),
        tokenValid: !!(user?.microsoftAccessToken && user?.microsoftTokenExpiry && new Date(user.microsoftTokenExpiry) > new Date()),
      };
    }),
});

// ============================================
// ORDER ROUTER (Auftr\u00e4ge)
// ============================================
const orderRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllOrders();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getOrderById(input.id);
    }),

  getWithRelations: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getOrderWithRelations(input.id);
    }),

  getByProjectId: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.getOrdersByProjectId(input.projectId);
    }),

  getInvoicesByOrderId: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      return db.getInvoicesByOrderId(input.orderId);
    }),

  getWarrantiesByOrderId: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      return db.getWarrantiesByOrderId(input.orderId);
    }),
  
  getByCompanyId: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      return db.getOrdersByCompanyId(input.companyId);
    }),
  
  getByStatus: protectedProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return db.getOrdersByStatus(input.status);
    }),
  
  generateNumber: protectedProcedure.mutation(async () => {
    return db.generateOrderNumber();
  }),
  
  create: protectedProcedure
    .input(z.object({
      orderNumber: z.string().min(1),
      projectId: z.number().optional(),
      offerId: z.number().optional(),
      companyId: z.number().optional(),
      contactId: z.number().optional(),
      status: z.enum(["bestaetigt", "in_vorbereitung", "in_durchfuehrung", "abgeschlossen", "storniert"]).optional(),
      netTotal: z.string().optional(),
      vatAmount: z.string().optional(),
      grossTotal: z.string().optional(),
      orderDate: z.date().optional(),
      plannedStartDate: z.date().optional(),
      plannedEndDate: z.date().optional(),
      kundenberaterId: z.number().optional(),
      projektleiterId: z.number().optional(),
      hubspotDealId: z.string().optional(),
      notes: z.string().optional(),
      positions: z.any().optional(),
      specialConditions: z.any().optional(),
      discount: z.string().optional(),
      discountReason: z.string().optional(),
      scaffoldingDays: z.number().optional(),
      overnightStays: z.number().optional(),
      distanceKm: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const order = await db.createOrder(input);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'project',
        entityId: order.id,
        entityName: order.orderNumber,
        details: `Auftrag ${order.orderNumber} erstellt`
      });
      return order;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["bestaetigt", "in_vorbereitung", "in_durchfuehrung", "abgeschlossen", "storniert"]).optional(),
      netTotal: z.string().optional(),
      vatAmount: z.string().optional(),
      grossTotal: z.string().optional(),
      plannedStartDate: z.date().optional(),
      plannedEndDate: z.date().optional(),
      actualStartDate: z.date().optional(),
      actualEndDate: z.date().optional(),
      projektleiterId: z.number().optional(),
      notes: z.string().optional(),
      positions: z.any().optional(),
      specialConditions: z.any().optional(),
      discount: z.string().optional(),
      discountReason: z.string().optional(),
      scaffoldingDays: z.number().optional(),
      overnightStays: z.number().optional(),
      distanceKm: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const order = await db.updateOrder(id, data);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'updated',
        entityType: 'project',
        entityId: id,
        entityName: order?.orderNumber,
        details: 'Auftrag aktualisiert'
      });
      return order;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const order = await db.getOrderById(input.id);
      await db.deleteOrder(input.id);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'deleted',
        entityType: 'project',
        entityId: input.id,
        entityName: order?.orderNumber,
        details: 'Auftrag gelöscht'
      });
      return { success: true };
    }),

  // === AUFTRAG-ANNAHME-WIZARD ===
  acceptFromOffer: protectedProcedure
    .input(z.object({
      projectId: z.number(),
      offerId: z.number(),
      // Baustelle config
      baustelleName: z.string().min(1),
      baustelleAddress: z.string().optional(),
      projektleiterId: z.number().optional(),
      plannedStartDate: z.date().optional(),
      plannedEndDate: z.date().optional(),
      // Aufgaben
      createDefaultTasks: z.boolean().default(true),
      // Besonderheiten die Vorbereitungs-Aufgaben generieren
      specialConditions: z.array(z.object({
        type: z.string(),
        description: z.string(),
        responsibleParty: z.enum(['auftraggeber', 'auftragnehmer']),
        propertyId: z.number().optional(),
        side: z.string().optional(),
        dueBeforeStart: z.boolean().default(true),
      })).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. Lade Projekt und Angebot
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new Error('Projekt nicht gefunden');
      const offer = await db.getOfferById(input.offerId);
      if (!offer) throw new Error('Angebot nicht gefunden');

      // 2. Angebot als angenommen markieren
      await db.updateOffer(input.offerId, { status: 'angenommen', acceptedAt: new Date() });

      // 3. Projekt-Phase auf auftrag_gewonnen setzen
      await db.updateProject(input.projectId, { phase: 'auftrag_gewonnen' });

      // 4. Auftrag erstellen mit Daten aus Angebot
      const orderNumber = await db.generateOrderNumber();
      // Positionen aus Angebot übernehmen
      const offerPositions = (offer as any).positions;
      const orderPositions = Array.isArray(offerPositions) ? offerPositions.map((pos: any) => ({
        propertyId: pos.propertyId || 0,
        propertyName: pos.propertyName || pos.immobilie || 'Unbekannt',
        propertyAddress: pos.address || '',
        sides: Array.isArray(pos.seiten) ? pos.seiten.map((s: any) => ({
          name: s.name || s.seite || '',
          area: s.flaeche || s.area || 0,
          pricePerSqm: s.preisProQm || s.pricePerSqm || 0,
          total: s.gesamt || s.total || 0,
        })) : [],
        subtotal: pos.gesamt || pos.subtotal || 0,
      })) : [];

      // Auto-Benennung für Auftrag
      let orderCompanyName = 'Unbekannt';
      if (offer.companyId) {
        const orderCompany = await db.getCompanyById(offer.companyId);
        if (orderCompany) orderCompanyName = orderCompany.name;
      }
      const orderDisplayName = db.generateOrderDisplayName(orderNumber, orderCompanyName);
      
      const order = await db.createOrder({
        orderNumber,
        displayName: orderDisplayName,
        projectId: input.projectId,
        offerId: input.offerId,
        companyId: offer.companyId,
        contactId: offer.contactId,
        status: 'bestaetigt',
        netTotal: offer.netTotal || '0',
        vatAmount: offer.vatAmount || '0',
        grossTotal: offer.grossTotal || '0',
        orderDate: new Date(),
        plannedStartDate: input.plannedStartDate,
        plannedEndDate: input.plannedEndDate,
        kundenberaterId: project.kundenberaterId,
        projektleiterId: input.projektleiterId,
        hubspotDealId: project.hubspotDealId,
        notes: input.notes,
        positions: orderPositions,
        specialConditions: input.specialConditions || [],
        discount: (offer as any).discount ? String((offer as any).discount) : '0',
        discountReason: (offer as any).discountReason || '',
        scaffoldingDays: (offer as any).scaffoldingDays || 0,
        overnightStays: (offer as any).overnightStays || 0,
        distanceKm: (offer as any).distanceKm || 0,
      });

      // 5. Baustelle automatisch anlegen (mit orderId und offerId)
      const siteNumber = await db.generateConstructionSiteNumber();
      const site = await db.createConstructionSite({
        siteNumber,
        projectId: input.projectId,
        orderId: order.id,
        offerId: input.offerId,
        name: input.baustelleName,
        address: input.baustelleAddress || '',
        status: 'geplant',
        startDate: input.plannedStartDate,
        endDate: input.plannedEndDate,
        totalArea: offer.totalArea || '0',
        projektleiterId: input.projektleiterId,
      });

      // 6. Standard-Aufgaben erstellen
      let tasksCreatedCount = 0;
      if (input.createDefaultTasks) {
        const defaultTasks = [
          { title: 'Bewohnerinfo erstellen', daysOffset: 14, role: 'Büro' },
          { title: 'Straßensperre beantragen', daysOffset: 21, role: 'Büro' },
          { title: 'Ressourcen buchen', daysOffset: 7, role: 'AT-Leiter' },
          { title: 'Material bestellen', daysOffset: 10, role: 'AT-Leiter' },
          { title: 'Team einteilen', daysOffset: 5, role: 'Projektleiter' },
          { title: 'Kick-off Meeting planen', daysOffset: 3, role: 'Projektleiter' },
        ];
        const baseDate = input.plannedStartDate || new Date();
        for (const task of defaultTasks) {
          const dueDate = new Date(baseDate);
          dueDate.setDate(dueDate.getDate() - task.daysOffset);
          await db.createTask({
            title: task.title,
            projectId: input.projectId,
            constructionSiteId: site.id,
            status: 'offen',
            priority: 'hoch',
            dueDate,
            assignedToId: input.projektleiterId,
            assignedRole: task.role,
            createdById: ctx.user.id,
            description: `Automatisch erstellt bei Auftragsannahme (${task.role})`,
          });
          tasksCreatedCount++;
        }
      }

      // 6b. Aufgaben aus Besonderheiten/specialConditions generieren (AG/AN-Zuordnung)
      if (input.specialConditions && input.specialConditions.length > 0) {
        const baseDate = input.plannedStartDate || new Date();
        for (const condition of input.specialConditions) {
          const dueDate = new Date(baseDate);
          dueDate.setDate(dueDate.getDate() - (condition.dueBeforeStart ? 7 : 0));
          const responsibleLabel = condition.responsibleParty === 'auftraggeber' ? 'AG (Auftraggeber)' : 'AN (FassadenFix)';
          await db.createTask({
            title: condition.description,
            projectId: input.projectId,
            constructionSiteId: site.id,
            status: 'offen',
            priority: condition.dueBeforeStart ? 'hoch' : 'normal',
            dueDate,
            assignedToId: condition.responsibleParty === 'auftragnehmer' ? input.projektleiterId : undefined,
            assignedRole: responsibleLabel,
            createdById: ctx.user.id,
            description: `Vorbereitungsaufgabe aus Auftrag: ${condition.type}. Verantwortlich: ${responsibleLabel}${condition.side ? ` (Seite: ${condition.side})` : ''}`,
          });
          tasksCreatedCount++;
        }
      }

        // 7. HubSpot-Deal aktualisieren (wenn vorhanden)
      if (project.hubspotDealId) {
        try {
          const { updateHubSpotDeal } = await import('./services/hubspot');
          await updateHubSpotDeal(project.hubspotDealId, {
            dealstage: 'closedwon',
            amount: offer.grossTotal || '0',
            closedate: new Date().toISOString().split('T')[0],
          });
        } catch (e) {
          console.warn('[HubSpot] Deal-Update fehlgeschlagen:', e);
        }
      }
      // 8. Aktivitätslog
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'status_changed',
        entityType: 'project',
        entityId: input.projectId,
        entityName: project.name,
        details: `Auftrag angenommen: ${orderNumber}. Baustelle ${siteNumber} angelegt. ${tasksCreatedCount} Aufgaben erstellt.`,
      });
      return { order, constructionSite: site, tasksCreated: tasksCreatedCount };
    }),
  // === ABNAHME-WIZARD ===
  completeWithAcceptance: protectedProcedure
    .input(z.object({
      orderId: z.number(),
      projectId: z.number(),
      // Abnahme-Protokoll
      acceptanceDate: z.date(),
      acceptedBy: z.string().min(1),
      overallRating: z.enum(['einwandfrei', 'mit_maengeln', 'abgelehnt']),
      defects: z.array(z.object({
        description: z.string(),
        severity: z.enum(['gering', 'mittel', 'schwer']),
        location: z.string().optional(),
      })).optional(),
      notes: z.string().optional(),
      // Rechnung
      createInvoice: z.boolean().default(true),
      // Garantie
      createWarranty: z.boolean().default(true),
      warrantyYears: z.number().default(5),
    }))
    .mutation(async ({ input, ctx }) => {
      // 1. Lade Auftrag und Projekt
      const order = await db.getOrderById(input.orderId);
      if (!order) throw new Error('Auftrag nicht gefunden');
      const project = await db.getProjectById(input.projectId);
      if (!project) throw new Error('Projekt nicht gefunden');

      // 2. Auftrag als abgeschlossen markieren
      await db.updateOrder(input.orderId, {
        status: 'abgeschlossen',
        actualEndDate: input.acceptanceDate,
      });

      // 3. Projekt-Phase auf abnahme/abgeschlossen setzen
      const newPhase = input.overallRating === 'abgelehnt' ? 'durchfuehrung' : 
                       input.overallRating === 'mit_maengeln' ? 'abnahme' : 'abgeschlossen';
      await db.updateProject(input.projectId, { 
        phase: newPhase,
        progress: newPhase === 'abgeschlossen' ? 100 : 95,
      });

      let invoice = null;
      let warranty = null;

      // 4. Rechnung erstellen (wenn einwandfrei oder mit Mängeln)
      if (input.createInvoice && input.overallRating !== 'abgelehnt') {
        const invoiceNumber = await db.generateInvoiceNumber();
        const dueDate = new Date(input.acceptanceDate);
        dueDate.setDate(dueDate.getDate() + 30);
        // Auto-Benennung
        let invCompanyName = 'Unbekannt';
        if (order.companyId) {
          const invCompany = await db.getCompanyById(order.companyId);
          if (invCompany) invCompanyName = invCompany.name;
        }
        invoice = await db.createInvoice({
          invoiceNumber,
          displayName: db.generateInvoiceDisplayName(invoiceNumber, invCompanyName),
          orderId: input.orderId,
          projectId: input.projectId,
          companyId: order.companyId,
          contactId: order.contactId,
          status: 'erstellt',
          netTotal: order.netTotal || '0',
          vatRate: '19.00',
          vatAmount: order.vatAmount || '0',
          grossTotal: order.grossTotal || '0',
          invoiceDate: input.acceptanceDate,
          dueDate,
          notes: `Automatisch erstellt nach Abnahme am ${input.acceptanceDate.toLocaleDateString('de-DE')}`,
        });
      }

      // 5. Garantie erstellen (wenn einwandfrei)
      if (input.createWarranty && input.overallRating === 'einwandfrei') {
        const warrantyEnd = new Date(input.acceptanceDate);
        warrantyEnd.setFullYear(warrantyEnd.getFullYear() + input.warrantyYears);
        const warrantyNumber = `G-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
        // Auto-Benennung für Garantie
        let warCompanyName = 'Unbekannt';
        if (order.companyId) {
          const warCompany = await db.getCompanyById(order.companyId);
          if (warCompany) warCompanyName = warCompany.name;
        }
        warranty = await db.createWarranty({
          warrantyNumber,
          displayName: db.generateWarrantyDisplayName(warrantyNumber, warCompanyName),
          projectId: input.projectId,
          orderId: input.orderId,
          companyId: order.companyId,
          warrantyType: 'algenfrei_garantie',
          status: 'aktiv',
          startDate: input.acceptanceDate,
          endDate: warrantyEnd,
          durationYears: input.warrantyYears,
          notes: `Abnahme: ${input.overallRating}. ${input.notes || ''}`,
          createdById: ctx.user.id,
        });
      }

      // 6. Baustellen als abgeschlossen markieren
      const sites = await db.getConstructionSitesByProjectId(input.projectId);
      for (const site of sites) {
        if (site.status === 'aktiv' || site.status === 'pausiert') {
          await db.updateConstructionSite(site.id, {
            status: input.overallRating === 'abgelehnt' ? 'aktiv' : 'abgeschlossen',
            progress: input.overallRating === 'abgelehnt' ? site.progress : 100,
          });
        }
      }
      // 7. HubSpot-Engagement erstellen (Abnahme-Notiz)
      if (project.hubspotDealId) {
        try {
          const { createHubSpotEngagement } = await import('./services/hubspot');
          await createHubSpotEngagement({
            type: 'NOTE',
            body: `Abnahme durchgeführt: ${input.overallRating}. ${input.defects?.length ? input.defects.length + ' Mängel.' : 'Keine Mängel.'} ${invoice ? 'Rechnung ' + invoice.invoiceNumber + ' erstellt.' : ''} ${warranty ? 'Garantie aktiviert.' : ''}`,
            dealIds: [parseInt(project.hubspotDealId)],
          });
        } catch (e) {
          console.warn('[HubSpot] Engagement-Erstellung fehlgeschlagen:', e);
        }
      }
      // 8. Aktivitätslog
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'status_changed',
        entityType: 'project',
        entityId: input.projectId,
        entityName: project.name,
        details: `Abnahme durchgeführt: ${input.overallRating}. ${invoice ? 'Rechnung ' + invoice.invoiceNumber + ' erstellt.' : ''} ${warranty ? 'Garantie aktiviert.' : ''}`,
      });

      return { 
        order, 
        invoice, 
        warranty, 
        acceptance: {
          date: input.acceptanceDate,
          rating: input.overallRating,
          defects: input.defects || [],
        }
      };
    }),

  // === RECHNUNG AUS AUFTRAG ===
  createInvoiceFromOrder: protectedProcedure
    .input(z.object({
      orderId: z.number(),
      invoiceDate: z.date().optional(),
      dueInDays: z.number().default(30),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const order = await db.getOrderById(input.orderId);
      if (!order) throw new Error('Auftrag nicht gefunden');

      const invoiceNumber = await db.generateInvoiceNumber();
      const invoiceDate = input.invoiceDate || new Date();
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + input.dueInDays);

      // Auto-Benennung
      let inv2CompanyName = 'Unbekannt';
      if (order.companyId) {
        const inv2Company = await db.getCompanyById(order.companyId);
        if (inv2Company) inv2CompanyName = inv2Company.name;
      }
      const invoice = await db.createInvoice({
        invoiceNumber,
        displayName: db.generateInvoiceDisplayName(invoiceNumber, inv2CompanyName),
        orderId: input.orderId,
        projectId: order.projectId,
        companyId: order.companyId,
        contactId: order.contactId,
        status: 'erstellt',
        netTotal: order.netTotal || '0',
        vatRate: '19.00',
        vatAmount: order.vatAmount || '0',
        grossTotal: order.grossTotal || '0',
        invoiceDate,
        dueDate,
        notes: input.notes || `Rechnung zu Auftrag ${order.orderNumber}`,
      });

      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'project',
        entityId: invoice.id,
        entityName: invoice.invoiceNumber,
        details: `Rechnung ${invoice.invoiceNumber} aus Auftrag ${order.orderNumber} erstellt`,
      });

      return invoice;
    }),
});

// ============================================
// WARRANTY ROUTER (Garantien)
// ============================================
const warrantyRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllWarranties();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getWarrantyById(input.id);
    }),

  getWithRelations: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getWarrantyWithRelations(input.id);
    }),

  getByProjectId: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.getWarrantiesByProjectId(input.projectId);
    }),

  getByOrderId: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      return db.getWarrantiesByOrderId(input.orderId);
    }),
  
  getByCompanyId: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      return db.getWarrantiesByCompanyId(input.companyId);
    }),
  
  getByStatus: protectedProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return db.getWarrantiesByStatus(input.status);
    }),
  
  getActive: protectedProcedure.query(async () => {
    return db.getActiveWarranties();
  }),
  
  generateNumber: protectedProcedure.mutation(async () => {
    return db.generateWarrantyNumber();
  }),
  
  create: protectedProcedure
    .input(z.object({
      warrantyNumber: z.string().min(1),
      orderId: z.number().optional(),
      projectId: z.number().optional(),
      companyId: z.number().optional(),
      propertyId: z.number().optional(),
      warrantyType: z.enum(["algenfrei_garantie", "ergebnisgarantie", "materialgarantie"]).optional(),
      status: z.enum(["aktiv", "abgelaufen", "beansprucht", "erfuellt"]).optional(),
      startDate: z.date(),
      endDate: z.date(),
      durationYears: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Auto-Benennung
      let warStdCompanyName = 'Unbekannt';
      if (input.companyId) {
        const warStdCompany = await db.getCompanyById(input.companyId);
        if (warStdCompany) warStdCompanyName = warStdCompany.name;
      }
      const warranty = await db.createWarranty({
        ...input,
        displayName: db.generateWarrantyDisplayName(input.warrantyNumber, warStdCompanyName),
        createdById: ctx.user.id
      });
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'project',
        entityId: warranty.id,
        entityName: warranty.warrantyNumber,
        details: `Garantie ${warranty.warrantyNumber} erstellt`
      });
      return warranty;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["aktiv", "abgelaufen", "beansprucht", "erfuellt"]).optional(),
      claimDate: z.date().optional(),
      claimDescription: z.string().optional(),
      claimResolution: z.string().optional(),
      claimResolvedAt: z.date().optional(),
      certificateUrl: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const warranty = await db.updateWarranty(id, data);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'updated',
        entityType: 'project',
        entityId: id,
        entityName: warranty?.warrantyNumber,
        details: 'Garantie aktualisiert'
      });
      
      // Auto-Archiv: Wenn certificateUrl gesetzt wird, automatisch im Archiv ablegen
      if (data.certificateUrl && warranty) {
        try {
          const { archiveWarrantyCertificate } = await import('./services/autoArchive');
          await archiveWarrantyCertificate({
            id: warranty.id,
            warrantyNumber: warranty.warrantyNumber,
            projectId: warranty.projectId,
            companyId: warranty.companyId,
            orderId: warranty.orderId,
            certificateUrl: data.certificateUrl,
          }, ctx.user.name || 'Unbekannt');
        } catch (e) {
          console.warn('[AutoArchiv] Garantie-Zertifikat Archivierung fehlgeschlagen:', e);
        }
      }
      
      return warranty;
    }),

  // v7.4: Garantie-PDF generieren
  generatePdf: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { generateWarrantyHtml } = await import("./services/pdfGenerator");
      const warranty = await db.getWarrantyWithRelations(input.id);
      if (!warranty) return { html: "", error: "Garantie nicht gefunden" };
      const html = generateWarrantyHtml({
        warrantyNumber: warranty.warrantyNumber,
        issueDate: new Date(warranty.startDate || warranty.createdAt).toLocaleDateString("de-DE"),
        expiryDate: warranty.endDate ? new Date(warranty.endDate).toLocaleDateString("de-DE") : "Unbegrenzt",
        warrantyYears: warranty.durationYears || 5,
        companyName: warranty.company?.name || "Unbekannt",
        companyAddress: [warranty.company?.street, `${warranty.company?.postalCode || ""} ${warranty.company?.city || ""}`].filter(Boolean).join(", "),
        contactName: undefined,
        projectName: warranty.project?.name || "Projekt",
        projectNumber: warranty.project?.projectNumber || "",
        propertyAddress: warranty.company?.street || "",
        totalArea: parseFloat(String(warranty.project?.totalArea || 0)),
        services: ["Professionelle Fassadenreinigung", "Algen- und Moosentfernung", "Langzeit-Impr\u00e4gnierung"],
      });
      return { html };
    }),
});

// ============================================
// APPOINTMENT ROUTER (Termine)
// ============================================
const appointmentRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllAppointments();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getAppointmentById(input.id);
    }),
  
  getByUserId: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return db.getAppointmentsByUserId(input.userId);
    }),
  
  getByStatus: protectedProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return db.getAppointmentsByStatus(input.status);
    }),
  
  getUpcoming: protectedProcedure
    .input(z.object({ days: z.number().optional() }))
    .query(async ({ input }) => {
      return db.getUpcomingAppointments(input.days || 7);
    }),
  
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      appointmentType: z.enum(["objektaufnahme", "kundentermin", "baustellenbesichtigung", "abnahme", "nachbesserung", "intern"]).optional(),
      status: z.enum(["vorgeschlagen", "bestaetigt", "abgesagt", "verschoben", "durchgefuehrt"]).optional(),
      projectId: z.number().optional(),
      companyId: z.number().optional(),
      contactId: z.number().optional(),
      propertyId: z.number().optional(),
      proposedDates: z.array(z.object({
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        available: z.boolean()
      })).optional(),
      confirmedDate: z.date().optional(),
      confirmedStartTime: z.string().optional(),
      confirmedEndTime: z.string().optional(),
      location: z.string().optional(),
      isOnsite: z.boolean().optional(),
      assignedToId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const appointment = await db.createAppointment({
        ...input,
        createdById: ctx.user.id
      });
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'task',
        entityId: appointment.id,
        entityName: appointment.title,
        details: `Termin "${appointment.title}" erstellt`
      });
      return appointment;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(["vorgeschlagen", "bestaetigt", "abgesagt", "verschoben", "durchgefuehrt"]).optional(),
      confirmedDate: z.date().optional(),
      confirmedStartTime: z.string().optional(),
      confirmedEndTime: z.string().optional(),
      location: z.string().optional(),
      assignedToId: z.number().optional(),
      reminderSent: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const appointment = await db.updateAppointment(id, data);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'updated',
        entityType: 'task',
        entityId: id,
        entityName: appointment?.title,
        details: 'Termin aktualisiert'
      });
      return appointment;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const appointment = await db.getAppointmentById(input.id);
      await db.deleteAppointment(input.id);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'deleted',
        entityType: 'task',
        entityId: input.id,
        entityName: appointment?.title,
        details: 'Termin gelöscht'
      });
      return { success: true };
    }),
});

// ============================================
// INVOICE ROUTER (Rechnungen)
// ============================================
const invoiceRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllInvoices();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getInvoiceById(input.id);
    }),

  getWithRelations: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getInvoiceWithRelations(input.id);
    }),

  getByProjectId: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.getInvoicesByProjectId(input.projectId);
    }),

  getByOrderId: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      return db.getInvoicesByOrderId(input.orderId);
    }),
  
  getByCompanyId: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      return db.getInvoicesByCompanyId(input.companyId);
    }),
  
  getByStatus: protectedProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return db.getInvoicesByStatus(input.status);
    }),
  
  getOverdue: protectedProcedure.query(async () => {
    return db.getOverdueInvoices();
  }),
  
  generateNumber: protectedProcedure.mutation(async () => {
    return db.generateInvoiceNumber();
  }),
  
  create: protectedProcedure
    .input(z.object({
      invoiceNumber: z.string().min(1),
      orderId: z.number().optional(),
      projectId: z.number().optional(),
      companyId: z.number().optional(),
      contactId: z.number().optional(),
      invoiceType: z.enum(["abschlagsrechnung", "schlussrechnung", "teilrechnung", "gutschrift"]).optional(),
      status: z.enum(["entwurf", "erstellt", "versendet", "bezahlt", "teilbezahlt", "ueberfaellig", "storniert", "gemahnt"]).optional(),
      netTotal: z.string().optional(),
      vatRate: z.string().optional(),
      vatAmount: z.string().optional(),
      grossTotal: z.string().optional(),
      positions: z.array(z.object({
        position: z.number(),
        description: z.string(),
        quantity: z.number(),
        unit: z.string(),
        unitPrice: z.number(),
        total: z.number()
      })).optional(),
      invoiceDate: z.date().optional(),
      dueDate: z.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Auto-Benennung
      let invStdCompanyName = 'Unbekannt';
      if (input.companyId) {
        const invStdCompany = await db.getCompanyById(input.companyId);
        if (invStdCompany) invStdCompanyName = invStdCompany.name;
      }
      const invoice = await db.createInvoice({
        ...input,
        displayName: db.generateInvoiceDisplayName(input.invoiceNumber, invStdCompanyName),
        createdById: ctx.user.id
      });
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'offer',
        entityId: invoice.id,
        entityName: invoice.invoiceNumber,
        details: `Rechnung ${invoice.invoiceNumber} erstellt`
      });
      return invoice;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["entwurf", "erstellt", "versendet", "bezahlt", "teilbezahlt", "ueberfaellig", "storniert", "gemahnt"]).optional(),
      paidAmount: z.string().optional(),
      openAmount: z.string().optional(),
      sentAt: z.date().optional(),
      paidAt: z.date().optional(),
      dunningLevel: z.number().optional(),
      lastDunningDate: z.date().optional(),
      pdfUrl: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const invoice = await db.updateInvoice(id, data);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'updated',
        entityType: 'offer',
        entityId: id,
        entityName: invoice?.invoiceNumber,
        details: 'Rechnung aktualisiert'
      });
      
      // Auto-Archiv: Wenn pdfUrl gesetzt wird, automatisch im Archiv ablegen
      if (data.pdfUrl && invoice) {
        try {
          const { archiveInvoicePdf } = await import('./services/autoArchive');
          await archiveInvoicePdf({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            projectId: invoice.projectId,
            companyId: invoice.companyId,
            pdfUrl: data.pdfUrl,
          }, ctx.user.name || 'Unbekannt');
        } catch (e) {
          console.warn('[AutoArchiv] Rechnungs-PDF Archivierung fehlgeschlagen:', e);
        }
      }
      
      return invoice;
    }),

  // v7.4: Rechnungs-PDF generieren
  generatePdf: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { generateInvoiceHtml } = await import("./services/pdfGenerator");
      const invoice = await db.getInvoiceWithRelations(input.id);
      if (!invoice) return { html: "", error: "Rechnung nicht gefunden" };
      const html = generateInvoiceHtml({
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.invoiceDate || invoice.createdAt).toLocaleDateString("de-DE"),
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("de-DE") : "Auf Anfrage",
        invoiceType: invoice.invoiceType,
        companyName: invoice.company?.name || "Unbekannt",
        companyAddress: [invoice.company?.street, `${invoice.company?.postalCode || ""} ${invoice.company?.city || ""}`].filter(Boolean).join(", "),
        contactName: undefined,
        projectName: invoice.project?.name,
        projectNumber: invoice.project?.projectNumber,
        positions: (invoice.positions as any[] || []).map((p: any, i: number) => ({
          position: i + 1,
          description: p.description || p.text || "Fassadenreinigung",
          quantity: p.quantity || p.area || 1,
          unit: p.unit || "m\u00B2",
          unitPrice: p.unitPrice || p.pricePerUnit || 0,
          totalPrice: p.totalPrice || p.total || 0,
        })),
        netTotal: parseFloat(String(invoice.netTotal || 0)),
        vatRate: parseFloat(String(invoice.vatRate || 19)),
        vatAmount: parseFloat(String(invoice.vatAmount || 0)),
        grossTotal: parseFloat(String(invoice.grossTotal || 0)),
      });
      return { html };
    }),
});

// ============================================
// PAYMENT ROUTER (Zahlungen)
// ============================================
const paymentRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllPayments();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getPaymentById(input.id);
    }),
  
  getByInvoiceId: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ input }) => {
      return db.getPaymentsByInvoiceId(input.invoiceId);
    }),
  
  getByStatus: protectedProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return db.getPaymentsByStatus(input.status);
    }),
  
  getUnmatched: protectedProcedure.query(async () => {
    return db.getUnmatchedPayments();
  }),
  
  generateNumber: protectedProcedure.mutation(async () => {
    return db.generatePaymentNumber();
  }),
  
  create: protectedProcedure
    .input(z.object({
      paymentNumber: z.string().min(1),
      invoiceId: z.number().optional(),
      companyId: z.number().optional(),
      paymentType: z.enum(["ueberweisung", "lastschrift", "bar", "scheck", "kreditkarte", "paypal"]).optional(),
      status: z.enum(["ausstehend", "eingegangen", "zugeordnet", "rueckbuchung"]).optional(),
      amount: z.string(),
      currency: z.string().optional(),
      bankReference: z.string().optional(),
      bankAccountIban: z.string().optional(),
      paymentDate: z.date(),
      valueDate: z.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const payment = await db.createPayment(input);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'system',
        entityId: payment.id,
        entityName: payment.paymentNumber,
        details: `Zahlung ${payment.paymentNumber} erfasst`
      });
      return payment;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      invoiceId: z.number().optional(),
      status: z.enum(["ausstehend", "eingegangen", "zugeordnet", "rueckbuchung"]).optional(),
      matchedAt: z.date().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const payment = await db.updatePayment(id, {
        ...data,
        matchedById: ctx.user.id
      });
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'updated',
        entityType: 'system',
        entityId: id,
        entityName: payment?.paymentNumber,
        details: 'Zahlung aktualisiert'
      });
      return payment;
    }),
});

// ============================================
// BUDGET ROUTER (Budgets)
// ============================================
const budgetRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllBudgets();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getBudgetById(input.id);
    }),
  
  getByProjectId: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      return db.getBudgetsByProjectId(input.projectId);
    }),
  
  getActive: protectedProcedure.query(async () => {
    return db.getActiveBudgets();
  }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      budgetType: z.enum(["projekt", "abteilung", "marketing", "personal", "material", "sonstiges"]).optional(),
      projectId: z.number().optional(),
      periodStart: z.date(),
      periodEnd: z.date(),
      plannedAmount: z.string().optional(),
      categories: z.array(z.object({
        name: z.string(),
        planned: z.number(),
        actual: z.number(),
        remaining: z.number()
      })).optional(),
      warningThreshold: z.number().optional(),
      responsibleId: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const budget = await db.createBudget({
        ...input,
        createdById: ctx.user.id
      });
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'system',
        entityId: budget.id,
        entityName: budget.name,
        details: `Budget "${budget.name}" erstellt`
      });
      return budget;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      plannedAmount: z.string().optional(),
      actualAmount: z.string().optional(),
      remainingAmount: z.string().optional(),
      categories: z.array(z.object({
        name: z.string(),
        planned: z.number(),
        actual: z.number(),
        remaining: z.number()
      })).optional(),
      status: z.enum(["aktiv", "ueberschritten", "abgeschlossen"]).optional(),
      alertSent: z.boolean().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const budget = await db.updateBudget(id, data);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'updated',
        entityType: 'system',
        entityId: id,
        entityName: budget?.name,
        details: 'Budget aktualisiert'
      });
      return budget;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const budget = await db.getBudgetById(input.id);
      await db.deleteBudget(input.id);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'deleted',
        entityType: 'system',
        entityId: input.id,
        entityName: budget?.name,
        details: 'Budget gelöscht'
      });
      return { success: true };
    }),
});

// ============================================
// CUSTOMER REPORT ROUTER (Kundenmeldungen)
// ============================================
const customerReportRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllCustomerReports();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getCustomerReportById(input.id);
    }),
  
  getByCompanyId: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      return db.getCustomerReportsByCompanyId(input.companyId);
    }),
  
  getByStatus: protectedProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return db.getCustomerReportsByStatus(input.status);
    }),
  
  getOpen: protectedProcedure.query(async () => {
    return db.getOpenCustomerReports();
  }),
  
  generateNumber: protectedProcedure.mutation(async () => {
    return db.generateCustomerReportNumber();
  }),
  
  create: protectedProcedure
    .input(z.object({
      reportNumber: z.string().min(1),
      companyId: z.number().optional(),
      contactId: z.number().optional(),
      projectId: z.number().optional(),
      propertyId: z.number().optional(),
      orderId: z.number().optional(),
      warrantyId: z.number().optional(),
      reportType: z.enum(["reklamation", "anfrage", "lob", "beschwerde", "garantiefall", "sonstiges"]).optional(),
      priority: z.enum(["niedrig", "normal", "hoch", "dringend"]).optional(),
      status: z.enum(["neu", "in_bearbeitung", "warten_auf_kunde", "geloest", "abgeschlossen"]).optional(),
      subject: z.string().min(1),
      description: z.string().min(1),
      assignedToId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const report = await db.createCustomerReport({
        ...input,
        createdById: ctx.user.id
      });
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'task',
        entityId: report.id,
        entityName: report.reportNumber,
        details: `Kundenmeldung ${report.reportNumber} erstellt`
      });
      return report;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["neu", "in_bearbeitung", "warten_auf_kunde", "geloest", "abgeschlossen"]).optional(),
      priority: z.enum(["niedrig", "normal", "hoch", "dringend"]).optional(),
      resolution: z.string().optional(),
      resolvedAt: z.date().optional(),
      internalNotes: z.string().optional(),
      customerNotified: z.boolean().optional(),
      assignedToId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.resolvedAt) {
        updateData.resolvedById = ctx.user.id;
      }
      const report = await db.updateCustomerReport(id, updateData);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'updated',
        entityType: 'task',
        entityId: id,
        entityName: report?.reportNumber,
        details: 'Kundenmeldung aktualisiert'
      });
      return report;
    }),
});

// ============================================
// TEAM MEMBER ROUTER (Teammitglieder)
// ============================================
const teamMemberRouter = router({
  list: protectedProcedure.query(async () => {
    return db.getAllTeamMembers();
  }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getTeamMemberById(input.id);
    }),
  
  getByUserId: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      return db.getTeamMemberByUserId(input.userId);
    }),
  
  getByDepartment: protectedProcedure
    .input(z.object({ department: z.string() }))
    .query(async ({ input }) => {
      return db.getTeamMembersByDepartment(input.department);
    }),
  
  getActive: protectedProcedure.query(async () => {
    return db.getActiveTeamMembers();
  }),
  
  create: protectedProcedure
    .input(z.object({
      userId: z.number(),
      employeeNumber: z.string().optional(),
      department: z.enum(["geschaeftsfuehrung", "vertrieb", "projektleitung", "ausfuehrung", "buero", "buchhaltung"]).optional(),
      position: z.string().optional(),
      employmentType: z.enum(["vollzeit", "teilzeit", "minijob", "praktikum", "freelancer"]).optional(),
      hireDate: z.date().optional(),
      workPhone: z.string().optional(),
      workMobile: z.string().optional(),
      emergencyContact: z.string().optional(),
      emergencyPhone: z.string().optional(),
      skills: z.array(z.string()).optional(),
      vacationDaysTotal: z.number().optional(),
      status: z.enum(["aktiv", "urlaub", "krank", "inaktiv"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const member = await db.createTeamMember(input);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'created',
        entityType: 'user',
        entityId: member.id,
        entityName: member.employeeNumber || `Team Member #${member.id}`,
        details: 'Teammitglied erstellt'
      });
      return member;
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      employeeNumber: z.string().optional(),
      department: z.enum(["geschaeftsfuehrung", "vertrieb", "projektleitung", "ausfuehrung", "buero", "buchhaltung"]).optional(),
      position: z.string().optional(),
      employmentType: z.enum(["vollzeit", "teilzeit", "minijob", "praktikum", "freelancer"]).optional(),
      exitDate: z.date().optional(),
      workPhone: z.string().optional(),
      workMobile: z.string().optional(),
      emergencyContact: z.string().optional(),
      emergencyPhone: z.string().optional(),
      skills: z.array(z.string()).optional(),
      certifications: z.array(z.object({
        name: z.string(),
        issuedAt: z.string(),
        expiresAt: z.string().optional(),
        documentUrl: z.string().optional()
      })).optional(),
      vacationDaysTotal: z.number().optional(),
      vacationDaysUsed: z.number().optional(),
      status: z.enum(["aktiv", "urlaub", "krank", "inaktiv"]).optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const member = await db.updateTeamMember(id, data);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'updated',
        entityType: 'user',
        entityId: id,
        entityName: member?.employeeNumber || `Team Member #${id}`,
        details: 'Teammitglied aktualisiert'
      });
      return member;
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const member = await db.getTeamMemberById(input.id);
      await db.deleteTeamMember(input.id);
      await db.createActivityLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unbekannt',
        action: 'deleted',
        entityType: 'user',
        entityId: input.id,
        entityName: member?.employeeNumber || `Team Member #${input.id}`,
        details: 'Teammitglied gelöscht'
      });
      return { success: true };
    }),
});

// ============================================
// EXTENDED PROJECT ROUTER PROCEDURES
// ============================================
// Add these to the existing projectRouter or create a separate one
const projectFilterRouter = router({
  getOpen: protectedProcedure.query(async () => {
    return db.getOpenProjects();
  }),
  
  getOverdue: protectedProcedure.query(async () => {
    return db.getOverdueProjects();
  }),
});

// ============================================
// EXTENDED CONSTRUCTION SITE ROUTER PROCEDURES
// ============================================
const constructionSiteFilterRouter = router({
  getOpen: protectedProcedure.query(async () => {
    return db.getOpenConstructionSites();
  }),
  
  getOverdue: protectedProcedure.query(async () => {
    return db.getOverdueConstructionSites();
  }),
});
// ============================================
// MAIN APP ROUTER
// ============================================
// ============================================
// DUNNING ROUTER (Mahnlauf Phase 0.5a)
// ============================================
const dunningRouter = router({
  // Überfällige Rechnungen prüfen
  checkOverdue: protectedProcedure.query(async () => {
    const { getDb } = await import('./db');
    const { invoices } = await import('../drizzle/schema');
    type Invoice = typeof invoices.$inferSelect;
    const { eq } = await import('drizzle-orm');
    const db = (await getDb())!;
    const allInvoices: Invoice[] = await db.select().from(invoices);
    const now = new Date();
    
    const overdue = allInvoices.filter((inv) => {
      if (!inv.dueDate) return false;
      if (inv.status === 'bezahlt' || inv.status === 'storniert') return false;
      return new Date(inv.dueDate) < now;
    });

    // Kategorisieren nach Mahnstufe
    const categories = {
      zahlungserinnerung: overdue.filter((inv) => {
        const daysPast = Math.floor((now.getTime() - new Date(inv.dueDate!).getTime()) / (1000 * 60 * 60 * 24));
        return daysPast >= 1 && daysPast < 30 && (inv.dunningLevel || 0) < 1;
      }),
      ersteMahnung: overdue.filter((inv) => {
        const daysPast = Math.floor((now.getTime() - new Date(inv.dueDate!).getTime()) / (1000 * 60 * 60 * 24));
        return daysPast >= 30 && daysPast < 60 && (inv.dunningLevel || 0) < 2;
      }),
      zweiteMahnung: overdue.filter((inv) => {
        const daysPast = Math.floor((now.getTime() - new Date(inv.dueDate!).getTime()) / (1000 * 60 * 60 * 24));
        return daysPast >= 60 && daysPast < 90 && (inv.dunningLevel || 0) < 3;
      }),
      letzteMahnung: overdue.filter((inv) => {
        const daysPast = Math.floor((now.getTime() - new Date(inv.dueDate!).getTime()) / (1000 * 60 * 60 * 24));
        return daysPast >= 90 && (inv.dunningLevel || 0) < 4;
      }),
    };

    const totalOverdueAmount = overdue.reduce((sum, inv) => sum + parseFloat(inv.openAmount || '0'), 0);

    return {
      totalOverdue: overdue.length,
      totalOverdueAmount,
      categories,
      summary: {
        zahlungserinnerung: categories.zahlungserinnerung.length,
        ersteMahnung: categories.ersteMahnung.length,
        zweiteMahnung: categories.zweiteMahnung.length,
        letzteMahnung: categories.letzteMahnung.length,
      },
    };
  }),

  // Mahnung erstellen
  createReminder: protectedProcedure
    .input(z.object({
      invoiceId: z.number(),
      level: z.number().min(1).max(4),
      sentVia: z.enum(['email', 'post', 'manual']).default('email'),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { getDb } = await import('./db');
      const { invoices, dunningEntries, activityLogs } = await import('../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const { TRPCError } = await import('@trpc/server');
      const db = (await getDb())!;
      
      // Rechnung laden
      const [invoice] = await db.select().from(invoices).where(eq(invoices.id, input.invoiceId));
      if (!invoice) throw new TRPCError({ code: 'NOT_FOUND', message: 'Rechnung nicht gefunden' });
      
      // Mahngebühren nach Stufe
      const dunningFees: Record<number, string> = { 1: '0', 2: '5.00', 3: '10.00', 4: '15.00' };
      const levelLabels: Record<number, string> = {
        1: 'Zahlungserinnerung',
        2: '1. Mahnung',
        3: '2. Mahnung',
        4: 'Letzte Mahnung vor Inkasso',
      };
      
      // Mahneintrag erstellen
      const [entry] = await db.insert(dunningEntries).values({
        invoiceId: input.invoiceId,
        projectId: invoice.projectId,
        companyId: invoice.companyId,
        level: input.level,
        amount: invoice.openAmount || '0',
        dunningFee: dunningFees[input.level] || '0',
        sentVia: input.sentVia,
        status: 'draft',
        subject: `${levelLabels[input.level]} - Rechnung ${invoice.invoiceNumber}`,
        notes: input.notes,
        createdById: ctx.user?.id,
      });
      
      // Rechnung aktualisieren
      await db.update(invoices)
        .set({
          dunningLevel: input.level,
          lastDunningDate: new Date(),
          status: 'gemahnt',
        })
        .where(eq(invoices.id, input.invoiceId));
      
      // Auto-Archiv: Mahnung im Archiv ablegen
      try {
        const { archiveDunning } = await import('./services/autoArchive');
        await archiveDunning({
          invoiceId: input.invoiceId,
          invoiceNumber: invoice.invoiceNumber,
          level: input.level,
          projectId: invoice.projectId,
          companyId: invoice.companyId,
        }, ctx.user?.name || 'Unbekannt');
      } catch (e) {
        console.warn('[AutoArchiv] Mahnungs-Archivierung fehlgeschlagen:', e);
      }
      
      return { success: true, entryId: entry.insertId };
    }),

  // Mahnung senden
  sendDunning: protectedProcedure
    .input(z.object({
      dunningEntryId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const { getDb } = await import('./db');
      const { dunningEntries, invoices, activityLogs } = await import('../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const { TRPCError } = await import('@trpc/server');
      const db = (await getDb())!;
      
      // Mahneintrag laden
      const [entry] = await db.select().from(dunningEntries).where(eq(dunningEntries.id, input.dunningEntryId));
      if (!entry) throw new TRPCError({ code: 'NOT_FOUND', message: 'Mahneintrag nicht gefunden' });
      
      // Status auf 'sent' setzen
      await db.update(dunningEntries)
        .set({
          status: 'sent',
          sentAt: new Date(),
        })
        .where(eq(dunningEntries.id, input.dunningEntryId));
      
      // Aktivitätslog
      if (entry.invoiceId) {
        const [invoice] = await db.select().from(invoices).where(eq(invoices.id, entry.invoiceId));
        if (invoice?.projectId) {
          await db.insert(activityLogs).values({
            action: 'sent',
            entityType: 'document',
            entityId: entry.invoiceId,
            entityName: `Mahnung Stufe ${entry.level}`,
            details: `Mahnstufe ${entry.level} versendet für Rechnung ${invoice.invoiceNumber}`,
          });
        }
      }
      
      return { success: true };
    }),

  // Mahnhistorie für eine Rechnung
  getHistory: protectedProcedure
    .input(z.object({
      invoiceId: z.number(),
    }))
    .query(async ({ input }) => {
      const { getDb } = await import('./db');
      const { dunningEntries } = await import('../drizzle/schema');
      const { eq, desc } = await import('drizzle-orm');
      const db = (await getDb())!;
      return db.select()
        .from(dunningEntries)
        .where(eq(dunningEntries.invoiceId, input.invoiceId))
        .orderBy(desc(dunningEntries.createdAt));
    }),

  // Dashboard-Übersicht: Überfällige Rechnungen
  getDashboardSummary: protectedProcedure.query(async () => {
    const { getDb } = await import('./db');
    const { invoices } = await import('../drizzle/schema');
    const db = (await getDb())!;
    type InvoiceRow = typeof invoices.$inferSelect;
    const allInvoices: InvoiceRow[] = await db.select().from(invoices);
    const now = new Date();
    
    const overdue = allInvoices.filter((inv: InvoiceRow) => {
      if (!inv.dueDate) return false;
      if (inv.status === 'bezahlt' || inv.status === 'storniert') return false;
      return new Date(inv.dueDate) < now;
    });

    return {
      count: overdue.length,
      totalAmount: overdue.reduce((sum: number, inv: InvoiceRow) => sum + parseFloat(inv.openAmount || '0'), 0),
      critical: overdue.filter((inv: InvoiceRow) => {
        const daysPast = Math.floor((now.getTime() - new Date(inv.dueDate!).getTime()) / (1000 * 60 * 60 * 24));
        return daysPast >= 60;
      }).length,
    };
  }),
});

// ============================================
// FOLLOW-UP ROUTER (Nachfass-System Phase 0e)
// ============================================
const followUpRouter = router({
  // Alle offenen Nachfass-Erinnerungen abrufen
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "completed", "dismissed", "overdue"]).optional(),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ input }) => {
      const database = await db.getDb();
      if (!database) return [];
      const { followUpReminders, offers, projects } = await import('../drizzle/schema');
      const { eq, and, lte, desc } = await import('drizzle-orm');
      
      let query = database
        .select({
          id: followUpReminders.id,
          offerId: followUpReminders.offerId,
          projectId: followUpReminders.projectId,
          dueAt: followUpReminders.dueAt,
          status: followUpReminders.status,
          reminderType: followUpReminders.reminderType,
          notes: followUpReminders.notes,
          completedAt: followUpReminders.completedAt,
          createdAt: followUpReminders.createdAt,
          offerNumber: offers.offerNumber,
          offerGrossTotal: offers.grossTotal,
          projectName: projects.name,
        })
        .from(followUpReminders)
        .leftJoin(offers, eq(followUpReminders.offerId, offers.id))
        .leftJoin(projects, eq(followUpReminders.projectId, projects.id))
        .orderBy(desc(followUpReminders.dueAt))
        .limit(input?.limit ?? 50);
      
      const results = await query;
      return results;
    }),

  // Fällige Nachfass-Erinnerungen (für Dashboard-Widget)
  getDue: protectedProcedure.query(async () => {
    const database = await db.getDb();
    if (!database) return [];
    const { followUpReminders, offers, projects } = await import('../drizzle/schema');
    const { eq, and, lte } = await import('drizzle-orm');
    
    const now = new Date();
    const results = await database
      .select({
        id: followUpReminders.id,
        offerId: followUpReminders.offerId,
        projectId: followUpReminders.projectId,
        dueAt: followUpReminders.dueAt,
        status: followUpReminders.status,
        reminderType: followUpReminders.reminderType,
        notes: followUpReminders.notes,
        offerNumber: offers.offerNumber,
        offerGrossTotal: offers.grossTotal,
        projectName: projects.name,
      })
      .from(followUpReminders)
      .leftJoin(offers, eq(followUpReminders.offerId, offers.id))
      .leftJoin(projects, eq(followUpReminders.projectId, projects.id))
      .where(
        and(
          eq(followUpReminders.status, 'pending'),
          lte(followUpReminders.dueAt, now)
        )
      )
      .limit(20);
    
    return results;
  }),

  // Nachfass als erledigt markieren
  complete: protectedProcedure
    .input(z.object({
      id: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await db.getDb();
      if (!database) throw new Error('DB nicht verfügbar');
      const { followUpReminders } = await import('../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      
      await database.update(followUpReminders)
        .set({
          status: 'completed',
          completedAt: new Date(),
          completedById: ctx.user.id,
          notes: input.notes,
        })
        .where(eq(followUpReminders.id, input.id));
      
      return { success: true };
    }),

  // Nachfass verwerfen
  dismiss: protectedProcedure
    .input(z.object({
      id: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const database = await db.getDb();
      if (!database) throw new Error('DB nicht verfügbar');
      const { followUpReminders } = await import('../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      
      await database.update(followUpReminders)
        .set({
          status: 'dismissed',
          completedAt: new Date(),
          completedById: ctx.user.id,
          notes: input.notes,
        })
        .where(eq(followUpReminders.id, input.id));
      
      return { success: true };
    }),

  // Benutzerdefinierte Erinnerung erstellen
  createCustom: protectedProcedure
    .input(z.object({
      offerId: z.number(),
      projectId: z.number().optional(),
      dueAt: z.date(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const database = await db.getDb();
      if (!database) throw new Error('DB nicht verfügbar');
      const { followUpReminders } = await import('../drizzle/schema');
      
      const [reminder] = await database.insert(followUpReminders).values({
        offerId: input.offerId,
        projectId: input.projectId ?? null,
        dueAt: input.dueAt,
        reminderType: 'custom',
        notes: input.notes,
      });
      
      return { success: true, id: reminder.insertId };
    }),
});

// ============================================
// Helper: Automatische Nachfass-Erinnerungen erstellen
// ============================================
async function createAutoFollowUpReminders(offerId: number, projectId: number | null, sentAt: Date) {
  const database = await db.getDb();
  if (!database) return;
  const { followUpReminders } = await import('../drizzle/schema');
  
  const reminders = [
    { type: 'auto_7d' as const, days: 7 },
    { type: 'auto_14d' as const, days: 14 },
    { type: 'auto_30d' as const, days: 30 },
  ];
  
  for (const { type, days } of reminders) {
    const dueAt = new Date(sentAt.getTime() + days * 24 * 60 * 60 * 1000);
    await database.insert(followUpReminders).values({
      offerId,
      projectId,
      dueAt,
      reminderType: type,
      status: 'pending',
    });
  }
}

// ============================================
// PHOTO ROUTER (Foto-Verwaltung)
// ============================================
const photoRouter = router({
  list: protectedProcedure
    .input(z.object({
      propertyId: z.number().optional(),
      constructionSiteId: z.number().optional(),
      projectId: z.number().optional(),
      logEntryId: z.number().optional(),
      context: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      if (!input) return [];
      if (input.propertyId) return db.getPhotosByPropertyId(input.propertyId);
      if (input.constructionSiteId) return db.getPhotosByConstructionSiteId(input.constructionSiteId);
      if (input.projectId) return db.getPhotosByProjectId(input.projectId);
      if (input.logEntryId) return db.getPhotosByLogEntryId(input.logEntryId);
      if (input.context) return db.getPhotosByContext(input.context);
      return [];
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return db.getPhotoById(input.id);
    }),

  count: protectedProcedure
    .input(z.object({
      propertyId: z.number().optional(),
      constructionSiteId: z.number().optional(),
      projectId: z.number().optional(),
      context: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return db.getPhotoCount(input);
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      description: z.string().optional(),
      category: z.string().optional(),
      side: z.enum(["front", "back", "left_gable", "right_gable", "roof", "other"]).optional(),
      sortOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updatePhoto(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deletePhoto(input.id);
      return { success: true };
    }),

  // Bulk-Zuordnung: Fotos einer Entität zuweisen
  assignToEntity: protectedProcedure
    .input(z.object({
      photoIds: z.array(z.number()),
      propertyId: z.number().optional(),
      constructionSiteId: z.number().optional(),
      projectId: z.number().optional(),
      logEntryId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { photoIds, ...entityData } = input;
      for (const photoId of photoIds) {
        await db.updatePhoto(photoId, entityData);
      }
      return { success: true, count: photoIds.length };
    }),
});

// ============================================
// REPORT ROUTER (Phase 4a)
// ============================================
const reportRouter = router({
  // Pipeline-Bericht: Projekte nach Phase gruppiert
  pipeline: protectedProcedure.query(async () => {
    const projects = await db.getAllProjects();
    const phases = ["objektaufnahme", "angebot_erstellt", "angebot_versendet", "nachfassen", "auftrag_gewonnen", "planung", "vorbereitung", "durchfuehrung", "abnahme", "abgeschlossen", "verloren"];
    return phases.map(phase => ({
      phase,
      count: projects.filter(p => p.phase === phase).length,
      totalArea: projects.filter(p => p.phase === phase).reduce((sum, p) => sum + parseFloat(String(p.totalArea || 0)), 0),
    }));
  }),

  // Umsatz-Bericht: Rechnungen nach Monat
  revenue: protectedProcedure
    .input(z.object({ year: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const year = input?.year || new Date().getFullYear();
      const invoices = await db.getAllInvoices();
      const months = Array.from({ length: 12 }, (_, i) => {
        const monthInvoices = invoices.filter(inv => {
          const d = new Date(inv.createdAt);
          return d.getFullYear() === year && d.getMonth() === i;
        });
        return {
          month: i + 1,
          invoiceCount: monthInvoices.length,
          totalAmount: monthInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.grossTotal || 0)), 0),
          paidAmount: monthInvoices.filter(inv => inv.status === "bezahlt").reduce((sum, inv) => sum + parseFloat(String(inv.grossTotal || 0)), 0),
        };
      });
      return { year, months, totalRevenue: months.reduce((s, m) => s + m.totalAmount, 0) };
    }),

  // Conversion-Bericht: Angebote → Aufträge
  conversion: protectedProcedure.query(async () => {
    const offers = await db.getAllOffers();
    const total = offers.length;
    const accepted = offers.filter(o => o.status === "angenommen").length;
    const rejected = offers.filter(o => o.status === "abgelehnt").length;
    const pending = offers.filter(o => ["erstellt", "versendet"].includes(o.status)).length;
    return {
      total,
      accepted,
      rejected,
      pending,
      conversionRate: total > 0 ? Math.round((accepted / total) * 100) : 0,
    };
  }),

  // Fortschrittsbericht: Aktive Baustellen
  progress: protectedProcedure.query(async () => {
    const sites = await db.getAllConstructionSites();
    return sites
      .filter(s => s.status === "aktiv")
      .map(s => ({
        id: s.id,
        name: s.name,
        siteNumber: s.siteNumber,
        progress: s.progress || 0,
        startDate: s.startDate,
        endDate: s.endDate,
        totalArea: s.totalArea,
      }));
  }),

  // Auslastungsbericht: Team-Mitglieder
  utilization: protectedProcedure.query(async () => {
    const sites = await db.getAllConstructionSites();
    const activeSites = sites.filter(s => s.status === "aktiv");
    const tasks = await db.getAllTasks();
    const openTasks = tasks.filter(t => t.status === "offen" || t.status === "in_bearbeitung");
    return {
      activeSiteCount: activeSites.length,
      openTaskCount: openTasks.length,
      tasksByPriority: {
        dringend: openTasks.filter(t => t.priority === "dringend").length,
        hoch: openTasks.filter(t => t.priority === "hoch").length,
        normal: openTasks.filter(t => t.priority === "normal").length,
        niedrig: openTasks.filter(t => t.priority === "niedrig").length,
      },
    };
  }),

  // Offene Posten
  openItems: protectedProcedure.query(async () => {
    const invoices = await db.getAllInvoices();
    const openInvoices = invoices.filter(inv => inv.status !== "bezahlt" && inv.status !== "storniert");
    return {
      count: openInvoices.length,
      totalAmount: openInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.grossTotal || 0)), 0),
      invoices: openInvoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amount: parseFloat(String(inv.grossTotal || 0)),
        status: inv.status,
        dueDate: inv.dueDate,
        createdAt: inv.createdAt,
      })),
    };
  }),
});

// ============================================
// DEPLOYMENT ROUTER (Phase 4b)
// ============================================
const deploymentRouter = router({
  // Einsatzplanung: Alle geplanten und aktiven Einsätze
  list: protectedProcedure.query(async () => {
    const sites = await db.getAllConstructionSites();
    return sites.map(s => ({
      id: s.id,
      siteNumber: s.siteNumber,
      name: s.name,
      address: s.address,
      status: s.status,
      startDate: s.startDate,
      endDate: s.endDate,
      progress: s.progress || 0,
      totalArea: s.totalArea,
      projektleiterId: s.projektleiterId,
      teamMembers: s.teamMembers || [],
      equipment: s.equipment || [],
    }));
  }),

  // Kalenderansicht: Einsätze nach Zeitraum
  calendar: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
    }))
    .query(async ({ input }) => {
      const sites = await db.getAllConstructionSites();
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      return sites.filter(s => {
        if (!s.startDate) return false;
        const sStart = new Date(s.startDate);
        const sEnd = s.endDate ? new Date(s.endDate) : sStart;
        return sStart <= end && sEnd >= start;
      }).map(s => ({
        id: s.id,
        title: `${s.siteNumber} - ${s.name}`,
        start: s.startDate,
        end: s.endDate,
        status: s.status,
        progress: s.progress || 0,
      }));
    }),

  // Konfliktprüfung: Überlappende Einsätze
  checkConflicts: protectedProcedure
    .input(z.object({
      startDate: z.string(),
      endDate: z.string(),
      excludeSiteId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const sites = await db.getAllConstructionSites();
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      const conflicts = sites.filter(s => {
        if (input.excludeSiteId && s.id === input.excludeSiteId) return false;
        if (s.status === "abgeschlossen") return false;
        if (!s.startDate) return false;
        const sStart = new Date(s.startDate);
        const sEnd = s.endDate ? new Date(s.endDate) : sStart;
        return sStart <= end && sEnd >= start;
      });
      return {
        hasConflicts: conflicts.length > 0,
        conflicts: conflicts.map(s => ({
          id: s.id,
          name: s.name,
          siteNumber: s.siteNumber,
          startDate: s.startDate,
          endDate: s.endDate,
        })),
      };
    }),
});

// ============================================
// RESOURCE ROUTER (Phase 4c)
// ============================================
const resourceRouter = router({
  // Teamverfügbarkeit
  teamAvailability: protectedProcedure.query(async () => {
    const sites = await db.getAllConstructionSites();
    const activeSites = sites.filter(s => s.status === "aktiv");
    // Collect all assigned team members
    const assignedMembers = new Set<number>();
    activeSites.forEach(s => {
      (s.teamMembers || []).forEach(id => assignedMembers.add(id));
      if (s.projektleiterId) assignedMembers.add(s.projektleiterId);
    });
    return {
      totalAssigned: assignedMembers.size,
      activeSites: activeSites.length,
      siteDetails: activeSites.map(s => ({
        id: s.id,
        name: s.name,
        teamSize: (s.teamMembers || []).length + (s.projektleiterId ? 1 : 0),
        startDate: s.startDate,
        endDate: s.endDate,
      })),
    };
  }),

  // Geräteauslastung
  equipmentUsage: protectedProcedure.query(async () => {
    const sites = await db.getAllConstructionSites();
    const activeSites = sites.filter(s => s.status === "aktiv" || s.status === "geplant");
    const equipmentMap = new Map<string, { count: number; sites: string[] }>();
    activeSites.forEach(s => {
      (s.equipment || []).forEach(eq => {
        const existing = equipmentMap.get(eq) || { count: 0, sites: [] };
        existing.count++;
        existing.sites.push(s.siteNumber);
        equipmentMap.set(eq, existing);
      });
    });
    return Array.from(equipmentMap.entries()).map(([name, data]) => ({
      name,
      inUse: data.count,
      assignedTo: data.sites,
    }));
  }),

  // Kapazitätsplanung: Wochen-Übersicht
  capacityOverview: protectedProcedure
    .input(z.object({ weeks: z.number().default(8) }))
    .query(async ({ input }) => {
      const sites = await db.getAllConstructionSites();
      const now = new Date();
      const weeks = Array.from({ length: input.weeks }, (_, i) => {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() + i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const activeSites = sites.filter(s => {
          if (!s.startDate) return false;
          const sStart = new Date(s.startDate);
          const sEnd = s.endDate ? new Date(s.endDate) : sStart;
          return sStart <= weekEnd && sEnd >= weekStart && s.status !== "abgeschlossen";
        });
        return {
          weekNumber: i + 1,
          startDate: weekStart.toISOString(),
          endDate: weekEnd.toISOString(),
          activeSiteCount: activeSites.length,
          totalTeamMembers: activeSites.reduce((sum, s) => sum + (s.teamMembers || []).length, 0),
        };
      });
      return weeks;
    }),
});

// ============================================
// FINANCE ROUTER (Phase 4d)
// ============================================
const financeRouter = router({
  // Umsatz-Dashboard
  dashboard: protectedProcedure
    .input(z.object({ year: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const year = input?.year || new Date().getFullYear();
      const invoices = await db.getAllInvoices();
      const yearInvoices = invoices.filter(inv => new Date(inv.createdAt).getFullYear() === year);
      const totalRevenue = yearInvoices.reduce((sum, inv) => sum + parseFloat(String(inv.grossTotal || 0)), 0);
      const paidRevenue = yearInvoices.filter(inv => inv.status === "bezahlt").reduce((sum, inv) => sum + parseFloat(String(inv.grossTotal || 0)), 0);
      const openRevenue = yearInvoices.filter(inv => inv.status !== "bezahlt" && inv.status !== "storniert").reduce((sum, inv) => sum + parseFloat(String(inv.grossTotal || 0)), 0);
      return {
        year,
        totalRevenue,
        paidRevenue,
        openRevenue,
        invoiceCount: yearInvoices.length,
        paidCount: yearInvoices.filter(inv => inv.status === "bezahlt").length,
        overdueCount: yearInvoices.filter(inv => inv.status === "ueberfaellig").length,
      };
    }),

  // Außenstände
  outstanding: protectedProcedure.query(async () => {
    const invoices = await db.getAllInvoices();
    const outstanding = invoices.filter(inv => inv.status !== "bezahlt" && inv.status !== "storniert");
    const byAge = {
      current: outstanding.filter(inv => {
        if (!inv.dueDate) return true;
        return new Date(inv.dueDate) >= new Date();
      }),
      overdue30: outstanding.filter(inv => {
        if (!inv.dueDate) return false;
        const due = new Date(inv.dueDate);
        const now = new Date();
        const diff = (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 0 && diff <= 30;
      }),
      overdue60: outstanding.filter(inv => {
        if (!inv.dueDate) return false;
        const due = new Date(inv.dueDate);
        const now = new Date();
        const diff = (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 30 && diff <= 60;
      }),
      overdue90: outstanding.filter(inv => {
        if (!inv.dueDate) return false;
        const due = new Date(inv.dueDate);
        const now = new Date();
        const diff = (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24);
        return diff > 60;
      }),
    };
    return {
      totalOutstanding: outstanding.reduce((sum, inv) => sum + parseFloat(String(inv.grossTotal || 0)), 0),
      current: { count: byAge.current.length, amount: byAge.current.reduce((s, i) => s + parseFloat(String(i.grossTotal || 0)), 0) },
      overdue30: { count: byAge.overdue30.length, amount: byAge.overdue30.reduce((s, i) => s + parseFloat(String(i.grossTotal || 0)), 0) },
      overdue60: { count: byAge.overdue60.length, amount: byAge.overdue60.reduce((s, i) => s + parseFloat(String(i.grossTotal || 0)), 0) },
      overdue90: { count: byAge.overdue90.length, amount: byAge.overdue90.reduce((s, i) => s + parseFloat(String(i.grossTotal || 0)), 0) },
    };
  }),

  // Cashflow: Monatliche Ein-/Ausgaben
  cashflow: protectedProcedure
    .input(z.object({ year: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const year = input?.year || new Date().getFullYear();
      const payments = await db.getAllPayments();
      const months = Array.from({ length: 12 }, (_, i) => {
        const monthPayments = payments.filter(p => {
          const d = new Date(p.createdAt);
          return d.getFullYear() === year && d.getMonth() === i;
        });
        return {
          month: i + 1,
          income: monthPayments.filter(p => p.status === "eingegangen").reduce((s, p) => s + parseFloat(String(p.amount || 0)), 0),
          expense: monthPayments.filter(p => p.status === "rueckbuchung").reduce((s, p) => s + parseFloat(String(p.amount || 0)), 0),
        };
      });
      return { year, months };
    }),
});

// ============================================
// KUNDENPORTAL ROUTER (Phase 5)
// ============================================
const portalRouter = router({
  // Portal-Login via Token
  validateToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const tokenData = await db.getCustomerPortalTokenByToken(input.token);
      if (!tokenData) return { valid: false as const, error: "Ung\u00fcltiger Zugangslink" };
      if (tokenData.expiresAt && new Date(tokenData.expiresAt) < new Date()) return { valid: false as const, error: "Zugangslink abgelaufen" };
      await db.updateCustomerPortalTokenAccess(tokenData.id);
      const company = tokenData.companyId ? await db.getCompanyById(tokenData.companyId) : null;
      return { valid: true as const, companyId: tokenData.companyId, companyName: company?.name, projectIds: tokenData.projectIds, permissions: tokenData.permissions };
    }),

  // Nachrichten
  getMessages: protectedProcedure
    .input(z.object({ companyId: z.number(), projectId: z.number().optional() }))
    .query(async ({ input }) => {
      const { getDb } = await import('./db');
      const { portalMessages } = await import('../drizzle/schema');
      const { eq, and, desc } = await import('drizzle-orm');
      const database = (await getDb())!;
      let conditions = eq(portalMessages.companyId, input.companyId);
      const where = input.projectId
        ? and(conditions, eq(portalMessages.projectId, input.projectId))
        : conditions;
      return database.select().from(portalMessages).where(where).orderBy(desc(portalMessages.createdAt));
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      companyId: z.number(),
      projectId: z.number().optional(),
      senderType: z.enum(["customer", "fassadenfix"]),
      senderName: z.string(),
      senderContactId: z.number().optional(),
      senderUserId: z.number().optional(),
      subject: z.string().optional(),
      message: z.string(),
      attachmentUrls: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const { getDb } = await import('./db');
      const { portalMessages } = await import('../drizzle/schema');
      const database = (await getDb())!;
      const [msg] = await database.insert(portalMessages).values({
        companyId: input.companyId,
        projectId: input.projectId,
        senderType: input.senderType,
        senderName: input.senderName,
        senderContactId: input.senderContactId,
        senderUserId: input.senderUserId,
        subject: input.subject,
        message: input.message,
        attachmentUrls: input.attachmentUrls,
      });
      return { id: msg.insertId };
    }),

  markMessageRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { getDb } = await import('./db');
      const { portalMessages } = await import('../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const database = (await getDb())!;
      await database.update(portalMessages)
        .set({ isRead: true, readAt: new Date() })
        .where(eq(portalMessages.id, input.id));
      return { success: true };
    }),

  // Feedback
  submitFeedback: protectedProcedure
    .input(z.object({
      companyId: z.number(),
      projectId: z.number(),
      contactId: z.number().optional(),
      overallRating: z.number().min(1).max(5),
      qualityRating: z.number().min(1).max(5).optional(),
      communicationRating: z.number().min(1).max(5).optional(),
      timelinessRating: z.number().min(1).max(5).optional(),
      positiveComment: z.string().optional(),
      improvementComment: z.string().optional(),
      wouldRecommend: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { getDb } = await import('./db');
      const { portalFeedback } = await import('../drizzle/schema');
      const database = (await getDb())!;
      const [fb] = await database.insert(portalFeedback).values(input);
      return { id: fb.insertId };
    }),

  getFeedback: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ input }) => {
      const { getDb } = await import('./db');
      const { portalFeedback } = await import('../drizzle/schema');
      const { eq, desc } = await import('drizzle-orm');
      const database = (await getDb())!;
      return database.select().from(portalFeedback).where(eq(portalFeedback.projectId, input.projectId)).orderBy(desc(portalFeedback.createdAt));
    }),

  // Dokumenten-Upload
  getUploads: protectedProcedure
    .input(z.object({ companyId: z.number() }))
    .query(async ({ input }) => {
      const { getDb } = await import('./db');
      const { portalUploads } = await import('../drizzle/schema');
      const { eq, desc } = await import('drizzle-orm');
      const database = (await getDb())!;
      return database.select().from(portalUploads).where(eq(portalUploads.companyId, input.companyId)).orderBy(desc(portalUploads.createdAt));
    }),

  createUpload: protectedProcedure
    .input(z.object({
      companyId: z.number(),
      projectId: z.number().optional(),
      contactId: z.number().optional(),
      fileName: z.string(),
      fileUrl: z.string(),
      fileSize: z.number().optional(),
      mimeType: z.string().optional(),
      category: z.enum(["vollmacht", "genehmigung", "vertrag", "sonstiges"]).optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { getDb } = await import('./db');
      const { portalUploads } = await import('../drizzle/schema');
      const database = (await getDb())!;
      const [upload] = await database.insert(portalUploads).values(input);
      return { id: upload.insertId };
    }),

  reviewUpload: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["geprueft", "abgelehnt"]),
      reviewNote: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { getDb } = await import('./db');
      const { portalUploads } = await import('../drizzle/schema');
      const { eq } = await import('drizzle-orm');
      const database = (await getDb())!;
      await database.update(portalUploads)
        .set({ status: input.status, reviewedBy: ctx.user.id, reviewNote: input.reviewNote })
        .where(eq(portalUploads.id, input.id));
      return { success: true };
    }),
});

// ============================================
// BIBLIOTHEK ROUTER (Zentrale Stammdaten-Plattform)
// ============================================

// Berechtigungsprüfung als Middleware
const libraryViewProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  // Admins und Owner dürfen immer
  if (ctx.user.role === 'admin') return next({ ctx });
  const hasPermission = await db.checkLibraryPermission(ctx.user.id, 'view');
  if (!hasPermission) throw new TRPCError({ code: 'FORBIDDEN', message: 'Keine Berechtigung für die Bibliothek' });
  return next({ ctx });
});

const libraryEditProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role === 'admin') return next({ ctx });
  const hasPermission = await db.checkLibraryPermission(ctx.user.id, 'edit');
  if (!hasPermission) throw new TRPCError({ code: 'FORBIDDEN', message: 'Keine Berechtigung zum Bearbeiten der Bibliothek' });
  return next({ ctx });
});

// Generische Zod-Schemas für Bibliothek
const libraryStatusSchema = z.enum(['aktiv', 'inaktiv']).optional();

const libraryRouter = router({
  // --- FAHRZEUGE ---
  vehicles: router({
    list: libraryViewProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => db.libraryVehiclesCRUD.list(input ?? undefined)),
    getById: libraryViewProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.libraryVehiclesCRUD.getById(input.id)),
    create: libraryEditProcedure
      .input(z.object({
        name: z.string().min(1),
        vehicleType: z.enum(['waschbus', 'dienstwagen', 'poolfahrzeug', 'anhaenger', 'transporter']),
        licensePlate: z.string().optional(),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        year: z.number().optional(),
        capacity: z.string().optional(),
        tuevDate: z.date().optional(),
        insuranceExpiry: z.date().optional(),
        mileage: z.number().optional(),
        fuelType: z.enum(['diesel', 'benzin', 'elektro', 'hybrid']).optional(),
        dailyCost: z.string().optional(),
        assignedTo: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.libraryVehiclesCRUD.create({ ...input, createdBy: ctx.user.id, updatedBy: ctx.user.id });
        await db.createActivityLog({ action: 'created', entityType: 'library_vehicle', entityId: result?.id ?? 0, entityName: input.name, userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Fahrzeug "${input.name}" angelegt` });
        return result;
      }),
    update: libraryEditProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        vehicleType: z.enum(['waschbus', 'dienstwagen', 'poolfahrzeug', 'anhaenger', 'transporter']).optional(),
        licensePlate: z.string().optional(),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        year: z.number().optional(),
        capacity: z.string().optional(),
        tuevDate: z.date().optional(),
        insuranceExpiry: z.date().optional(),
        mileage: z.number().optional(),
        fuelType: z.enum(['diesel', 'benzin', 'elektro', 'hybrid']).optional(),
        dailyCost: z.string().optional(),
        assignedTo: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(['aktiv', 'inaktiv', 'werkstatt', 'verkauft']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const result = await db.libraryVehiclesCRUD.update(id, { ...data, updatedBy: ctx.user.id });
        await db.createActivityLog({ action: 'updated', entityType: 'library_vehicle', entityId: id, entityName: result?.name ?? '', userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Fahrzeug aktualisiert` });
        return result;
      }),
    deactivate: libraryEditProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const item = await db.libraryVehiclesCRUD.getById(input.id);
        await db.libraryVehiclesCRUD.deactivate(input.id);
        await db.createActivityLog({ action: 'deactivated', entityType: 'library_vehicle', entityId: input.id, entityName: item?.name ?? '', userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Fahrzeug deaktiviert` });
        return true;
      }),
  }),

  // --- BÜHNENTECHNIK & GERÄTE ---
  equipment: router({
    list: libraryViewProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => db.libraryEquipmentCRUD.list(input ?? undefined)),
    getById: libraryViewProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.libraryEquipmentCRUD.getById(input.id)),
    create: libraryEditProcedure
      .input(z.object({
        name: z.string().min(1),
        equipmentType: z.enum(['gelenkteleskop', 'teleskop', 'scherenlift', 'anhaengerlift', 'hochdruckreiniger', 'sprühgeraet', 'sonstiges']),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        maxHeight: z.string().optional(),
        maxReach: z.string().optional(),
        weight: z.string().optional(),
        ownership: z.enum(['eigen', 'miete', 'dauermiete', 'leasing']).optional(),
        dailyRate: z.string().optional(),
        purchasePrice: z.string().optional(),
        inspectionDate: z.date().optional(),
        serialNumber: z.string().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.libraryEquipmentCRUD.create({ ...input, createdBy: ctx.user.id, updatedBy: ctx.user.id });
        await db.createActivityLog({ action: 'created', entityType: 'library_equipment', entityId: result?.id ?? 0, entityName: input.name, userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Gerät "${input.name}" angelegt` });
        return result;
      }),
    update: libraryEditProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        equipmentType: z.enum(['gelenkteleskop', 'teleskop', 'scherenlift', 'anhaengerlift', 'hochdruckreiniger', 'sprühgeraet', 'sonstiges']).optional(),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        maxHeight: z.string().optional(),
        maxReach: z.string().optional(),
        weight: z.string().optional(),
        ownership: z.enum(['eigen', 'miete', 'dauermiete', 'leasing']).optional(),
        dailyRate: z.string().optional(),
        purchasePrice: z.string().optional(),
        inspectionDate: z.date().optional(),
        serialNumber: z.string().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(['aktiv', 'inaktiv', 'wartung', 'defekt']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const result = await db.libraryEquipmentCRUD.update(id, { ...data, updatedBy: ctx.user.id });
        await db.createActivityLog({ action: 'updated', entityType: 'library_equipment', entityId: id, entityName: result?.name ?? '', userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Gerät aktualisiert` });
        return result;
      }),
    deactivate: libraryEditProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const item = await db.libraryEquipmentCRUD.getById(input.id);
        await db.libraryEquipmentCRUD.deactivate(input.id);
        await db.createActivityLog({ action: 'deactivated', entityType: 'library_equipment', entityId: input.id, entityName: item?.name ?? '', userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Gerät deaktiviert` });
        return true;
      }),
  }),

  // --- REINIGUNGSMITTEL ---
  cleaningAgents: router({
    list: libraryViewProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => db.libraryCleaningAgentsCRUD.list(input ?? undefined)),
    getById: libraryViewProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.libraryCleaningAgentsCRUD.getById(input.id)),
    create: libraryEditProcedure
      .input(z.object({
        name: z.string().min(1),
        articleNumber: z.string().optional(),
        applicationArea: z.string().optional(),
        containerSize: z.string().optional(),
        purchasePrice: z.string().optional(),
        sellingPrice: z.string().optional(),
        coveragePerLiter: z.string().optional(),
        safetyDataSheetUrl: z.string().optional(),
        supplier: z.string().optional(),
        minStock: z.number().optional(),
        currentStock: z.number().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.libraryCleaningAgentsCRUD.create({ ...input, createdBy: ctx.user.id, updatedBy: ctx.user.id });
        await db.createActivityLog({ action: 'created', entityType: 'library_cleaning_agent', entityId: result?.id ?? 0, entityName: input.name, userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Reinigungsmittel "${input.name}" angelegt` });
        return result;
      }),
    update: libraryEditProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        articleNumber: z.string().optional(),
        applicationArea: z.string().optional(),
        containerSize: z.string().optional(),
        purchasePrice: z.string().optional(),
        sellingPrice: z.string().optional(),
        coveragePerLiter: z.string().optional(),
        safetyDataSheetUrl: z.string().optional(),
        supplier: z.string().optional(),
        minStock: z.number().optional(),
        currentStock: z.number().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(['aktiv', 'inaktiv', 'auslaufend']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const result = await db.libraryCleaningAgentsCRUD.update(id, { ...data, updatedBy: ctx.user.id });
        await db.createActivityLog({ action: 'updated', entityType: 'library_cleaning_agent', entityId: id, entityName: result?.name ?? '', userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Reinigungsmittel aktualisiert` });
        return result;
      }),
    deactivate: libraryEditProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const item = await db.libraryCleaningAgentsCRUD.getById(input.id);
        await db.libraryCleaningAgentsCRUD.deactivate(input.id);
        await db.createActivityLog({ action: 'deactivated', entityType: 'library_cleaning_agent', entityId: input.id, entityName: item?.name ?? '', userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Reinigungsmittel deaktiviert` });
        return true;
      }),
  }),

  // --- RABATTE & AKTIONEN ---
  discounts: router({
    list: libraryViewProcedure
      .input(z.object({ status: z.string().optional(), discountType: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const items = await db.libraryDiscountsCRUD.list(input ?? undefined);
        if (input?.discountType) {
          return items.filter((i: any) => i.discountType === input.discountType);
        }
        return items;
      }),
    getById: libraryViewProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.libraryDiscountsCRUD.getById(input.id)),
    create: libraryEditProcedure
      .input(z.object({
        name: z.string().min(1),
        discountType: z.enum(['preisstaffel', 'fruehbucher', 'mengenrabatt', 'treuerabatt', 'kennenlern', 'aktion', 'sonstiges']),
        percentage: z.string().optional(),
        absoluteAmount: z.string().optional(),
        conditions: z.string().optional(),
        validFrom: z.date().optional(),
        validUntil: z.date().optional(),
        stoererText: z.string().optional(),
        stoererSubtext: z.string().optional(),
        minFlaeche: z.number().optional(),
        maxFlaeche: z.number().optional(),
        pricePerSqm: z.string().optional(),
        combinable: z.boolean().optional(),
        code: z.string().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.libraryDiscountsCRUD.create({ ...input, createdBy: ctx.user.id, updatedBy: ctx.user.id });
        await db.createActivityLog({ action: 'created', entityType: 'library_discount', entityId: result?.id ?? 0, entityName: input.name, userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Rabatt/Aktion "${input.name}" angelegt` });
        return result;
      }),
    update: libraryEditProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        discountType: z.enum(['preisstaffel', 'fruehbucher', 'mengenrabatt', 'treuerabatt', 'kennenlern', 'aktion', 'sonstiges']).optional(),
        percentage: z.string().optional(),
        absoluteAmount: z.string().optional(),
        conditions: z.string().optional(),
        validFrom: z.date().optional(),
        validUntil: z.date().optional(),
        stoererText: z.string().optional(),
        stoererSubtext: z.string().optional(),
        minFlaeche: z.number().optional(),
        maxFlaeche: z.number().optional(),
        pricePerSqm: z.string().optional(),
        combinable: z.boolean().optional(),
        code: z.string().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(['aktiv', 'inaktiv', 'abgelaufen']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const result = await db.libraryDiscountsCRUD.update(id, { ...data, updatedBy: ctx.user.id });
        await db.createActivityLog({ action: 'updated', entityType: 'library_discount', entityId: id, entityName: result?.name ?? '', userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Rabatt/Aktion aktualisiert` });
        return result;
      }),
    deactivate: libraryEditProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const item = await db.libraryDiscountsCRUD.getById(input.id);
        await db.libraryDiscountsCRUD.deactivate(input.id);
        await db.createActivityLog({ action: 'deactivated', entityType: 'library_discount', entityId: input.id, entityName: item?.name ?? '', userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Rabatt/Aktion deaktiviert` });
        return true;
      }),
  }),

  // --- LEISTUNGSKATALOG ---
  services: router({
    list: libraryViewProcedure
      .input(z.object({ status: z.string().optional(), serviceType: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const items = await db.libraryServicesCRUD.list(input ?? undefined);
        if (input?.serviceType) {
          return items.filter((i: any) => i.serviceType === input.serviceType);
        }
        return items;
      }),
    getById: libraryViewProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.libraryServicesCRUD.getById(input.id)),
    create: libraryEditProcedure
      .input(z.object({
        name: z.string().min(1),
        serviceType: z.enum(['hauptleistung', 'zusatzleistung', 'garantie', 'wartung', 'inspektion']),
        description: z.string().optional(),
        scope: z.string().optional(),
        duration: z.string().optional(),
        basePrice: z.string().optional(),
        pricingUnit: z.string().optional(),
        includedInOffer: z.boolean().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.libraryServicesCRUD.create({ ...input, createdBy: ctx.user.id, updatedBy: ctx.user.id });
        await db.createActivityLog({ action: 'created', entityType: 'library_service', entityId: result?.id ?? 0, entityName: input.name, userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Leistung "${input.name}" angelegt` });
        return result;
      }),
    update: libraryEditProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        serviceType: z.enum(['hauptleistung', 'zusatzleistung', 'garantie', 'wartung', 'inspektion']).optional(),
        description: z.string().optional(),
        scope: z.string().optional(),
        duration: z.string().optional(),
        basePrice: z.string().optional(),
        pricingUnit: z.string().optional(),
        includedInOffer: z.boolean().optional(),
        notes: z.string().optional(),
        status: z.enum(['aktiv', 'inaktiv']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const result = await db.libraryServicesCRUD.update(id, { ...data, updatedBy: ctx.user.id });
        await db.createActivityLog({ action: 'updated', entityType: 'library_service', entityId: id, entityName: result?.name ?? '', userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Leistung aktualisiert` });
        return result;
      }),
    deactivate: libraryEditProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const item = await db.libraryServicesCRUD.getById(input.id);
        await db.libraryServicesCRUD.deactivate(input.id);
        await db.createActivityLog({ action: 'deactivated', entityType: 'library_service', entityId: input.id, entityName: item?.name ?? '', userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Leistung deaktiviert` });
        return true;
      }),
  }),

  // --- ARBEITSKLEIDUNG & PSA ---
  workClothing: router({
    list: libraryViewProcedure
      .input(z.object({ status: z.string().optional() }).optional())
      .query(async ({ input }) => db.libraryWorkClothingCRUD.list(input ?? undefined)),
    getById: libraryViewProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.libraryWorkClothingCRUD.getById(input.id)),
    create: libraryEditProcedure
      .input(z.object({
        name: z.string().min(1),
        clothingType: z.enum(['oberteil', 'hose', 'schuhe', 'handschuhe', 'helm', 'brille', 'gehoerschutz', 'weste', 'regenkleidung', 'sonstiges']),
        size: z.string().optional(),
        supplier: z.string().optional(),
        articleNumber: z.string().optional(),
        purchasePrice: z.string().optional(),
        minStock: z.number().optional(),
        currentStock: z.number().optional(),
        isPSA: z.boolean().optional(),
        certificationRequired: z.boolean().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.libraryWorkClothingCRUD.create({ ...input, createdBy: ctx.user.id, updatedBy: ctx.user.id });
        await db.createActivityLog({ action: 'created', entityType: 'library_work_clothing', entityId: result?.id ?? 0, entityName: input.name, userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Arbeitskleidung "${input.name}" angelegt` });
        return result;
      }),
    update: libraryEditProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        clothingType: z.enum(['oberteil', 'hose', 'schuhe', 'handschuhe', 'helm', 'brille', 'gehoerschutz', 'weste', 'regenkleidung', 'sonstiges']).optional(),
        size: z.string().optional(),
        supplier: z.string().optional(),
        articleNumber: z.string().optional(),
        purchasePrice: z.string().optional(),
        minStock: z.number().optional(),
        currentStock: z.number().optional(),
        isPSA: z.boolean().optional(),
        certificationRequired: z.boolean().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(['aktiv', 'inaktiv', 'bestellt']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const result = await db.libraryWorkClothingCRUD.update(id, { ...data, updatedBy: ctx.user.id });
        await db.createActivityLog({ action: 'updated', entityType: 'library_work_clothing', entityId: id, entityName: result?.name ?? '', userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Arbeitskleidung aktualisiert` });
        return result;
      }),
    deactivate: libraryEditProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const item = await db.libraryWorkClothingCRUD.getById(input.id);
        await db.libraryWorkClothingCRUD.deactivate(input.id);
        await db.createActivityLog({ action: 'deactivated', entityType: 'library_work_clothing', entityId: input.id, entityName: item?.name ?? '', userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Arbeitskleidung deaktiviert` });
        return true;
      }),
  }),

  // --- ARBEITSMITTEL (IT, Schlüssel, Tankkarten) ---
  assets: router({
    list: libraryViewProcedure
      .input(z.object({ status: z.string().optional(), assetType: z.string().optional() }).optional())
      .query(async ({ input }) => {
        const items = await db.libraryAssetsCRUD.list(input ?? undefined);
        if (input?.assetType) {
          return items.filter((i: any) => i.assetType === input.assetType);
        }
        return items;
      }),
    getById: libraryViewProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.libraryAssetsCRUD.getById(input.id)),
    create: libraryEditProcedure
      .input(z.object({
        name: z.string().min(1),
        assetType: z.enum(['laptop', 'smartphone', 'tablet', 'schluessel', 'tankkarte', 'kreditkarte', 'werkzeug', 'sonstiges']),
        serialNumber: z.string().optional(),
        inventoryNumber: z.string().optional(),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        purchaseDate: z.date().optional(),
        purchasePrice: z.string().optional(),
        warrantyUntil: z.date().optional(),
        assignedToMemberId: z.number().optional(),
        assignedToName: z.string().optional(),
        assignedAt: z.date().optional(),
        cardNumber: z.string().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.libraryAssetsCRUD.create({ ...input, createdBy: ctx.user.id, updatedBy: ctx.user.id });
        await db.createActivityLog({ action: 'created', entityType: 'library_asset', entityId: result?.id ?? 0, entityName: input.name, userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Arbeitsmittel "${input.name}" angelegt` });
        return result;
      }),
    update: libraryEditProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        assetType: z.enum(['laptop', 'smartphone', 'tablet', 'schluessel', 'tankkarte', 'kreditkarte', 'werkzeug', 'sonstiges']).optional(),
        serialNumber: z.string().optional(),
        inventoryNumber: z.string().optional(),
        manufacturer: z.string().optional(),
        model: z.string().optional(),
        purchaseDate: z.date().optional(),
        purchasePrice: z.string().optional(),
        warrantyUntil: z.date().optional(),
        assignedToMemberId: z.number().optional(),
        assignedToName: z.string().optional(),
        assignedAt: z.date().optional(),
        cardNumber: z.string().optional(),
        description: z.string().optional(),
        notes: z.string().optional(),
        status: z.enum(['aktiv', 'inaktiv', 'verloren', 'defekt', 'zurueckgegeben']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const result = await db.libraryAssetsCRUD.update(id, { ...data, updatedBy: ctx.user.id });
        await db.createActivityLog({ action: 'updated', entityType: 'library_asset', entityId: id, entityName: result?.name ?? '', userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Arbeitsmittel aktualisiert` });
        return result;
      }),
    deactivate: libraryEditProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const item = await db.libraryAssetsCRUD.getById(input.id);
        await db.libraryAssetsCRUD.deactivate(input.id);
        await db.createActivityLog({ action: 'deactivated', entityType: 'library_asset', entityId: input.id, entityName: item?.name ?? '', userId: ctx.user.id, userName: ctx.user.name || 'System', details: `Arbeitsmittel deaktiviert` });
        return true;
      }),
  }),
});

// ============================================
// GATE ROUTER (Qualitäts-Gates: Vorher-Doku, Teamleitercheck, Nachher-Doku)
// ============================================
const gateRouter = router({
  // Foto hochladen für ein Gate
  uploadPhoto: protectedProcedure
    .input(z.object({
      constructionSiteId: z.number(),
      gateType: z.enum(["vorher", "nachher"]),
      fileData: z.string(), // base64-encoded
      contentType: z.string().default("image/jpeg"),
      caption: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { storagePut } = await import('./storage');
      
      // Auto-Benennung: YYYY_Baustelle_Gate_NNN.jpg
      const site = await db.getConstructionSiteById(input.constructionSiteId);
      if (!site) throw new Error("Baustelle nicht gefunden");
      
      const existingPhotos = await db.getGatePhotos(input.constructionSiteId, input.gateType);
      const nr = String(existingPhotos.length + 1).padStart(3, "0");
      const year = new Date().getFullYear();
      const siteName = (site.name || "Baustelle").replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, "_").substring(0, 30);
      const ext = input.contentType === "image/png" ? "png" : "jpg";
      const fileName = `${year}_${siteName}_${input.gateType}_${nr}.${ext}`;
      
      // Upload to S3
      const buffer = Buffer.from(input.fileData, "base64");
      const fileKey = `gate-photos/${input.constructionSiteId}/${input.gateType}/${fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.contentType);
      
      // Save metadata
      const photo = await db.createGatePhoto({
        constructionSiteId: input.constructionSiteId,
        gateType: input.gateType,
        photoUrl: url,
        fileKey,
        fileName,
        caption: input.caption,
        uploadedById: ctx.user.id,
        uploadedByName: ctx.user.name || ctx.user.email || "Unbekannt",
      });
      
      // Auto-update preDocumentationStatus to in_progress
      if (input.gateType === "vorher" && site.preDocumentationStatus === "pending") {
        const dbInst = await db.getDb();
        if (dbInst) {
          const { constructionSites } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          await dbInst.update(constructionSites)
            .set({ preDocumentationStatus: "in_progress" })
            .where(eq(constructionSites.id, input.constructionSiteId));
        }
      }
      if (input.gateType === "nachher" && site.postDocumentationStatus === "pending") {
        const dbInst = await db.getDb();
        if (dbInst) {
          const { constructionSites } = await import("../drizzle/schema");
          const { eq } = await import("drizzle-orm");
          await dbInst.update(constructionSites)
            .set({ postDocumentationStatus: "in_progress" })
            .where(eq(constructionSites.id, input.constructionSiteId));
        }
      }
      
      return photo;
    }),

  // Fotos pro Gate abrufen
  getPhotos: protectedProcedure
    .input(z.object({
      constructionSiteId: z.number(),
      gateType: z.enum(["vorher", "nachher"]).optional(),
    }))
    .query(async ({ input }) => {
      return db.getGatePhotos(input.constructionSiteId, input.gateType);
    }),

  // Vorher-Dokumentation abschließen (min. 1 Foto Pflicht)
  completePreDocumentation: protectedProcedure
    .input(z.object({ constructionSiteId: z.number() }))
    .mutation(async ({ input }) => {
      const photoCount = await db.getGatePhotoCount(input.constructionSiteId, "vorher");
      if (photoCount === 0) {
        throw new Error("Mindestens ein Vorher-Foto muss hochgeladen werden, bevor die Dokumentation abgeschlossen werden kann.");
      }
      await db.completePreDocumentation(input.constructionSiteId);
      return { success: true, message: "Vorher-Dokumentation abgeschlossen" };
    }),

  // Nachher-Dokumentation abschließen
  completePostDocumentation: protectedProcedure
    .input(z.object({ constructionSiteId: z.number() }))
    .mutation(async ({ input }) => {
      const photoCount = await db.getGatePhotoCount(input.constructionSiteId, "nachher");
      if (photoCount === 0) {
        throw new Error("Mindestens ein Nachher-Foto muss hochgeladen werden, bevor die Dokumentation abgeschlossen werden kann.");
      }
      await db.completePostDocumentation(input.constructionSiteId);
      return { success: true, message: "Nachher-Dokumentation abgeschlossen" };
    }),

  // Teamleitercheck: Checkliste speichern und Gate abschließen
  submitTeamleiterCheck: protectedProcedure
    .input(z.object({
      constructionSiteId: z.number(),
      projectId: z.number(),
      checkItems: z.array(z.object({
        id: z.string(),
        category: z.string(),
        label: z.string(),
        checked: z.boolean(),
        notes: z.string().optional(),
      })),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Alle Pflicht-Items müssen abgehakt sein
      const unchecked = input.checkItems.filter(item => !item.checked);
      if (unchecked.length > 0) {
        throw new Error(`Folgende Punkte müssen noch abgehakt werden: ${unchecked.map(i => i.label).join(", ")}`);
      }
      
      // Checkliste speichern
      await db.createArbeitsbeginnCheck({
        projectId: input.projectId,
        constructionSiteId: input.constructionSiteId,
        userId: ctx.user.id,
        checkItems: input.checkItems,
        notes: input.notes,
      });
      
      // Gate als erledigt markieren
      await db.completeTeamleiterCheck(input.constructionSiteId, ctx.user.id);
      
      return { success: true, message: "Teamleitercheck abgeschlossen" };
    }),

  // Bestehende Checkliste abrufen
  getTeamleiterCheck: protectedProcedure
    .input(z.object({ constructionSiteId: z.number() }))
    .query(async ({ input }) => {
      return db.getArbeitsbeginnCheck(input.constructionSiteId);
    }),

  // Gate-Status für eine Baustelle abrufen (Übersicht aller 3 Gates)
  getGateStatus: protectedProcedure
    .input(z.object({ constructionSiteId: z.number() }))
    .query(async ({ input }) => {
      const site = await db.getConstructionSiteById(input.constructionSiteId);
      if (!site) throw new Error("Baustelle nicht gefunden");
      
      const vorherPhotos = await db.getGatePhotoCount(input.constructionSiteId, "vorher");
      const nachherPhotos = await db.getGatePhotoCount(input.constructionSiteId, "nachher");
      const teamleiterCheck = await db.getArbeitsbeginnCheck(input.constructionSiteId);
      
      return {
        vorherDoku: {
          status: site.preDocumentationStatus,
          completedAt: site.preDocumentationCompletedAt,
          photoCount: vorherPhotos,
        },
        teamleiterCheck: {
          status: (site as any).teamleiterCheckStatus || "pending",
          completedAt: (site as any).teamleiterCheckCompletedAt,
          checkData: teamleiterCheck,
        },
        nachherDoku: {
          status: site.postDocumentationStatus,
          completedAt: site.postDocumentationCompletedAt,
          photoCount: nachherPhotos,
        },
      };
    }),
});

// ============================================
// TOOLTIP FEEDBACK ROUTER
// ============================================
const tooltipFeedbackRouter = router({
  submit: protectedProcedure
    .input(
      z.object({
        helpTextKey: z.string().min(1).max(100),
        rating: z.enum(["helpful", "not_helpful"]),
        comment: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return db.upsertTooltipFeedback({
        helpTextKey: input.helpTextKey,
        userId: ctx.user.id,
        rating: input.rating,
        comment: input.comment,
      });
    }),

  getMyFeedback: protectedProcedure.query(async ({ ctx }) => {
    return db.getMyTooltipFeedback(ctx.user.id);
  }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    // Admin-only: Nur Admins und GF sehen die Statistiken
    if (ctx.user.role !== "admin") {
      return [];
    }
    return db.getTooltipFeedbackStats();
  }),
});

// ============================================
// HR & PERSONAL ROUTER
// Absicht: Leitungsebene soll jederzeit zentral
// auf alle Personalinformationen zugreifen können
// ============================================
const hrRouter = router({
  employees: router({
    list: protectedProcedure
      .input(z.object({
        status: z.enum(["active", "inactive", "onboarding", "leave"]).optional(),
        search: z.string().optional(),
        department: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        if (input?.search) return db.searchEmployees(input.search);
        if (input?.status) return db.getEmployeesByStatus(input.status);
        const all = await db.getAllEmployees();
        if (input?.department) return all.filter(e => e.department === input.department);
        return all;
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const emp = await db.getEmployeeById(input.id);
        if (!emp) throw new TRPCError({ code: "NOT_FOUND", message: "Mitarbeiter nicht gefunden" });
        return emp;
      }),
    create: protectedProcedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email().optional(),
        gender: z.string().optional(),
        status: z.enum(["active", "inactive", "onboarding", "leave"]).optional(),
        position: z.string().optional(),
        department: z.string().optional(),
        office: z.string().optional(),
        supervisor: z.string().optional(),
        employmentType: z.string().optional(),
        weeklyWorkingHours: z.string().optional(),
        hireDate: z.string().optional(),
        subcompany: z.string().optional(),
        fixSalary: z.string().optional(),
        fixSalaryInterval: z.string().optional(),
        hourlySalary: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Nur Admins dürfen Mitarbeiter anlegen" });
        const id = await db.createEmployee(input);
        return { id, ...input };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          email: z.string().optional(),
          status: z.enum(["active", "inactive", "onboarding", "leave"]).optional(),
          position: z.string().optional(),
          department: z.string().optional(),
          office: z.string().optional(),
          supervisor: z.string().optional(),
          fixSalary: z.string().optional(),
          fixSalaryInterval: z.string().optional(),
          hourlySalary: z.string().optional(),
          workSchedule: z.string().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Nur Admins dürfen Mitarbeiter bearbeiten" });
        await db.updateEmployee(input.id, input.data);
        return db.getEmployeeById(input.id);
      }),
    stats: protectedProcedure.query(async () => db.getEmployeeStats()),
  }),
  documents: router({
    list: protectedProcedure
      .input(z.object({
        employeeId: z.number().optional(),
        search: z.string().optional(),
        category: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        if (input?.employeeId) return db.getDocumentsByEmployeeId(input.employeeId);
        if (input?.search) return db.searchEmployeeDocuments(input.search);
        const all = await db.getAllEmployeeDocuments();
        if (input?.category) return all.filter(d => d.category === input.category);
        return all;
      }),
    create: protectedProcedure
      .input(z.object({
        employeeId: z.number(),
        filename: z.string(),
        category: z.string(),
        fileUrl: z.string(),
        fileKey: z.string().optional(),
        mimeType: z.string().optional(),
        sizeBytes: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Nur Admins dürfen Dokumente hochladen" });
        const id = await db.createEmployeeDocument(input);
        return { id, ...input };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Nur Admins dürfen Dokumente löschen" });
        return db.deleteEmployeeDocument(input.id);
      }),
    stats: protectedProcedure.query(async () => db.getDocumentStats()),
  }),
});

// ============================================
// GLOBAL SEARCH ROUTER (KA-10)
// ============================================
const searchRouter = router({
  global: protectedProcedure
    .input(z.object({ query: z.string().min(2) }))
    .query(async ({ input }) => {
      return db.globalSearch(input.query);
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  
  // Feature routers
  company: companyRouter,
  contact: contactRouter,
  project: projectRouter,
  property: propertyRouter,
  constructionSite: constructionSiteRouter,
  offer: offerRouter,
  task: taskRouter,
  activityLog: activityLogRouter,
  notification: notificationRouter,
  dashboard: dashboardRouter,
  calendar: calendarRouter,
  teamleiterCheck: teamleiterCheckRouter,
  user: userRouter,
  weather: weatherRouter,
  
  // Archiv & Vorlagen routers
  document: documentRouter,
  textBlock: textBlockRouter,
  offerTemplate: offerTemplateRouter,
  emailTemplate: emailTemplateRouter,
  
  // Integration routers
  hubspot: hubspotRouter,
  email: emailRouter,
  
  // New v4.7 routers (13 Mockup-Seiten)
  order: orderRouter,
  warranty: warrantyRouter,
  appointment: appointmentRouter,
  invoice: invoiceRouter,
  payment: paymentRouter,
  budget: budgetRouter,
  customerReport: customerReportRouter,
  teamMember: teamMemberRouter,
  projectFilter: projectFilterRouter,
  constructionSiteFilter: constructionSiteFilterRouter,
  
  // Phase 0e: Nachfass-System
  followUp: followUpRouter,
  
  // Phase 0.5a: Mahnlauf
  dunning: dunningRouter,
  
  // Phase 3: Foto-Verwaltung
  photo: photoRouter,
  
  // Phase 4: Reporting & Management
  report: reportRouter,
  deployment: deploymentRouter,
  resource: resourceRouter,
  finance: financeRouter,

  // Phase 5: Kundenportal
  portal: portalRouter,

  // Tooltip-Feedback
  tooltipFeedback: tooltipFeedbackRouter,

  // Qualitäts-Gates
  gate: gateRouter,

  // Bibliothek (Zentrale Stammdaten)
  library: libraryRouter,

  // HR & Personal (Personio-Daten)
  hr: hrRouter,

  // Globale Suche (KA-10)
  search: searchRouter,
});


export type AppRouter = typeof appRouter;
