# FaFi PM – Umfassender Implementierungsplan

*Erstellt am 08. Februar 2026*
*Basierend auf vollständiger Code-Review, Systemanalyse und 6 Interview-Erkenntnissen*

---

## 1. Executive Summary

### Gesamtbewertung

Das FaFi PM System verfügt über eine **solide technische Basis** mit 28 Datenbanktabellen, 29 tRPC-Routern, 35+ Seiten und 215 bestandenen Unit-Tests. Die Kernprozesse – Projektanlage, Angebotserstellung, Auftragsannahme und Abnahme – existieren und sind mit der Datenbank verbunden. Allerdings offenbart die Analyse **5 kritische Workflow-Brüche**, die den produktiven Einsatz verhindern: Nach der Angebotserstellung bricht die automatische Prozessführung ab, Nutzer erhalten keine Orientierung über den nächsten Schritt, und 11 von 36 Seiten sind reine Mock-Attrappen ohne echte Funktionalität.

> **Kernproblem:** Das System sagt nicht "Was ist der nächste Schritt?" – es erwartet, dass der Nutzer den Prozess auswendig kennt. Für eine Software, die "wie selbstverständlich" funktionieren soll, ist das der gravierendste Mangel.

### Die 3 strategischen Prioritäten

| Priorität | Beschreibung | Begründung |
|---|---|---|
| **P1: Workflow reparieren** | Automatische Phasenübergänge, Nächster-Schritt-Navigation, Phasen-Validierung | Ohne durchgängigen Workflow ist das System nicht produktionsreif |
| **P2: Proaktives System** | Nachfass-Erinnerungen, Mahnlauf, Aufgaben-Alerts, HubSpot Auto-Sync | Ohne Automatisierung gehen Aufträge und Zahlungen verloren |
| **P3: Baustellendokumentation** | Foto-Upload, Vorher/Nachher-Doku, Tagesberichte, Mobile App | Rechtssicherheit und professioneller Auftritt bei Kunden |

### Geschätzter Gesamtaufwand und Timeline

| Phase | Zeitraum | Aufwand | Ergebnis |
|---|---|---|---|
| Phase 1: Workflow-Reparatur | Woche 1–2 | 8–10 Tage | Durchgängiger Prozess ohne Brüche |
| Phase 2: Automatisierung | Woche 3–4 | 6–8 Tage | Proaktives System mit Erinnerungen |
| Phase 3: Mobile Baustelle | Woche 5–8 | 8–10 Tage | Vollständige Baustellendokumentation |
| Phase 4: Management & Reporting | Woche 9–12 | 8–10 Tage | Echte KPIs und Geschäftssteuerung |
| Phase 5: Kundenportal & Integrationen | Woche 13–16 | 6–8 Tage | Professionelles Kundenportal |
| Phase 6: Optimierung | Woche 17–20 | 6–8 Tage | Mock-Seiten ersetzt, Performance |
| **Gesamt** | **~20 Wochen** | **~42–54 Tage** | **Produktionsreifes System** |

---

## 2. Phase 1: Workflow-Reparatur (KRITISCH – Sofort)

**Ziel:** Nutzer können den Prozess Ende-zu-Ende ohne Brüche durchlaufen. Jeder Schritt führt automatisch zum nächsten.

**Geschätzter Aufwand:** 8–10 Tage

### 2.1 Automatische Phasenübergänge

**Problem:** Nach der Angebotserstellung und dem Angebotsversand werden die Projektphasen nicht automatisch aktualisiert. Das Dashboard zeigt falsche Projektstatus an.

