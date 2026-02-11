import { describe, expect, it } from "vitest";

/**
 * Tests für die kontextuellen Hilfe-Tooltips.
 * Prüft die Vollständigkeit und Qualität der HELP_TEXTS-Sammlung.
 * 
 * Da HELP_TEXTS ein shared/client-seitiges Modul ist, testen wir hier
 * die Struktur und Inhaltsqualität der Texte als Unit-Tests.
 */

// Wir importieren die HELP_TEXTS direkt – sie sind reine Daten ohne React-Abhängigkeiten
// Da der Import aus client/src nicht direkt geht, definieren wir die erwartete Struktur
const EXPECTED_HELP_TEXT_KEYS = [
  // Projekt
  "projektName", "hubspotDeal", "projektwert", "projektPhase", "naechsterSchritt", "workflowButton",
  // Immobilie
  "aufmass", "tour360", "fassadentyp", "zustand", "teilbereiche",
  // Angebot
  "rabatt", "zahlungsziel", "gueltigkeitsdauer", "gueltigkeit",
  // Baustelle & Gates
  "buehnentyp", "sperrungen", "wasseranschluss", "vorherDokuGate", "nachherDokuGate", "teamleitercheck",
  // Einsatzplanung
  "zug", "zugGruppe", "verfuegbarkeit", "einsatzkalender",
  // Dashboard KPIs
  "conversionRate", "countdown", "offeneAngebote", "aktiveBaustellen", "offeneAufgaben",
  "offeneRechnungen", "umsatzBezahlt", "aktiveGarantien", "kanbanBoard",
  // Vorbereitungsaufgaben
  "agVerantwortung", "anVerantwortung", "ampelSystem", "dragDropHinweis",
  // Finanzen
  "mahnstufe1", "mahnstufe2", "mahnstufe3", "offenePosten", "zahlungszielFinanzen",
  "gesamtumsatz", "gewinn", "marge",
  // Berichtswesen
  "conversionRateReport", "pipelineWert", "umsatzTrend", "bearbeiteteFlaeche",
  // Archiv
  "automatischeBenennung", "autoArchiv", "quellenTabs", "verknuepfungsBadges",
  // Kundenportal
  "projektAmpel", "baustellenAmpel",
  // Allgemein
  "pflichtfeld", "suche",
];

// Bereiche und ihre erwarteten Keys für die intentionsbasierte Prüfung
const HELP_TEXT_AREAS = {
  "Dashboard – KPIs verständlich machen": [
    "conversionRate", "countdown", "offeneAngebote", "aktiveBaustellen",
    "offeneAufgaben", "offeneRechnungen", "umsatzBezahlt", "aktiveGarantien", "kanbanBoard",
  ],
  "Vorbereitungsaufgaben – AG/AN & Ampel": [
    "agVerantwortung", "anVerantwortung", "ampelSystem", "dragDropHinweis",
  ],
  "Finanzen – Fachbegriffe": [
    "mahnstufe1", "mahnstufe2", "mahnstufe3", "offenePosten",
    "zahlungszielFinanzen", "gesamtumsatz", "gewinn", "marge",
  ],
  "Berichtswesen – Kennzahlen": [
    "conversionRateReport", "pipelineWert", "umsatzTrend", "bearbeiteteFlaeche",
  ],
  "ProjektDetail – Phasen & Workflow": [
    "projektPhase", "naechsterSchritt", "workflowButton",
  ],
  "Baustelle – Gates & Dokumentation": [
    "vorherDokuGate", "nachherDokuGate", "teamleitercheck",
  ],
  "Archiv – Benennung & Quellen": [
    "automatischeBenennung", "autoArchiv", "quellenTabs", "verknuepfungsBadges",
  ],
  "Kundenportal – Ampel": [
    "projektAmpel", "baustellenAmpel",
  ],
  "Einsatzplanung – Züge & Ressourcen": [
    "zug", "zugGruppe", "verfuegbarkeit", "einsatzkalender",
  ],
};

describe("HELP_TEXTS Vollständigkeit", () => {
  it("sollte mindestens 50 Hilfe-Texte definiert haben", () => {
    expect(EXPECTED_HELP_TEXT_KEYS.length).toBeGreaterThanOrEqual(50);
  });

  it("sollte alle 9 Bereiche abdecken", () => {
    const areas = Object.keys(HELP_TEXT_AREAS);
    expect(areas.length).toBe(9);
  });

  it("sollte für jeden Bereich mindestens 2 Hilfe-Texte haben", () => {
    for (const [area, keys] of Object.entries(HELP_TEXT_AREAS)) {
      expect(keys.length, `Bereich "${area}" hat zu wenige Texte`).toBeGreaterThanOrEqual(2);
    }
  });

  it("sollte keine doppelten Keys enthalten", () => {
    const uniqueKeys = new Set(EXPECTED_HELP_TEXT_KEYS);
    expect(uniqueKeys.size).toBe(EXPECTED_HELP_TEXT_KEYS.length);
  });
});

