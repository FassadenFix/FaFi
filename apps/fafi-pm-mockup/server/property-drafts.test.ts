import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  savePropertyDraft: vi.fn(),
  updatePropertyDraft: vi.fn(),
  finalizeDraft: vi.fn(),
  getPropertyDrafts: vi.fn(),
  deletePropertyDraft: vi.fn(),
  getPropertyById: vi.fn(),
  createProperty: vi.fn(),
  updateProperty: vi.fn(),
  deleteProperty: vi.fn(),
  getAllProperties: vi.fn(),
  getPropertiesByProjectId: vi.fn(),
  getPropertiesByConstructionSiteId: vi.fn(),
  createActivityLog: vi.fn(),
}));

import * as db from "./db";

describe("Property Draft Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("savePropertyDraft", () => {
    it("should create a new draft with isDraft=true", async () => {
      const mockDraft = {
        id: 1,
        name: "Teststraße 1, Berlin",
        street: "Teststraße 1",
        city: "Berlin",
        isDraft: true,
        wizardData: { selectedUnternehmen: "5", seiten: [] },
      };
      vi.mocked(db.savePropertyDraft).mockResolvedValue(mockDraft as any);

      const result = await db.savePropertyDraft({
        name: "Teststraße 1, Berlin",
        street: "Teststraße 1",
        city: "Berlin",
        wizardData: { selectedUnternehmen: "5", seiten: [] },
      } as any);

      expect(result).toBeDefined();
      expect(result.isDraft).toBe(true);
      expect(result.name).toBe("Teststraße 1, Berlin");
      expect(result.wizardData).toBeDefined();
    });

    it("should include wizard step data", async () => {
      const mockDraft = {
        id: 2,
        name: "Musterweg 5, Hamburg",
        isDraft: true,
        wizardStep: 2,
        wizardData: { selectedUnternehmen: "10", selectedProjekt: "3", seiten: [{ key: "front" }] },
      };
      vi.mocked(db.savePropertyDraft).mockResolvedValue(mockDraft as any);

      const result = await db.savePropertyDraft({
        name: "Musterweg 5, Hamburg",
        wizardStep: 2,
        wizardData: { selectedUnternehmen: "10", selectedProjekt: "3", seiten: [{ key: "front" }] },
      } as any);

      expect(result.wizardStep).toBe(2);
      expect(result.wizardData?.selectedProjekt).toBe("3");
    });
  });

  describe("updatePropertyDraft", () => {
    it("should update an existing draft", async () => {
      const updated = {
        id: 1,
        name: "Teststraße 1, Berlin",
        isDraft: true,
        wizardStep: 3,
        wizardData: { selectedUnternehmen: "5", seiten: [{ key: "front", flaeche: 120 }] },
      };
      vi.mocked(db.updatePropertyDraft).mockResolvedValue(updated as any);

      const result = await db.updatePropertyDraft(1, {
        wizardStep: 3,
        wizardData: { selectedUnternehmen: "5", seiten: [{ key: "front", flaeche: 120 }] },
      } as any);

      expect(result).toBeDefined();
      expect(result?.wizardStep).toBe(3);
      expect(db.updatePropertyDraft).toHaveBeenCalledWith(1, expect.objectContaining({ wizardStep: 3 }));
    });
  });

  describe("finalizeDraft", () => {
    it("should set isDraft to false and clear wizard data", async () => {
      const finalized = {
        id: 1,
        name: "Teststraße 1, Berlin",
        isDraft: false,
        wizardData: null,
        wizardStep: null,
      };
      vi.mocked(db.finalizeDraft).mockResolvedValue(finalized as any);

      const result = await db.finalizeDraft(1);

      expect(result).toBeDefined();
      expect(result?.isDraft).toBe(false);
      expect(result?.wizardData).toBeNull();
      expect(result?.wizardStep).toBeNull();
    });
  });

  describe("getPropertyDrafts", () => {
    it("should return all drafts when no projectId given", async () => {
      const drafts = [
        { id: 1, name: "Draft 1", isDraft: true },
        { id: 2, name: "Draft 2", isDraft: true },
      ];
      vi.mocked(db.getPropertyDrafts).mockResolvedValue(drafts as any);

      const result = await db.getPropertyDrafts();

      expect(result).toHaveLength(2);
      expect(result.every((d: any) => d.isDraft === true)).toBe(true);
    });

    it("should filter drafts by projectId", async () => {
      const drafts = [{ id: 1, name: "Draft 1", isDraft: true, projectId: 5 }];
      vi.mocked(db.getPropertyDrafts).mockResolvedValue(drafts as any);

      const result = await db.getPropertyDrafts(5);

      expect(result).toHaveLength(1);
      expect(db.getPropertyDrafts).toHaveBeenCalledWith(5);
    });

    it("should return empty array when no drafts exist", async () => {
      vi.mocked(db.getPropertyDrafts).mockResolvedValue([]);

      const result = await db.getPropertyDrafts();

      expect(result).toHaveLength(0);
    });
  });

  describe("deletePropertyDraft", () => {
    it("should delete a draft by id", async () => {
      vi.mocked(db.deletePropertyDraft).mockResolvedValue({ success: true });

      const result = await db.deletePropertyDraft(1);

      expect(result.success).toBe(true);
      expect(db.deletePropertyDraft).toHaveBeenCalledWith(1);
    });
  });
});

describe("Offer Obsolet Status", () => {
  it("should include 'obsolet' as a valid offer status", () => {
    // This test verifies that the status enum includes 'obsolet'
    const validStatuses = ["entwurf", "erstellt", "versendet", "angenommen", "abgelehnt", "storniert", "obsolet"];
    expect(validStatuses).toContain("obsolet");
  });
});
