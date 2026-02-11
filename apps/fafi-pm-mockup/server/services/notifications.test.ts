/**
 * Notification Service Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the db module
vi.mock("../db", () => ({
  createNotification: vi.fn().mockResolvedValue({ id: 1 }),
  getOverdueTasks: vi.fn().mockResolvedValue([]),
  getAllTasks: vi.fn().mockResolvedValue([]),
}));

// Mock the notification module
vi.mock("../_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

import {
  notifyTaskAssigned,
  notifyTaskDueSoon,
  notifyTaskOverdue,
  notifyProjectStatusChanged,
  notifyOfferStatusChanged,
  notifyWeatherWarning,
  notifyOwnerAboutEvent,
} from "./notifications";
import * as db from "../db";
import { notifyOwner } from "../_core/notification";

describe("Notification Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("notifyTaskAssigned", () => {
    it("should create a notification for task assignment", async () => {
      await notifyTaskAssigned(1, "Test Task", 123, "Max Mustermann");

      expect(db.createNotification).toHaveBeenCalledWith({
        userId: 1,
        type: "task_assigned",
        title: "Neue Aufgabe zugewiesen",
        message: 'Max Mustermann hat dir die Aufgabe "Test Task" zugewiesen.',
        entityType: "task",
        entityId: 123,
      });
    });
  });

  describe("notifyTaskDueSoon", () => {
    it("should create a notification for task due tomorrow", async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await notifyTaskDueSoon(1, "Urgent Task", 456, tomorrow);

      expect(db.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          type: "task_due",
          title: "Aufgabe fällig",
          entityType: "task",
          entityId: 456,
        })
      );
    });

    it("should include days until due in message", async () => {
      const inThreeDays = new Date();
      inThreeDays.setDate(inThreeDays.getDate() + 3);

      await notifyTaskDueSoon(1, "Future Task", 789, inThreeDays);

      expect(db.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("in 3 Tagen"),
        })
      );
    });
  });

  describe("notifyTaskOverdue", () => {
    it("should create an urgent notification for overdue task", async () => {
      await notifyTaskOverdue(1, "Overdue Task", 111);

      expect(db.createNotification).toHaveBeenCalledWith({
        userId: 1,
        type: "task_due",
        title: "Aufgabe überfällig",
        message: 'Die Aufgabe "Overdue Task" ist überfällig!',
        entityType: "task",
        entityId: 111,
      });
    });
  });

  describe("notifyProjectStatusChanged", () => {
    it("should notify all specified users about project status change", async () => {
      await notifyProjectStatusChanged(
        1,
        "Test Project",
        "planung",
        "durchfuehrung",
        "Anna Schmidt",
        [1, 2, 3]
      );

      expect(db.createNotification).toHaveBeenCalledTimes(3);
    });

    it("should include phase labels in message", async () => {
      await notifyProjectStatusChanged(
        1,
        "Test Project",
        "planung",
        "durchfuehrung",
        "Anna Schmidt",
        [1]
      );

      expect(db.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Planung"),
        })
      );
    });
  });

  describe("notifyOfferStatusChanged", () => {
    it("should notify users about offer status change", async () => {
      await notifyOfferStatusChanged(
        1,
        "FF-2026-001",
        "erstellt",
        "versendet",
        "Max Mustermann",
        [1, 2]
      );

      expect(db.createNotification).toHaveBeenCalledTimes(2);
      expect(db.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "offer_status",
          title: "Angebotsstatus geändert",
        })
      );
    });
  });

  describe("notifyWeatherWarning", () => {
    it("should notify users about weather warnings", async () => {
      await notifyWeatherWarning(
        1,
        "Baustelle Sonnenhof",
        ["Starker Wind", "Niederschlag erwartet"],
        [1, 2]
      );

      expect(db.createNotification).toHaveBeenCalledTimes(2);
      expect(db.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "system",
          title: "Wetterwarnung",
          message: "Baustelle Sonnenhof: Starker Wind, Niederschlag erwartet",
        })
      );
    });
  });

  describe("notifyOwnerAboutEvent", () => {
    it("should call the built-in notifyOwner function", async () => {
      await notifyOwnerAboutEvent("Test Title", "Test Content");

      expect(notifyOwner).toHaveBeenCalledWith({
        title: "Test Title",
        content: "Test Content",
      });
    });
  });
});