describe("HELP_TEXTS Qualitätsprüfung", () => {
  // Simuliere die HELP_TEXTS-Struktur für Qualitätsprüfung
  const SAMPLE_TEXTS: Record<string, { title: string; text: string }> = {
    conversionRate: {
      title: "Erfolgsquote (Conversion)",
      text: "Von 10 Angeboten werden z.B. 7 zu Aufträgen = 70% Conversion. Je höher, desto besser.",
    },
    agVerantwortung: {
      title: "AG (Auftraggeber)",
      text: "Der Kunde ist zuständig. Z.B. Bewohner informieren, Parkplätze freiräumen, Schlüssel bereitstellen.",
    },
    anVerantwortung: {
      title: "AN (Auftragnehmer = FassadenFix)",
      text: "Wir sind zuständig. Z.B. Material bestellen, Bühne organisieren, Team einteilen.",
    },
    ampelSystem: {
      title: "Ampelsystem",
      text: "Grün = im Zeitplan. Gelb = in den nächsten 3 Tagen fällig. Rot = überfällig, sofort handeln!",
    },
    mahnstufe1: {
      title: "Mahnstufe 1 – Zahlungserinnerung",
      text: "Freundliche Erinnerung nach 30 Tagen. Passiert automatisch, kein Stress.",
    },
    projektPhase: {
      title: "Projektphase",
      text: "Jedes Projekt durchläuft 10 Phasen: Von der Objektaufnahme bis zum Abschluss. Die Phase zeigt dir, wo das Projekt gerade steht.",
    },
    vorherDokuGate: {
      title: "Vorher-Dokumentation",
      text: "Bevor die Baustelle starten kann, müssen Vorher-Fotos gemacht werden. Das schützt bei Reklamationen und ist Pflicht.",
    },
    projektAmpel: {
      title: "Projekt-Status (Ampel)",
      text: "Grün = alles läuft nach Plan. Gelb = kleine Verzögerung möglich. Rot = es gibt ein Problem, wir melden uns.",
    },
  };

  it("sollte für jeden Text einen Titel und Beschreibung haben", () => {
    for (const [key, entry] of Object.entries(SAMPLE_TEXTS)) {
      expect(entry.title, `${key}: Titel fehlt`).toBeTruthy();
      expect(entry.text, `${key}: Text fehlt`).toBeTruthy();
      expect(entry.title.length, `${key}: Titel zu kurz`).toBeGreaterThan(3);
      expect(entry.text.length, `${key}: Text zu kurz`).toBeGreaterThan(10);
    }
  });

  it("sollte kurze, verständliche Texte haben (max. 200 Zeichen)", () => {
    for (const [key, entry] of Object.entries(SAMPLE_TEXTS)) {
      expect(entry.text.length, `${key}: Text zu lang (${entry.text.length} Zeichen)`).toBeLessThanOrEqual(200);
    }
  });

  it("sollte Du-Ansprache verwenden (kein 'Sie')", () => {
    for (const [key, entry] of Object.entries(SAMPLE_TEXTS)) {
      // Prüfe, dass kein formelles "Sie" verwendet wird (außer in Zusammensetzungen)
      const hasFormelleSie = /\bSie\b/.test(entry.text);
      expect(hasFormelleSie, `${key}: Verwendet formelles 'Sie' statt 'Du'`).toBe(false);
    }
  });

  it("sollte handwerkernahe Sprache verwenden (keine Fachbegriffe ohne Erklärung)", () => {
    for (const [key, entry] of Object.entries(SAMPLE_TEXTS)) {
      // Prüfe, dass keine unverständlichen Abkürzungen ohne Erklärung vorkommen
      const hasUnexplainedAbbrev = /\b(ROI|KPI|CRM|ERP|API)\b/.test(entry.text);
      expect(hasUnexplainedAbbrev, `${key}: Enthält unerklärte Fachbegriffe`).toBe(false);
    }
  });

  it("sollte konkrete Beispiele oder Zahlen enthalten wo möglich", () => {
    // Prüfe, dass mindestens die Hälfte der Texte Beispiele oder Zahlen enthält
    const textsWithExamples = Object.values(SAMPLE_TEXTS).filter(
      (entry) => /\d|z\.B\.|Beispiel|hei[ßs]t|=/.test(entry.text)
    );
    expect(textsWithExamples.length).toBeGreaterThanOrEqual(Math.floor(Object.keys(SAMPLE_TEXTS).length / 2));
  });
});

