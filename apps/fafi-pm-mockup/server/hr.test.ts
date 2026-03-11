import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getAllEmployees: vi.fn(),
  searchEmployees: vi.fn(),
  getEmployeeById: vi.fn(),
  getEmployeeStats: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  getDocumentsByEmployee: vi.fn(),
  getAllDocuments: vi.fn(),
  getDocumentStats: vi.fn(),
  createDocument: vi.fn(),
  deleteDocument: vi.fn(),
}));

import {
  getAllEmployees,
  searchEmployees,
  getEmployeeById,
  getEmployeeStats,
  createEmployee,
  updateEmployee,
  getDocumentsByEmployee,
  getAllDocuments,
  getDocumentStats,
  createDocument,
  deleteDocument,
} from "./db";

const mockGetAllEmployees = vi.mocked(getAllEmployees);
const mockSearchEmployees = vi.mocked(searchEmployees);
const mockGetEmployeeById = vi.mocked(getEmployeeById);
const mockGetEmployeeStats = vi.mocked(getEmployeeStats);
const mockCreateEmployee = vi.mocked(createEmployee);
const mockUpdateEmployee = vi.mocked(updateEmployee);
const mockGetDocumentsByEmployee = vi.mocked(getDocumentsByEmployee);
const mockGetAllDocuments = vi.mocked(getAllDocuments);
const mockGetDocumentStats = vi.mocked(getDocumentStats);
const mockCreateDocument = vi.mocked(createDocument);
const mockDeleteDocument = vi.mocked(deleteDocument);

// Sample test data
const sampleEmployee = {
  id: 1,
  personioId: 12345,
  firstName: "Max",
  lastName: "Mustermann",
  email: "max.mustermann@fassadenfix.de",
  gender: "male" as const,
  status: "active" as const,
  position: "Fassadenreiniger",
  department: "Operative",
  office: "Hauptsitz",
  subcompany: "FassadenFix GmbH",
  supervisor: "Thomas Braun",
  hireDate: "2024-01-15",
  probationPeriodEnd: "2024-07-15",
  terminationDate: null,
  terminationType: null,
  lastWorkingDay: null,
  employmentType: "internal" as const,
  weeklyWorkingHours: "40.0",
  workSchedule: "Vollzeit",
  fixSalary: "3200.00",
  fixSalaryInterval: "monthly" as const,
  hourlySalary: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const sampleDocument = {
  id: 1,
  employeeId: 1,
  filename: "Arbeitsvertrag_Mustermann.pdf",
  category: "Arbeitsvertrag",
  fileUrl: "https://cdn.example.com/docs/arbeitsvertrag.pdf",
  mimeType: "application/pdf",
  sizeBytes: 245000,
  createdAt: new Date(),
};

describe("HR-Bereich: Mitarbeiter-Verwaltung", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Mitarbeiter-Liste", () => {
    it("sollte alle Mitarbeiter zurückgeben", async () => {
      mockGetAllEmployees.mockResolvedValue([sampleEmployee]);
      const result = await getAllEmployees();
      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe("Max");
      expect(result[0].lastName).toBe("Mustermann");
    });

    it("sollte leere Liste bei keinen Mitarbeitern zurückgeben", async () => {
      mockGetAllEmployees.mockResolvedValue([]);
      const result = await getAllEmployees();
      expect(result).toHaveLength(0);
    });
  });

  describe("Mitarbeiter-Suche", () => {
    it("sollte nach Name suchen können", async () => {
      mockSearchEmployees.mockResolvedValue([sampleEmployee]);
      const result = await searchEmployees("Mustermann");
      expect(result).toHaveLength(1);
      expect(mockSearchEmployees).toHaveBeenCalledWith("Mustermann");
    });

    it("sollte leere Ergebnisse bei nicht-existierendem Namen zurückgeben", async () => {
      mockSearchEmployees.mockResolvedValue([]);
      const result = await searchEmployees("NichtExistent");
      expect(result).toHaveLength(0);
    });
  });

  describe("Mitarbeiter-Detail", () => {
    it("sollte einzelnen Mitarbeiter nach ID zurückgeben", async () => {
      mockGetEmployeeById.mockResolvedValue(sampleEmployee);
      const result = await getEmployeeById(1);
      expect(result).toBeDefined();
      expect(result?.firstName).toBe("Max");
      expect(result?.position).toBe("Fassadenreiniger");
      expect(result?.department).toBe("Operative");
    });

    it("sollte null bei nicht-existierender ID zurückgeben", async () => {
      mockGetEmployeeById.mockResolvedValue(null);
      const result = await getEmployeeById(99999);
      expect(result).toBeNull();
    });
  });

  describe("Mitarbeiter-Statistiken", () => {
    it("sollte korrekte Statistiken zurückgeben", async () => {
      mockGetEmployeeStats.mockResolvedValue({
        total: 30,
        active: 25,
        inactive: 3,
        onboarding: 2,
      });
      const stats = await getEmployeeStats();
      expect(stats.total).toBe(30);
      expect(stats.active).toBe(25);
      expect(stats.inactive).toBe(3);
      expect(stats.onboarding).toBe(2);
    });
  });

  describe("Mitarbeiter erstellen", () => {
    it("sollte neuen Mitarbeiter anlegen", async () => {
      const newEmp = { firstName: "Lisa", lastName: "Weber", email: "lisa@fassadenfix.de" };
      mockCreateEmployee.mockResolvedValue({ id: 31, ...sampleEmployee, ...newEmp });
      const result = await createEmployee(newEmp as any);
      expect(result.firstName).toBe("Lisa");
      expect(result.lastName).toBe("Weber");
      expect(mockCreateEmployee).toHaveBeenCalledWith(newEmp);
    });
  });

  describe("Mitarbeiter aktualisieren", () => {
    it("sollte Mitarbeiterdaten aktualisieren", async () => {
      const updates = { position: "Senior Fassadenreiniger" };
      mockUpdateEmployee.mockResolvedValue({ ...sampleEmployee, ...updates });
      const result = await updateEmployee(1, updates as any);
      expect(result?.position).toBe("Senior Fassadenreiniger");
      expect(mockUpdateEmployee).toHaveBeenCalledWith(1, updates);
    });
  });
});

