/**
 * Weather Service Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getWeatherForLocation, checkWeatherSuitability, getWeatherIcon } from "./weather";

describe("Weather Service", () => {
  describe("checkWeatherSuitability", () => {
    it("should return suitable for good weather conditions", () => {
      const weather = {
        temp: 15,
        condition: "sonnig",
        wind: 10,
        precipitation: 0,
        humidity: 60,
        updatedAt: new Date().toISOString(),
      };

      const result = checkWeatherSuitability(weather);
      
      expect(result.suitable).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });

    it("should warn about low temperature", () => {
      const weather = {
        temp: 3,
        condition: "sonnig",
        wind: 10,
        precipitation: 0,
        humidity: 60,
        updatedAt: new Date().toISOString(),
      };

      const result = checkWeatherSuitability(weather);
      
      expect(result.suitable).toBe(false);
      expect(result.warnings).toContain("Temperatur unter 5°C - Frostgefahr für Reinigungsmittel");
    });

    it("should warn about high wind", () => {
      const weather = {
        temp: 15,
        condition: "sonnig",
        wind: 55,
        precipitation: 0,
        humidity: 60,
        updatedAt: new Date().toISOString(),
      };

      const result = checkWeatherSuitability(weather);
      
      expect(result.suitable).toBe(false);
      expect(result.warnings).toContain("Windgeschwindigkeit über 50 km/h - Bühnenarbeit nicht möglich");
    });

    it("should warn about precipitation", () => {
      const weather = {
        temp: 15,
        condition: "regnerisch",
        wind: 10,
        precipitation: 2,
        humidity: 80,
        updatedAt: new Date().toISOString(),
      };

      const result = checkWeatherSuitability(weather);
      
      expect(result.suitable).toBe(false);
      expect(result.warnings.some(w => w.includes("Niederschlag"))).toBe(true);
    });

    it("should warn about high humidity", () => {
      const weather = {
        temp: 15,
        condition: "wolkig",
        wind: 10,
        precipitation: 0,
        humidity: 95,
        updatedAt: new Date().toISOString(),
      };

      const result = checkWeatherSuitability(weather);
      
      // High humidity is a warning but doesn't make it unsuitable
      expect(result.warnings).toContain("Luftfeuchtigkeit über 90% - Trocknungszeit verlängert");
    });
  });

  describe("getWeatherIcon", () => {
    it("should return sun icon for sunny weather", () => {
      expect(getWeatherIcon("sonnig")).toBe("sun");
      expect(getWeatherIcon("heiter")).toBe("sun");
    });

    it("should return cloud icon for cloudy weather", () => {
      expect(getWeatherIcon("wolkig")).toBe("cloud");
      expect(getWeatherIcon("bewölkt")).toBe("cloud");
    });

    it("should return cloud-rain icon for rainy weather", () => {
      expect(getWeatherIcon("Regen")).toBe("cloud-rain");
      expect(getWeatherIcon("leichter Nieselregen")).toBe("cloud-rain");
    });

    it("should return cloud-snow icon for snowy weather", () => {
      expect(getWeatherIcon("Schneefall")).toBe("cloud-snow");
      expect(getWeatherIcon("leichter Schneefall")).toBe("cloud-snow");
    });

    it("should return cloud-fog icon for foggy weather", () => {
      expect(getWeatherIcon("neblig")).toBe("cloud-fog");
      expect(getWeatherIcon("Nebel")).toBe("cloud-fog");
    });

    it("should return cloud-lightning icon for thunderstorms", () => {
      expect(getWeatherIcon("Gewitter")).toBe("cloud-lightning");
    });

    it("should return cloud icon for unknown conditions", () => {
      expect(getWeatherIcon("unbekannt")).toBe("cloud");
    });
  });
});