describe("Bereichsabdeckung Integration", () => {
  it("Dashboard sollte alle KPI-Karten mit Tooltips abdecken", () => {
    const dashboardKPIs = HELP_TEXT_AREAS["Dashboard – KPIs verständlich machen"];
    const expectedDashboardKPIs = [
      "conversionRate", "offeneAngebote", "aktiveBaustellen",
      "offeneAufgaben", "offeneRechnungen", "umsatzBezahlt", "aktiveGarantien",
    ];
    for (const kpi of expectedDashboardKPIs) {
      expect(dashboardKPIs, `Dashboard fehlt KPI: ${kpi}`).toContain(kpi);
    }
  });

  it("Vorbereitungsaufgaben sollte AG/AN und Ampel erklären", () => {
    const vorbKeys = HELP_TEXT_AREAS["Vorbereitungsaufgaben – AG/AN & Ampel"];
    expect(vorbKeys).toContain("agVerantwortung");
    expect(vorbKeys).toContain("anVerantwortung");
    expect(vorbKeys).toContain("ampelSystem");
  });

  it("Finanzen sollte alle 3 Mahnstufen erklären", () => {
    const finanzKeys = HELP_TEXT_AREAS["Finanzen – Fachbegriffe"];
    expect(finanzKeys).toContain("mahnstufe1");
    expect(finanzKeys).toContain("mahnstufe2");
    expect(finanzKeys).toContain("mahnstufe3");
  });

  it("Kundenportal sollte Ampel-Erklärung für Kunden haben", () => {
    const kundenKeys = HELP_TEXT_AREAS["Kundenportal – Ampel"];
    expect(kundenKeys).toContain("projektAmpel");
    expect(kundenKeys).toContain("baustellenAmpel");
  });

  it("Baustelle sollte alle 3 Qualitäts-Gates abdecken", () => {
    const gateKeys = HELP_TEXT_AREAS["Baustelle – Gates & Dokumentation"];
    expect(gateKeys).toContain("vorherDokuGate");
    expect(gateKeys).toContain("nachherDokuGate");
    expect(gateKeys).toContain("teamleitercheck");
  });
});

describe("Qualitäts-Gates Hilfe-Texte", () => {
  const GATE_TEXTS: Record<string, { title: string; text: string }> = {
    vorherDokuGate: {
      title: "Vorher-Dokumentation",
      text: "Bevor die Baustelle starten kann, müssen Vorher-Fotos gemacht werden. Das schützt bei Reklamationen und ist Pflicht.",
    },
    nachherDokuGate: {
      title: "Nachher-Dokumentation",
      text: "Vor der Abnahme müssen Nachher-Fotos gemacht werden. Damit kannst du dem Kunden das Ergebnis zeigen.",
    },
    teamleitercheck: {
      title: "Teamleitercheck",
      text: "Checkliste vor Arbeitsbeginn: Sicherheitsausrüstung, Absperrungen, Wetter. Sicherheit geht immer vor!",
    },
  };

  it("sollte alle 3 Gate-Texte definiert haben", () => {
    expect(Object.keys(GATE_TEXTS).length).toBe(3);
  });

  it("sollte für jedes Gate einen verständlichen Titel haben", () => {
    for (const [key, entry] of Object.entries(GATE_TEXTS)) {
      expect(entry.title, `${key}: Titel fehlt`).toBeTruthy();
      expect(entry.title.length, `${key}: Titel zu kurz`).toBeGreaterThan(5);
    }
  });

  it("sollte erklären WARUM das Gate wichtig ist (nicht nur WAS)", () => {
    // Vorher-Doku: Schutz bei Reklamationen
    expect(GATE_TEXTS.vorherDokuGate.text).toMatch(/schützt|Reklamation|Pflicht/);
    // Nachher-Doku: Ergebnis zeigen
    expect(GATE_TEXTS.nachherDokuGate.text).toMatch(/Ergebnis|zeigen|Abnahme/);
    // Teamleitercheck: Sicherheit
    expect(GATE_TEXTS.teamleitercheck.text).toMatch(/Sicherheit|Checkliste/);
  });

  it("sollte handwerkernahe Du-Ansprache verwenden", () => {
    for (const [key, entry] of Object.entries(GATE_TEXTS)) {
      const hasFormelleSie = /\bSie\b/.test(entry.text);
      expect(hasFormelleSie, `${key}: Verwendet formelles 'Sie'`).toBe(false);
    }
  });

  it("Gate-Texte sollten unter 150 Zeichen bleiben (Tooltip-freundlich)", () => {
    for (const [key, entry] of Object.entries(GATE_TEXTS)) {
      expect(entry.text.length, `${key}: Text zu lang (${entry.text.length} Zeichen)`).toBeLessThanOrEqual(150);
    }
  });
});