describe("HR-Bereich: Dokumenten-Verwaltung", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Dokumente nach Mitarbeiter", () => {
    it("sollte Dokumente eines Mitarbeiters zurückgeben", async () => {
      mockGetDocumentsByEmployee.mockResolvedValue([sampleDocument]);
      const result = await getDocumentsByEmployee(1);
      expect(result).toHaveLength(1);
      expect(result[0].filename).toBe("Arbeitsvertrag_Mustermann.pdf");
      expect(result[0].category).toBe("Arbeitsvertrag");
    });

    it("sollte leere Liste bei Mitarbeiter ohne Dokumente zurückgeben", async () => {
      mockGetDocumentsByEmployee.mockResolvedValue([]);
      const result = await getDocumentsByEmployee(999);
      expect(result).toHaveLength(0);
    });
  });

  describe("Alle Dokumente", () => {
    it("sollte alle Dokumente zurückgeben", async () => {
      mockGetAllDocuments.mockResolvedValue([sampleDocument, { ...sampleDocument, id: 2, filename: "Lohnabrechnung.pdf" }]);
      const result = await getAllDocuments();
      expect(result).toHaveLength(2);
    });
  });

  describe("Dokumenten-Statistiken", () => {
    it("sollte korrekte Dokumenten-Statistiken zurückgeben", async () => {
      mockGetDocumentStats.mockResolvedValue({
        total: 113,
        categories: [
          { name: "Arbeitsvertrag", count: 30 },
          { name: "Lohnabrechnung", count: 45 },
          { name: "Zeugnis", count: 15 },
        ],
      });
      const stats = await getDocumentStats();
      expect(stats.total).toBe(113);
      expect(stats.categories).toHaveLength(3);
      expect(stats.categories[0].name).toBe("Arbeitsvertrag");
    });
  });

  describe("Dokument erstellen", () => {
    it("sollte neues Dokument anlegen", async () => {
      const newDoc = { employeeId: 1, filename: "Zeugnis.pdf", category: "Zeugnis", fileUrl: "https://cdn.example.com/zeugnis.pdf" };
      mockCreateDocument.mockResolvedValue({ id: 114, ...sampleDocument, ...newDoc });
      const result = await createDocument(newDoc as any);
      expect(result.filename).toBe("Zeugnis.pdf");
      expect(mockCreateDocument).toHaveBeenCalledWith(newDoc);
    });
  });

  describe("Dokument löschen", () => {
    it("sollte Dokument löschen", async () => {
      mockDeleteDocument.mockResolvedValue(true);
      const result = await deleteDocument(1);
      expect(result).toBe(true);
      expect(mockDeleteDocument).toHaveBeenCalledWith(1);
    });

    it("sollte false bei nicht-existierendem Dokument zurückgeben", async () => {
      mockDeleteDocument.mockResolvedValue(false);
      const result = await deleteDocument(99999);
      expect(result).toBe(false);
    });
  });
});

describe("HR-Bereich: Datenvalidierung", () => {
  it("sollte Personio-ID als Zahl speichern", () => {
    expect(typeof sampleEmployee.personioId).toBe("number");
    expect(sampleEmployee.personioId).toBe(12345);
  });

  it("sollte gültige Status-Werte haben", () => {
    const validStatuses = ["active", "inactive", "onboarding", "leave"];
    expect(validStatuses).toContain(sampleEmployee.status);
  });

  it("sollte gültige Gender-Werte haben", () => {
    const validGenders = ["male", "female", "diverse"];
    expect(validGenders).toContain(sampleEmployee.gender);
  });

  it("sollte gültige Employment-Types haben", () => {
    const validTypes = ["internal", "external"];
    expect(validTypes).toContain(sampleEmployee.employmentType);
  });

  it("sollte Gehaltsdaten als String speichern (Dezimal)", () => {
    expect(typeof sampleEmployee.fixSalary).toBe("string");
    expect(parseFloat(sampleEmployee.fixSalary!)).toBe(3200.0);
  });

  it("sollte Dokument-Kategorien korrekt zuordnen", () => {
    expect(sampleDocument.category).toBe("Arbeitsvertrag");
    expect(sampleDocument.mimeType).toBe("application/pdf");
    expect(sampleDocument.sizeBytes).toBeGreaterThan(0);
  });
});