**Betroffene Dateien und Änderungen:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/routers/offer.ts` | `saveFromWizard`: Nach erfolgreichem Speichern `project.update({ phase: 'angebot_erstellt' })` aufrufen | 1h |
| `server/routers/email.ts` | `sendOfferEmail`: Nach erfolgreichem Versand `project.update({ phase: 'angebot_versendet' })` und `offer.updateStatus({ status: 'versendet' })` aufrufen | 1h |
| `server/routers/project.ts` | Neue Prozedur `advancePhase`: Validiert Voraussetzungen und setzt nächste Phase | 2h |
| `server/db.ts` | `updateProjectPhase(projectId, newPhase)` Hilfsfunktion mit Aktivitätslog-Eintrag | 1h |

**Phasen-Automatisierung im Detail:**

```
Aktion im System                    → Automatische Phase
─────────────────────────────────────────────────────────
ProjektWizard abgeschlossen         → "objektaufnahme"        ✅ existiert
ObjektaufnahmeWizard abgeschlossen  → bleibt "objektaufnahme" ✅ korrekt
AngebotWizard gespeichert           → "angebot_erstellt"      ❌ FEHLT → implementieren
E-Mail mit Angebot versendet        → "angebot_versendet"     ❌ FEHLT → implementieren
Auftrag angenommen                  → "auftrag_gewonnen"      ✅ existiert
Baustelle gestartet                 → "durchfuehrung"         ❌ FEHLT → implementieren
Abnahme abgeschlossen               → "abgeschlossen"         ✅ existiert
```

**Neue tRPC-Prozedur `project.advancePhase`:**

```typescript
// server/routers/project.ts
advancePhase: protectedProcedure
  .input(z.object({ projectId: z.number(), targetPhase: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // 1. Aktuelle Phase laden
    // 2. Validieren ob Übergang erlaubt (siehe 2.4 Phasen-Validierung)
    // 3. Phase setzen
    // 4. Aktivitätslog schreiben
    // 5. HubSpot-Deal aktualisieren (wenn verknüpft)
  })
```

**Aufwand:** 5h | **Abhängigkeiten:** Keine

---

### 2.2 "Nächster Schritt"-Navigation

**Problem:** Das Dashboard zeigt Projekte, aber nicht was als nächstes zu tun ist. Nutzer müssen den Prozess auswendig kennen.

**Betroffene Dateien und Änderungen:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/routers/project.ts` | Neue Prozedur `getNextSteps`: Berechnet pro Projekt den nächsten logischen Schritt | 3h |
| `server/db.ts` | `getProjectNextStep(project)` Hilfsfunktion mit Phasen-Logik | 2h |
| `client/src/pages/Dashboard.tsx` | Neues Widget "Nächste Schritte" mit Projekt-Karten und Aktions-Buttons | 4h |
| `client/src/components/NextStepCard.tsx` | Neue Komponente: Zeigt Projekt + nächsten Schritt + direkten Aktions-Button | 2h |

**Nächster-Schritt-Logik nach Phase:**

| Aktuelle Phase | Nächster Schritt | Button-Text | Navigation |
|---|---|---|---|
| `objektaufnahme` | Angebot erstellen | "📋 Angebot erstellen" | `/angebote/neu?projektId=X` |
| `angebot_erstellt` | Angebot versenden | "📧 Angebot versenden" | `/angebote?projektId=X` |
| `angebot_versendet` | Nachfassen (nach X Tagen) | "📞 Nachfassen (seit 5 Tagen)" | `/projekte/X` |
| `nachfassen` | Auf Rückmeldung warten | "⏳ Warte auf Rückmeldung" | `/projekte/X` |
| `auftrag_gewonnen` | Baustelle planen | "🏗️ Baustelle vorbereiten" | `/baustellen?projektId=X` |
| `planung` | Vorher-Dokumentation | "📸 Vorher-Doku starten" | `/baustellen/X/vorher-doku` |
| `vorbereitung` | Baustelle starten | "▶️ Baustelle starten" | `/baustellen/X` |
| `durchfuehrung` | Tagesbericht / Abnahme | "📝 Tagesbericht" | `/baustellen/X/tagesbericht` |
| `abnahme` | Abnahme durchführen | "✅ Abnahme starten" | `/auftraege/X/abnahme` |

**Dashboard-Widget Konzept:**

Das Widget zeigt maximal 5 Projekte, sortiert nach Dringlichkeit (überfällige zuerst, dann nach Phase). Jede Karte enthält: Projektname, aktuelle Phase als Badge, Countdown (z.B. "Angebot seit 12 Tagen versendet"), und einen prominenten Aktions-Button der direkt zur nächsten Aktion navigiert.

**Aufwand:** 11h | **Abhängigkeiten:** 2.1 (Phasenübergänge müssen korrekt sein)

---

### 2.3 Workflow-Buttons in Detail-Ansichten

**Problem:** In den Detail-Ansichten fehlen kontextuelle Aktions-Buttons. Der Nutzer muss selbst wissen, wohin er navigieren muss.

**Betroffene Dateien und Änderungen:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `client/src/pages/ProjektDetail.tsx` | Kontextuelle Aktions-Buttons basierend auf `project.phase` | 3h |
| `client/src/pages/Angebote.tsx` | "Als versendet markieren" Button pro Angebot (Status "erstellt") | 1h |
| `client/src/pages/Angebote.tsx` | "Auftrag annehmen" Button pro Angebot (Status "versendet") | 1h |
| `client/src/pages/BaustellenDetail.tsx` | "Abnahme starten" Button (wenn Baustelle Status "aktiv") | 1h |
| `client/src/components/WorkflowActionBar.tsx` | Neue wiederverwendbare Komponente für phasenabhängige Aktionen | 2h |

**ProjektDetail Workflow-Buttons nach Phase:**

```tsx
// client/src/pages/ProjektDetail.tsx - Neuer Abschnitt
function WorkflowActions({ project }) {
  switch (project.phase) {
    case 'objektaufnahme':
      return <Button onClick={() => navigate(`/objektaufnahme/neu?projektId=${project.id}`)}>
        Objektaufnahme durchführen
      </Button>;
    case 'angebot_erstellt':
      return <Button onClick={() => navigate(`/angebote?projektId=${project.id}`)}>
        Angebot versenden
      </Button>;
    // ... weitere Phasen
  }
}
```

**Aufwand:** 8h | **Abhängigkeiten:** Keine

---

### 2.4 Phasen-Validierung

**Problem:** `project.update` erlaubt beliebige Phasensprünge ohne Prüfung. Wichtige Schritte können übersprungen werden.

**Betroffene Dateien und Änderungen:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/routers/project.ts` | `update` Prozedur: Phasen-Validierung vor Statusänderung einbauen | 2h |
| `server/db.ts` | `validatePhaseTransition(currentPhase, targetPhase, projectId)` Funktion | 3h |
| `shared/const.ts` | `PHASE_TRANSITIONS` Map: Erlaubte Übergänge + Voraussetzungen definieren | 1h |

**Erlaubte Phasenübergänge und Voraussetzungen:**

| Von | Nach | Voraussetzung |
|---|---|---|
| `objektaufnahme` | `angebot_erstellt` | Mindestens 1 Angebot existiert |
| `angebot_erstellt` | `angebot_versendet` | Angebot hat Status "versendet" |
| `angebot_versendet` | `nachfassen` | Automatisch nach 7 Tagen ODER manuell |
| `angebot_versendet` | `auftrag_gewonnen` | Auftrag existiert |
| `nachfassen` | `auftrag_gewonnen` | Auftrag existiert |
| `auftrag_gewonnen` | `planung` | Baustelle existiert |
| `planung` | `vorbereitung` | Einsatzplan erstellt |
| `vorbereitung` | `durchfuehrung` | Vorher-Dokumentation abgeschlossen |
| `durchfuehrung` | `abnahme` | Nachher-Dokumentation abgeschlossen |
| `abnahme` | `abgeschlossen` | Abnahmeprotokoll erstellt |
| *jede Phase* | `verloren` | Immer erlaubt (mit Begründung) |

**Implementierung in `shared/const.ts`:**

```typescript
export const PHASE_TRANSITIONS: Record<string, {
  allowedTargets: string[];
  prerequisites: Record<string, (projectId: number) => Promise<boolean>>;
}> = {
  objektaufnahme: {
    allowedTargets: ['angebot_erstellt', 'verloren'],
    prerequisites: {
      angebot_erstellt: async (pid) => (await getOffersByProjectId(pid)).length > 0,
    }
  },
  // ... weitere Phasen
};
```

**Aufwand:** 6h | **Abhängigkeiten:** Keine

---

### 2.5 Nachfass-System für versendete Angebote

**Problem:** Angebote werden vergessen, weil niemand daran erinnert wird nachzufassen. Kein automatisches Erinnerungssystem.

**DB-Änderungen:**

| Tabelle | Feld | Typ | Beschreibung |
|---|---|---|---|
| `offers` | `sentAt` | `timestamp` | Zeitpunkt des Versands (für Countdown) |
| `offers` | `followUpDueAt` | `timestamp` | Nächster Nachfass-Termin |
| `offers` | `followUpCount` | `integer` | Anzahl bisheriger Nachfass-Versuche |
| Neue Tabelle: `followUpReminders` | | | Erinnerungen mit Status |

**Neue Tabelle `followUpReminders`:**

```typescript
// server/db/schema.ts
export const followUpReminders = sqliteTable('follow_up_reminders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  offerId: integer('offer_id').notNull().references(() => offers.id),
  projectId: integer('project_id').notNull().references(() => projects.id),
  dueAt: integer('due_at', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['pending', 'completed', 'dismissed'] }).default('pending'),
  reminderType: text('reminder_type', { enum: ['7_days', '14_days', '30_days', 'custom'] }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  completedBy: integer('completed_by'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});
```

**Betroffene Dateien:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/db/schema.ts` | `followUpReminders` Tabelle + Felder zu `offers` | 1h |
| `server/routers/followUp.ts` | Neuer Router: `list`, `complete`, `dismiss`, `createCustom` | 3h |
| `server/routers/email.ts` | `sendOfferEmail`: Automatisch 3 Erinnerungen erstellen (7/14/30 Tage) | 1h |
| `client/src/pages/Dashboard.tsx` | "Nachfassen fällig" Widget mit Countdown und Aktions-Buttons | 3h |
| `client/src/pages/Angebote.tsx` | Nachfass-Status Badge und "Nachgefasst" Button | 1h |
| `server/routers/followUp.test.ts` | Unit-Tests für Nachfass-Logik | 2h |

**Workflow:**
1. Angebot wird versendet → 3 Erinnerungen werden automatisch erstellt (7, 14, 30 Tage)
2. Dashboard zeigt fällige Erinnerungen mit Countdown
3. Kundenberater klickt "Nachgefasst" → Erinnerung als erledigt markieren, Notiz hinzufügen
4. Nach 30 Tagen ohne Reaktion: Projekt-Phase automatisch auf "nachfassen" setzen
5. Projekt-Phase auf "verloren" setzen wenn Kunde ablehnt

**Aufwand:** 11h | **Abhängigkeiten:** 2.1 (Phasenübergänge)

---

### Phase 1 Zusammenfassung

| Aufgabe | Aufwand | Priorität |
|---|---|---|
| 2.1 Automatische Phasenübergänge | 5h | Kritisch |
| 2.2 "Nächster Schritt"-Navigation | 11h | Kritisch |
| 2.3 Workflow-Buttons in Detail-Ansichten | 8h | Kritisch |
| 2.4 Phasen-Validierung | 6h | Kritisch |
| 2.5 Nachfass-System | 11h | Kritisch |
| Unit-Tests für Phase 1 | 6h | Pflicht |
| **Gesamt Phase 1** | **47h (~6 Tage)** | |

---

## 3. Phase 2: Automatisierung & Proaktives System

**Ziel:** Das System arbeitet proaktiv – weniger vergessene Termine, bessere Liquidität, aktuelles CRM.

**Geschätzter Aufwand:** 6–8 Tage

### 3.1 Automatischer Mahnlauf für Rechnungen

**Problem:** Zahlungseingänge werden nicht systematisch verfolgt. Keine automatischen Mahnstufen.

**DB-Änderungen:**

| Tabelle | Feld | Typ | Beschreibung |
|---|---|---|---|
| `invoices` | `dueDate` | `timestamp` | Fälligkeitsdatum |
| `invoices` | `reminderLevel` | `integer` | Aktuelle Mahnstufe (0–3) |
| `invoices` | `lastReminderSentAt` | `timestamp` | Letzte Mahnung gesendet |
| Neue Tabelle: `dunningEntries` | | | Mahnhistorie |

**Neue Tabelle `dunningEntries`:**

```typescript
export const dunningEntries = sqliteTable('dunning_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  invoiceId: integer('invoice_id').notNull().references(() => invoices.id),
  level: integer('level').notNull(), // 1=Zahlungserinnerung, 2=1.Mahnung, 3=2.Mahnung
  sentAt: integer('sent_at', { mode: 'timestamp' }),
  sentVia: text('sent_via', { enum: ['email', 'post', 'manual'] }),
  amount: integer('amount'), // Mahngebühr in Cent
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});
```

**Betroffene Dateien:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/db/schema.ts` | `dunningEntries` Tabelle + Felder zu `invoices` | 1h |
| `server/routers/dunning.ts` | Neuer Router: `checkOverdue`, `createReminder`, `sendDunning`, `getHistory` | 4h |
| `server/services/dunning.ts` | Mahnlauf-Logik: 30 Tage → Zahlungserinnerung, 60 → 1. Mahnung, 90 → 2. Mahnung | 3h |
| `client/src/pages/RechnungDetail.tsx` | Mahnhistorie-Tab, "Mahnung senden" Button | 2h |
| `client/src/pages/Dashboard.tsx` | "Überfällige Rechnungen" Widget mit Summe und Anzahl | 2h |

**Mahnstufen-Logik:**

| Stufe | Tage überfällig | Aktion | Mahngebühr |
|---|---|---|---|
| 0 | 0–29 | Keine Aktion | – |
| 1 | 30 | Freundliche Zahlungserinnerung per E-Mail | 0 € |
| 2 | 60 | 1. Mahnung per E-Mail + Post | 5 € |
| 3 | 90 | 2. Mahnung per E-Mail + Post, Warnung Inkasso | 10 € |

**Aufwand:** 12h | **Abhängigkeiten:** E-Mail-Versand (v7.1b) für automatischen Versand, manuell sofort möglich

---

### 3.2 Aufgaben-Erinnerungen für überfällige Tasks

**Problem:** Überfällige Baustellen-Aufgaben werden nicht proaktiv angezeigt. Kein Eskalationsmechanismus.

**Betroffene Dateien:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/routers/task.ts` | Neue Prozedur `getOverdueTasks`: Alle überfälligen Aufgaben mit Eskalationsstufe | 2h |
| `server/routers/task.ts` | Neue Prozedur `getMyTasks`: Aufgaben des eingeloggten Benutzers nach Rolle | 2h |
| `client/src/pages/Dashboard.tsx` | "Überfällige Aufgaben" Widget mit Eskalationsfarben (gelb/rot) | 2h |
| `client/src/components/TaskAlertBanner.tsx` | Banner-Komponente für kritische überfällige Aufgaben | 1h |

**Eskalationslogik:**

| Überfällig seit | Farbe | Aktion |
|---|---|---|
| 1–3 Tage | Gelb | Anzeige im Dashboard |
| 4–7 Tage | Orange | Zusätzlich Benachrichtigung an Verantwortlichen |
| 8+ Tage | Rot | Eskalation an GF, Banner in der App |

**Aufwand:** 7h | **Abhängigkeiten:** Keine

---

### 3.3 HubSpot Auto-Sync Cron-Job

**Problem:** Synchronisation nur manuell auslösbar. CRM-Daten veralten.

**Betroffene Dateien:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/services/hubspot-sync-job.ts` | Neuer Service: Periodischer Sync alle 15 Minuten | 3h |
| `server/routers/hubspot.ts` | Neue Prozedur `getSyncStatus`: Letzter Sync, Fehler, Statistiken | 1h |
| `server/routers/hubspot.ts` | Neue Prozedur `triggerManualSync`: Manueller Sync mit Fortschrittsanzeige | 1h |
| `client/src/pages/HubSpotIntegration.tsx` | Mock durch echte Sync-Verwaltung ersetzen | 3h |

**Sync-Intervalle:**

| Datentyp | Intervall | Richtung |
|---|---|---|
| Unternehmen | Alle 15 Min | HubSpot → FaFi |
| Kontakte | Alle 15 Min | HubSpot → FaFi |
| Deals/Projekte | Bei Statusänderung | FaFi → HubSpot |
| Notizen/Aktivitäten | Bei Erstellung | FaFi → HubSpot |

**Aufwand:** 8h | **Abhängigkeiten:** Bestehende HubSpot-Integration

---

### 3.4 Kritische Benachrichtigungen

**Problem:** Bei kritischen Ereignissen (Geräteausfall, Sicherheitsvorfall, überfällige Zahlungen) keine sofortige Benachrichtigung.

**Betroffene Dateien:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/services/notification.ts` | Neuer Service: Benachrichtigungslogik mit Prioritäten | 3h |
| `server/routers/notification.ts` | Neue Prozeduren: `getUnread`, `markAsRead`, `getPreferences` | 2h |
| `client/src/pages/Benachrichtigungen.tsx` | Mock durch echte Benachrichtigungsliste ersetzen | 2h |
| `client/src/components/DashboardLayout.tsx` | Benachrichtigungs-Badge im Header (Glocke mit Zähler) | 1h |

**Aufwand:** 8h | **Abhängigkeiten:** Keine

---

### Phase 2 Zusammenfassung

| Aufgabe | Aufwand | Priorität |
|---|---|---|
| 3.1 Automatischer Mahnlauf | 12h | Wichtig |
| 3.2 Aufgaben-Erinnerungen | 7h | Wichtig |
| 3.3 HubSpot Auto-Sync | 8h | Wichtig |
| 3.4 Kritische Benachrichtigungen | 8h | Wichtig |
| Unit-Tests für Phase 2 | 6h | Pflicht |
| **Gesamt Phase 2** | **41h (~5 Tage)** | |

---

## 4. Phase 3: Mobile Baustelle & Dokumentation

**Ziel:** Vollständige Baustellendokumentation mit Foto-Upload, Tagesberichten und Vorher/Nachher-Vergleich.

Die bestehende todo.md (v7.0a–v7.0d) deckt diesen Bereich bereits detailliert ab. Folgende **Ergänzungen** sind notwendig:

### 4.1 Fehlende Punkte in v7.0

| Fehlender Punkt | Beschreibung | Aufwand |
|---|---|---|
| **Offline-Fähigkeit** | Service Worker für Foto-Upload bei schlechter Verbindung auf der Baustelle. Fotos lokal zwischenspeichern, bei Verbindung automatisch hochladen | 6h |
| **GPS-Koordinaten** | Automatische GPS-Position bei Foto-Upload für Zuordnung zum Gebäude | 1h |
| **Witterungs-API Integration** | Open-Meteo API automatisch 3x täglich abrufen (9/13/17 Uhr) statt manuelle Eingabe | 2h |
| **Baustellenstart-Checkliste** | Pflicht-Checkliste vor Arbeitsbeginn: Sicherheitsausrüstung, Absperrung, Gerätekontrolle | 3h |
| **Foto-Wasserzeichen** | Automatisches Wasserzeichen mit Datum, Uhrzeit, GPS, Baustellenname für Rechtssicherheit | 2h |
| **Bautagebuch-PDF-Export** | Tagesbericht als PDF mit allen Fotos, Wetterdaten, Fortschritt exportierbar | 3h |

### 4.2 BaustellenWizard DB-Integration

**Problem:** Der BaustellenWizard (in todo.md v7.0c erwähnt) hat aktuell nur einen Mock-Callback. Die Baustelle wird zwar bei Auftragsannahme automatisch erstellt, aber der manuelle Erstellungsweg fehlt.

**Betroffene Dateien:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `client/src/components/wizards/BaustellenWizard.tsx` | Mock-Callback durch `trpc.constructionSite.create` ersetzen | 2h |
| `server/routers/constructionSite.ts` | `create` Prozedur erweitern: Validierung, Standardaufgaben erstellen | 1h |

### 4.3 Mobile App Überarbeitung

**Problem:** Die MobileApp-Seite (`client/src/pages/MobileApp.tsx`) ist komplett Mock-basiert.

**Strategie:** Statt einer separaten Mobile App wird die bestehende Web-App für mobile Nutzung optimiert. Der Baustellen-Manager erhält eine dedizierte mobile Ansicht mit großen Touch-Targets und vereinfachter Navigation.

**Betroffene Dateien:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `client/src/pages/MobileApp.tsx` | Komplett neu als echte mobile Baustellenansicht | 8h |
| `client/src/pages/MobileApp.tsx` | Tabs: Heute, Ereignis melden, Fotos, Logbuch | inkl. |
| `client/src/components/MobileBaustellenHeader.tsx` | Kompakte Header-Komponente mit Wetter und Baustellen-Info | 2h |

**Aufwand Ergänzungen:** 30h | **Abhängigkeiten:** v7.0a (Foto-Upload Infrastruktur)

---

## 5. Phase 4: Management & Reporting

**Ziel:** Echte Geschäftssteuerung statt Mock-Seiten. Fundierte Entscheidungen durch Echtzeit-KPIs.

**Geschätzter Aufwand:** 8–10 Tage

### 5.1 Echtes Berichtswesen

**Problem:** Die Seite `Berichtswesen.tsx` ist komplett Mock-basiert. Keine echten Reports.

**Betroffene Dateien:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/routers/report.ts` | Neuer Router mit Prozeduren für verschiedene Berichtstypen | 6h |
| `client/src/pages/Berichtswesen.tsx` | Mock durch echte Berichte ersetzen | 6h |

**Berichtstypen:**

| Bericht | Datenquelle | Zielgruppe |
|---|---|---|
| Projekt-Pipeline | `projects` nach Phase gruppiert | GF |
| Umsatz-Report | `invoices` + `payments` nach Monat | GF |
| Conversion-Funnel | `projects` Phase-Übergänge | GF, Kundenberater |
| Baustellen-Fortschritt | `constructionSites` + `constructionSiteLogs` | AT-Leiter |
| Team-Auslastung | `tasks` + `constructionSites` pro Mitarbeiter | GF, AT-Leiter |
| Offene Posten | `invoices` mit Status "offen" oder "überfällig" | Büro |

**Aufwand:** 12h | **Abhängigkeiten:** Keine

---

### 5.2 Einsatzplanung mit DB-Anbindung

**Problem:** Die Seite `Einsatzplanung.tsx` ist Mock-basiert. Keine echte Terminplanung.

**DB-Änderungen:**

| Tabelle | Beschreibung |
|---|---|
| Neue Tabelle: `deployments` | Einsatzplanung: Baustelle, Team, Zeitraum, Geräte |
| Neue Tabelle: `equipmentBookings` | Gerätebuchungen: Gerät, Baustelle, Zeitraum |

**Betroffene Dateien:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/db/schema.ts` | `deployments` + `equipmentBookings` Tabellen | 1h |
| `server/routers/deployment.ts` | Neuer Router: CRUD + Kalenderansicht + Konfliktprüfung | 4h |
| `client/src/pages/Einsatzplanung.tsx` | Mock durch Kalender-basierte Einsatzplanung ersetzen | 6h |

**Aufwand:** 11h | **Abhängigkeiten:** Keine

---

### 5.3 Ressourcenübersicht

**Problem:** Die Seite `Ressourcen.tsx` ist Mock-basiert. Keine echte Teamauslastung.

**Betroffene Dateien:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/routers/resource.ts` | Neuer Router: Teamverfügbarkeit, Geräteauslastung, Kapazitätsplanung | 4h |
| `client/src/pages/Ressourcen.tsx` | Mock durch echte Ressourcenübersicht ersetzen | 4h |

**Aufwand:** 8h | **Abhängigkeiten:** 5.2 (Einsatzplanung)

---

### 5.4 Finanzdashboard

**Problem:** Die Seite `Finanzen.tsx` ist Mock-basiert. Keine echten Finanzdaten.

**Betroffene Dateien:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/routers/finance.ts` | Neuer Router: Umsatz, Außenstände, Cashflow, Budget-Vergleich | 4h |
| `client/src/pages/Finanzen.tsx` | Mock durch echtes Finanzdashboard ersetzen | 6h |

**Kennzahlen:**

| KPI | Berechnung | Visualisierung |
|---|---|---|
| Monatsumsatz | Summe bezahlter Rechnungen | Balkendiagramm |
| Offene Posten | Summe unbezahlter Rechnungen | Zahl + Trend |
| Cashflow | Einnahmen – Ausgaben pro Monat | Liniendiagramm |
| Budget-Auslastung | Ist vs. Soll pro Projekt | Fortschrittsbalken |
| Durchschnittliche Zahlungsdauer | Tage zwischen Rechnungsdatum und Zahlungseingang | Zahl |

**Aufwand:** 10h | **Abhängigkeiten:** Keine

---

### Phase 4 Zusammenfassung

| Aufgabe | Aufwand | Priorität |
|---|---|---|
| 5.1 Echtes Berichtswesen | 12h | Wichtig |
| 5.2 Einsatzplanung mit DB | 11h | Wichtig |
| 5.3 Ressourcenübersicht | 8h | Wichtig |
| 5.4 Finanzdashboard | 10h | Wichtig |
| Unit-Tests für Phase 4 | 6h | Pflicht |
| **Gesamt Phase 4** | **47h (~6 Tage)** | |

---

## 6. Phase 5: Kundenportal & Integrationen

**Ziel:** Professionelles Kundenportal mit Ampel-System und vollständiger HubSpot-Integration.

Die bestehende todo.md (v7.3) deckt das Kundenportal-Ampel-System ab. Folgende **Ergänzungen** sind notwendig:

### 6.1 Fehlende Punkte in v7.3

| Fehlender Punkt | Beschreibung | Aufwand |
|---|---|---|
| **Kundenportal-Login** | Echtes Login statt nur Token-Zugang (E-Mail + Passwort für Unternehmen) | 4h |
| **Kundenportal-Benachrichtigungen** | E-Mail an Kunde bei Statusänderungen (Baustart, Abnahme, Rechnung) | 3h |
| **Feedback-Formular** | Kunde kann Feedback/Bewertung nach Abschluss abgeben | 2h |
| **Dokumenten-Upload durch Kunde** | Kunde kann angeforderte Dokumente (Vollmachten, Genehmigungen) hochladen | 3h |
| **Chat/Nachrichten** | Einfaches Nachrichtensystem zwischen Kunde und FassadenFix | 4h |

### 6.2 HubSpot-Integration Seite ersetzen

**Problem:** `HubSpotIntegration.tsx` ist Mock-basiert.

**Betroffene Dateien:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `client/src/pages/HubSpotIntegration.tsx` | Mock durch echte Sync-Verwaltung ersetzen | 4h |

**Funktionen der echten Seite:**
- Sync-Status Dashboard (letzte Synchronisation, Fehler, Statistiken)
- Manueller Sync-Button mit Fortschrittsanzeige
- Mapping-Konfiguration (FaFi-Felder ↔ HubSpot-Felder)
- Sync-Protokoll (letzte 100 Sync-Ereignisse)
- Fehler-Log mit Retry-Möglichkeit

**Aufwand Ergänzungen:** 20h | **Abhängigkeiten:** v7.2 (HubSpot Bidi-Sync)

---

## 7. Phase 6: Mock-Seiten ersetzen & Optimierung

**Ziel:** Alle 11 Mock-basierten Seiten durch echte Funktionalität ersetzen. Code-Qualität verbessern.

### 7.1 Mock-Seiten Übersicht und Ersetzungsplan

| Mock-Seite | Ersetzt in Phase | Aufwand | Priorität |
|---|---|---|---|
| `MobileApp.tsx` | Phase 3 (v7.0) | 10h | Kritisch |
| `Berichtswesen.tsx` | Phase 4 | 12h | Wichtig |
| `Einsatzplanung.tsx` | Phase 4 | 11h | Wichtig |
| `Ressourcen.tsx` | Phase 4 | 8h | Wichtig |
| `Finanzen.tsx` | Phase 4 | 10h | Wichtig |
| `HubSpotIntegration.tsx` | Phase 5 | 4h | Wichtig |
| `Kundenportal.tsx` | Phase 5 (v7.3) | bereits geplant | Wichtig |
| `Teamleitercheck.tsx` | Phase 6 | 6h | Nice-to-have |
| `Dokumente.tsx` | Phase 6 | 4h | Nice-to-have |
| `Bibliothek.tsx` | Phase 6 | 4h | Nice-to-have |
| `Verzeichnisse.tsx` | Phase 6 | 3h | Nice-to-have |
| `PDFEntwuerfe.tsx` | Phase 6 | 4h | Nice-to-have |

### 7.2 Verbleibende Mock-Seiten (Phase 6)

**`Teamleitercheck.tsx` – Teamleiter-Kontrolle:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/routers/teamCheck.ts` | Neuer Router: Checklisten-Vorlagen, Prüfungen, Ergebnisse | 3h |
| `client/src/pages/Teamleitercheck.tsx` | Mock durch echte Checklisten-basierte Kontrolle ersetzen | 3h |

**`Dokumente.tsx` – Dokumentenverwaltung:**

Kann mit dem bestehenden Archiv (`Archiv.tsx`) zusammengeführt werden, da die Funktionalität sich überlappt.

| Datei | Änderung | Aufwand |
|---|---|---|
| `client/src/pages/Dokumente.tsx` | Weiterleitung auf Archiv oder Integration der Archiv-Funktionalität | 2h |
| `client/src/App.tsx` | Route-Anpassung | 0.5h |

**`Bibliothek.tsx` – Vorlagen-Bibliothek:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `server/routers/template.ts` | Neuer Router: Vorlagen-CRUD (E-Mail-Vorlagen, Checklisten, Textbausteine) | 2h |
| `client/src/pages/Bibliothek.tsx` | Mock durch echte Vorlagen-Verwaltung ersetzen | 2h |

**`Verzeichnisse.tsx` – Stammdaten-Verzeichnisse:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `client/src/pages/Verzeichnisse.tsx` | Mock durch echte Stammdaten ersetzen (Fassadentypen, Schadensarten, Materialien) | 3h |

**`PDFEntwuerfe.tsx` – PDF-Entwürfe:**

| Datei | Änderung | Aufwand |
|---|---|---|
| `client/src/pages/PDFEntwuerfe.tsx` | Mock durch echte PDF-Vorlagen-Verwaltung ersetzen | 4h |

### 7.3 Statische Seiten aktivieren

| Seite | Änderung | Aufwand |
|---|---|---|
| `Benachrichtigungen.tsx` | Wird in Phase 2 (3.4) durch echte Benachrichtigungen ersetzt | 0h |
| `Einstellungen.tsx` | Echte Einstellungen: Profil, Benachrichtigungspräferenzen, Theme | 4h |
| `Sprachsteuerung.tsx` | MVP: Platzhalter belassen, Hinweis "Kommt in zukünftiger Version" | 0.5h |

### 7.4 Code-Qualität (aus v7.4)

Die bestehende todo.md v7.4 deckt dies ab. Zusätzlich:

| Aufgabe | Aufwand |
|---|---|
| Entfernung aller Mock-Daten aus `shared/const.ts` nach Ersetzung | 2h |
| Konsolidierung doppelter Komponenten | 2h |
| Einheitliche Error-Boundaries für alle Seiten | 2h |

**Aufwand Phase 6:** ~35h (~4–5 Tage) | **Abhängigkeiten:** Phase 1–5

---

## 8. Neue Aufgaben für todo.md

Die folgenden Aufgaben sind **NOCH NICHT** in der bestehenden todo.md enthalten und müssen ergänzt werden:

### Phase 1 – Workflow-Reparatur (NEU)

```
- [ ] saveFromWizard: Projektphase automatisch auf "angebot_erstellt" setzen (1h) [Phase 1]
- [ ] sendOfferEmail: Projektphase auf "angebot_versendet" + Angebotsstatus auf "versendet" setzen (1h) [Phase 1]
- [ ] project.advancePhase Prozedur: Validierte Phasenübergänge mit Voraussetzungsprüfung (2h) [Phase 1]
- [ ] updateProjectPhase Hilfsfunktion mit automatischem Aktivitätslog-Eintrag (1h) [Phase 1]
- [ ] PHASE_TRANSITIONS Map in shared/const.ts: Erlaubte Übergänge + Voraussetzungen (1h) [Phase 1]
- [ ] project.update: Phasen-Validierung einbauen, keine willkürlichen Sprünge (2h) [Phase 1]
- [ ] validatePhaseTransition Funktion: Prüft Voraussetzungen pro Phasenübergang (3h) [Phase 1]
- [ ] project.getNextSteps Prozedur: Berechnet nächsten Schritt pro Projekt (3h) [Phase 1]
- [ ] getProjectNextStep Hilfsfunktion mit Phasen-Logik (2h) [Phase 1]
- [ ] Dashboard "Nächste Schritte" Widget mit Projekt-Karten und Aktions-Buttons (4h) [Phase 1]
- [ ] NextStepCard Komponente: Projekt + nächster Schritt + direkter Aktions-Button (2h) [Phase 1]
- [ ] ProjektDetail: Kontextuelle Workflow-Buttons basierend auf aktueller Phase (3h) [Phase 1]
- [ ] Angebote: "Als versendet markieren" Button pro Angebot (1h) [Phase 1]
- [ ] BaustellenDetail: "Abnahme starten" Button (1h) [Phase 1]
- [ ] WorkflowActionBar Komponente: Wiederverwendbar für phasenabhängige Aktionen (2h) [Phase 1]
- [ ] followUpReminders Tabelle erstellen (1h) [Phase 1]
- [ ] offers: sentAt, followUpDueAt, followUpCount Felder hinzufügen (30min) [Phase 1]
- [ ] followUp Router: list, complete, dismiss, createCustom Prozeduren (3h) [Phase 1]
- [ ] sendOfferEmail: Automatisch 3 Nachfass-Erinnerungen erstellen (7/14/30 Tage) (1h) [Phase 1]
- [ ] Dashboard "Nachfassen fällig" Widget mit Countdown (3h) [Phase 1]
- [ ] Angebote: Nachfass-Status Badge und "Nachgefasst" Button (1h) [Phase 1]
- [ ] Unit-Tests für Phasenübergänge, Validierung und Nachfass-System (6h) [Phase 1]
```

### Phase 2 – Automatisierung (NEU)

```
- [ ] dunningEntries Tabelle erstellen (1h) [Phase 2]
- [ ] invoices: dueDate, reminderLevel, lastReminderSentAt Felder hinzufügen (30min) [Phase 2]
- [ ] dunning Router: checkOverdue, createReminder, sendDunning, getHistory (4h) [Phase 2]
- [ ] Mahnlauf-Service: Automatische Mahnstufen 30/60/90 Tage (3h) [Phase 2]
- [ ] RechnungDetail: Mahnhistorie-Tab und "Mahnung senden" Button (2h) [Phase 2]
- [ ] Dashboard "Überfällige Rechnungen" Widget (2h) [Phase 2]
- [ ] task.getOverdueTasks Prozedur mit Eskalationsstufen (2h) [Phase 2]
- [ ] task.getMyTasks Prozedur: Aufgaben nach Rolle des eingeloggten Benutzers (2h) [Phase 2]
- [ ] Dashboard "Überfällige Aufgaben" Widget mit Eskalationsfarben (2h) [Phase 2]
- [ ] TaskAlertBanner Komponente für kritische überfällige Aufgaben (1h) [Phase 2]
- [ ] HubSpot Auto-Sync Service: Periodischer Sync alle 15 Minuten (3h) [Phase 2]
- [ ] hubspot.getSyncStatus Prozedur: Letzter Sync, Fehler, Statistiken (1h) [Phase 2]
- [ ] hubspot.triggerManualSync Prozedur mit Fortschrittsanzeige (1h) [Phase 2]
- [ ] HubSpotIntegration.tsx: Mock durch echte Sync-Verwaltung ersetzen (3h) [Phase 2]
- [ ] Benachrichtigungs-Service mit Prioritäten (normal/hoch/kritisch) (3h) [Phase 2]
- [ ] notification Router: getUnread, markAsRead, getPreferences (2h) [Phase 2]
- [ ] Benachrichtigungen.tsx: Mock durch echte Benachrichtigungsliste ersetzen (2h) [Phase 2]
- [ ] DashboardLayout: Benachrichtigungs-Badge im Header (Glocke mit Zähler) (1h) [Phase 2]
- [ ] Unit-Tests für Mahnlauf, Aufgaben-Erinnerungen, Benachrichtigungen (6h) [Phase 2]
```

### Phase 3 – Ergänzungen zu v7.0 (NEU)

```
- [ ] Offline-Fähigkeit: Service Worker für Foto-Upload bei schlechter Verbindung (6h) [Phase 3]
- [ ] GPS-Koordinaten automatisch bei Foto-Upload erfassen (1h) [Phase 3]
- [ ] Witterungs-API: Open-Meteo automatisch 3x täglich abrufen (2h) [Phase 3]
- [ ] Baustellenstart-Checkliste: Pflicht vor Arbeitsbeginn (3h) [Phase 3]
- [ ] Foto-Wasserzeichen: Datum, Uhrzeit, GPS, Baustellenname (2h) [Phase 3]
- [ ] Bautagebuch-PDF-Export mit Fotos, Wetterdaten, Fortschritt (3h) [Phase 3]
- [ ] MobileApp.tsx: Komplett neu als echte mobile Baustellenansicht (8h) [Phase 3]
- [ ] MobileBaustellenHeader Komponente mit Wetter und Baustellen-Info (2h) [Phase 3]
```

### Phase 4 – Management & Reporting (NEU)

```
- [ ] report Router: Pipeline, Umsatz, Conversion, Fortschritt, Auslastung, Offene Posten (6h) [Phase 4]
- [ ] Berichtswesen.tsx: Mock durch echte Berichte mit Diagrammen ersetzen (6h) [Phase 4]
- [ ] deployments + equipmentBookings Tabellen erstellen (1h) [Phase 4]
- [ ] deployment Router: CRUD + Kalenderansicht + Konfliktprüfung (4h) [Phase 4]
- [ ] Einsatzplanung.tsx: Mock durch Kalender-basierte Planung ersetzen (6h) [Phase 4]
- [ ] resource Router: Teamverfügbarkeit, Geräteauslastung, Kapazitätsplanung (4h) [Phase 4]
- [ ] Ressourcen.tsx: Mock durch echte Ressourcenübersicht ersetzen (4h) [Phase 4]
- [ ] finance Router: Umsatz, Außenstände, Cashflow, Budget-Vergleich (4h) [Phase 4]
- [ ] Finanzen.tsx: Mock durch echtes Finanzdashboard mit Diagrammen ersetzen (6h) [Phase 4]
- [ ] Unit-Tests für Reporting, Einsatzplanung, Ressourcen, Finanzen (6h) [Phase 4]
```

### Phase 5 – Kundenportal Ergänzungen (NEU)

```
- [ ] Kundenportal: Echtes Login (E-Mail + Passwort) statt nur Token-Zugang (4h) [Phase 5]
- [ ] Kundenportal: E-Mail-Benachrichtigungen bei Statusänderungen (3h) [Phase 5]
- [ ] Kundenportal: Feedback-Formular nach Projektabschluss (2h) [Phase 5]
- [ ] Kundenportal: Dokumenten-Upload durch Kunde (Vollmachten, Genehmigungen) (3h) [Phase 5]
- [ ] Kundenportal: Einfaches Nachrichtensystem Kunde ↔ FassadenFix (4h) [Phase 5]
- [ ] HubSpotIntegration.tsx: Sync-Status Dashboard, Mapping, Protokoll, Fehler-Log (4h) [Phase 5]
```

### Phase 6 – Mock-Seiten & Optimierung (NEU)

```
- [ ] Teamleitercheck.tsx: Mock durch echte Checklisten-basierte Kontrolle ersetzen (6h) [Phase 6]
- [ ] Dokumente.tsx: Mit Archiv zusammenführen oder Weiterleitung (2h) [Phase 6]
- [ ] Bibliothek.tsx: Mock durch echte Vorlagen-Verwaltung ersetzen (4h) [Phase 6]
- [ ] Verzeichnisse.tsx: Mock durch echte Stammdaten ersetzen (3h) [Phase 6]
- [ ] PDFEntwuerfe.tsx: Mock durch echte PDF-Vorlagen-Verwaltung ersetzen (4h) [Phase 6]
- [ ] Einstellungen.tsx: Echte Einstellungen (Profil, Benachrichtigungen, Theme) (4h) [Phase 6]
- [ ] Sprachsteuerung.tsx: Platzhalter mit "Kommt in zukünftiger Version" Hinweis (0.5h) [Phase 6]
- [ ] Mock-Daten aus shared/const.ts entfernen nach Ersetzung (2h) [Phase 6]
- [ ] Doppelte Komponenten konsolidieren (2h) [Phase 6]
- [ ] Einheitliche Error-Boundaries für alle Seiten (2h) [Phase 6]
```

---

## 9. Risiken und Abhängigkeiten

### Technische Risiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Mitigation |
|---|---|---|---|
| **Offline-Foto-Upload** auf Baustellen | Hoch | Datenverlust | Service Worker mit lokaler Zwischenspeicherung |
| **HubSpot API-Rate-Limits** bei Auto-Sync | Mittel | Sync-Verzögerungen | Batching, exponentielles Backoff, Sync-Queue |
| **Große Foto-Dateien** (>10MB pro Foto) | Hoch | Langsamer Upload | Chunked Upload, Fortschrittsanzeige, Komprimierung nur für Thumbnails |
| **Datenbankmigrationen** bei laufendem Betrieb | Mittel | Ausfallzeit | Migrationen nur mit additiven Änderungen, keine Breaking Changes |
| **Microsoft Graph API Token-Refresh** | Mittel | E-Mail-Versand unterbrochen | Automatischer Token-Refresh, Fallback auf Manus Notification |

### Externe Abhängigkeiten

| Abhängigkeit | Benötigt für | Status | Aktion |
|---|---|---|---|
| **Azure Admin-Zugang** | Microsoft 365 SSO (v7.1) | Ausstehend | Kunde muss App Registration erstellen |
| **HubSpot Private App Token** | HubSpot Bidi-Sync (v7.2) | Vorhanden | Token-Gültigkeit prüfen |
| **S3-Bucket Konfiguration** | Foto-Upload (v7.0) | Vorhanden | Storage-Limits prüfen |
| **Open-Meteo API** | Wetterdaten (v7.0c) | Frei verfügbar | Keine Aktion nötig |
| **Anthropic API-Guthaben** | Claude-basierte Features | Aufgebraucht | Guthaben aufladen |

### Empfohlene Parallelisierung

```
Woche 1-2:   [Phase 1: Workflow-Reparatur]
              ├── Team A: Phasenübergänge + Validierung (2.1, 2.4)
              └── Team B: Nächster-Schritt-Navigation + Workflow-Buttons (2.2, 2.3)

Woche 3-4:   [Phase 1 Abschluss + Phase 2 Start]
              ├── Team A: Nachfass-System (2.5) + Mahnlauf (3.1)
              └── Team B: Aufgaben-Erinnerungen (3.2) + Benachrichtigungen (3.4)

Woche 5-8:   [Phase 3: Mobile Baustelle] parallel mit [v7.1: Microsoft 365]
              ├── Team A: Foto-Upload + Vorher-Doku + Mobile App
              └── Team B: Microsoft SSO + Graph API E-Mail

Woche 9-12:  [Phase 4: Reporting] parallel mit [v7.2: HubSpot]
              ├── Team A: Berichtswesen + Finanzdashboard
              └── Team B: HubSpot Auto-Sync + Einsatzplanung

Woche 13-16: [Phase 5: Kundenportal] parallel mit [Phase 6 Start]
              ├── Team A: Kundenportal Ampel + Login + Nachrichten
              └── Team B: Mock-Seiten ersetzen

Woche 17-20: [Phase 6: Optimierung + v7.5]
              └── Alle: Code-Qualität, Performance, erweiterte Features
```

---

## 10. Meilenstein-Übersicht

| # | Meilenstein | Aufwand | Abhängigkeit | Ergebnis |
|---|---|---|---|---|
| M1 | Workflow durchgängig | 47h (~6d) | Keine | Prozess ohne Brüche, automatische Phasen |
| M2 | Proaktives System | 41h (~5d) | M1 | Mahnlauf, Erinnerungen, Auto-Sync |
| M3 | Foto-Upload & Vorher-Doku | 48h (~6d) | Keine (parallel zu M1) | S3-Upload, Vorher-Dokumentation |
| M4 | Mobile Baustellenapp | 40h (~5d) | M3 | Tagesberichte, Ereignismelder, Nachher-Doku |
| M5 | Microsoft 365 Integration | 40h (~5d) | Azure Admin | SSO + E-Mail über Graph API |
| M6 | HubSpot Bidi-Sync | 28h (~3.5d) | Keine | Automatischer bidirektionaler Sync |
| M7 | Kundenportal Ampel | 36h (~4.5d) | Keine | Ampel-System, Unternehmenszugang |
| M8 | Management & Reporting | 47h (~6d) | M1, M2 | Echte KPIs, Einsatzplanung, Finanzen |
| M9 | Mock-Seiten ersetzt | 35h (~4.5d) | M1–M8 | Alle Seiten mit echten Daten |
| M10 | Code-Qualität & Performance | 24h (~3d) | M9 | Produktionsreife Codebase |
| **Gesamt** | | **~386h (~48d)** | | **Produktionsreifes FaFi PM** |

---

## Anhang: Priorisierte Sofort-Maßnahmen (Top 5)

Wenn nur begrenzte Ressourcen verfügbar sind, sollten diese 5 Maßnahmen **sofort** umgesetzt werden:

1. **Automatische Phasenübergänge** (5h) – Behebt den gravierendsten Workflow-Bruch
2. **"Nächster Schritt"-Widget im Dashboard** (11h) – Drastisch verbesserte Benutzerführung
3. **Nachfass-System** (11h) – Verhindert Auftragsverluste
4. **Workflow-Buttons in Detail-Ansichten** (8h) – Intuitive Navigation
5. **Phasen-Validierung** (6h) – Qualitätssicherung

Diese 5 Maßnahmen (41h ≈ 5 Arbeitstage) transformieren FaFi PM von einem "gut geplanten Haus ohne Treppe" zu einem System, das Nutzer intuitiv durch den gesamten Prozess führt.

---

*Dieser Implementierungsplan basiert auf der vollständigen Code-Review, der Systemanalyse mit 5 identifizierten kritischen Workflow-Brüchen, den 6 Interview-Erkenntnissen und der bestehenden Todo-Liste (v7.0–v7.5).*
