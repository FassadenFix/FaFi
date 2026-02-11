# FaFi PM – Umfassende Analyse und Verbesserungsvorschläge

*Erstellt am 08.02.2026 auf Basis einer vollständigen Code-Review*

---

# FaFi PM - Analyse und Verbesserungsempfehlungen

## 1. Gesamtbewertung

### ✅ Was funktioniert gut:
- **Solide technische Basis**: 20 Seiten sind vollständig mit der Datenbank verbunden
- **Kernprozesse vorhanden**: Die wichtigsten Schritte (Projektanlage, Angebotserstellung, Auftragsannahme, Abnahme) existieren
- **Automatische Datenerstellung**: Bei Auftragsannahme werden automatisch Baustelle und Standardaufgaben erstellt
- **HubSpot-Integration**: Bidirektionale Synchronisation bei wichtigen Geschäftsereignissen

### ❌ Was ist kritisch:
- **Zerbrochener Workflow**: Nach der Angebotserstellung bricht die automatische Prozessführung komplett ab
- **Fehlende Benutzerführung**: Nutzer müssen selbst wissen, welcher Schritt als nächstes kommt
- **Mock-Daten dominieren**: 11 wichtige Seiten sind nur Attrappen ohne echte Funktionalität
- **Baustellen-Management unvollständig**: Die Mobile App und Tagesabläufe existieren nur als Mock-ups

**Fazit**: Das System ist ein solider Grundstein, aber noch nicht produktionsreif. Es fühlt sich an wie ein gut geplantes Haus, bei dem die Treppe zwischen den Stockwerken fehlt.

---

## 2. Workflow-Brüche und Inkonsistenzen

### Objektaufnahme → Angebotserstellung 🔴 BRUCH
**Problem**: Der ObjektaufnahmeWizard erstellt eine Immobilie, führt aber nicht automatisch zur Angebotserstellung weiter.
**Auswirkung**: Der Kundenberater muss nach der Objektaufnahme manuell zur Angebots-Seite navigieren und die richtige Immobilie suchen.

### Angebotserstellung → Angebotsversand 🔴 BRUCH  
**Problem**: Nach dem Speichern eines Angebots wird die Projektphase NICHT auf "angebot_erstellt" gesetzt.
**Auswirkung**: Das Dashboard zeigt falsche Projektstatus an, Berichte sind unzuverlässig.

### Angebotsversand → Nachfassen 🔴 BRUCH
**Problem**: 
- E-Mail-Versand setzt Projekt-Phase NICHT auf "angebot_versendet"
- Kein automatisches Nachfass-System nach X Tagen
**Auswirkung**: Angebote gehen verloren, weil niemand daran erinnert wird nachzufassen.

### Auftragsannahme → Planung → Durchführung 🔴 BRUCH
**Problem**: Nach der Auftragsannahme erfolgt KEIN automatischer Übergang durch die Phasen "planung" → "vorbereitung" → "durchführung".
**Auswirkung**: Aufträge "verschwinden" im System, der AT-Leiter weiß nicht welche Baustellen vorbereitet werden müssen.

### Durchführung → Dokumentation 🔴 FEHLT KOMPLETT
**Problem**: 
- Keine Vorher-Dokumentation vor Baustellenstart
- Keine Tagesberichte (Morgen-/Abendmeldung)
- Keine Nachher-Dokumentation vor Abnahme
**Auswirkung**: Bei Reklamationen keine Beweise, rechtliche Probleme, unprofessioneller Auftritt.

### Manuelle Phasenänderung 🔴 UNSICHER
**Problem**: `project.update` erlaubt beliebige Phasensprünge ohne Validierung.
**Auswirkung**: Phasen können übersprungen werden, wichtige Schritte werden vergessen.

---

## 3. Benutzerführung – Wo verliert sich der Nutzer?

### AT-Leiter Perspektive:
| Situation | Problem | Frustration |
|-----------|---------|-------------|
| Morgens im Büro | Dashboard zeigt keine "ToDos für heute" | "Welche Baustellen muss ich heute vorbereiten?" |
| Neuer Auftrag | Kein Link von Auftrag zu "Baustelle planen" | Muss selbst wissen wo Einsatzplanung ist (Mock!) |
| Baustellenkontrolle | Mobile App ist Mock | Kann Fortschritt nicht verfolgen |

### Kundenberater Perspektive:
| Situation | Problem | Frustration |
|-----------|---------|-------------|
| Nach Objektbesichtigung | Kein "Angebot erstellen" Button nach Objektaufnahme | "Wo fange ich jetzt an?" |
| Angebot versendet | Keine automatische Nachfass-Erinnerung | Vergisst nachzuhaken → verliert Aufträge |
| Projekt-Übersicht | "Status ändern" zeigt nur Toast | "Wie bringe ich das Projekt voran?" |

### Geschäftsführung Perspektive:
| Situation | Problem | Frustration |
|-----------|---------|-------------|
| Wochenbericht | Berichtswesen ist Mock | Keine echten KPIs verfügbar |
| Liquiditätsplanung | Kein automatischer Mahnlauf | Außenstände werden nicht systematisch verfolgt |
| Teamauslastung | Ressourcenplanung ist Mock | Kann keine fundierte Personalplanung machen |

**Kern-Problem**: Das System sagt nicht "Was ist der nächste Schritt?" - es erwartet, dass der Nutzer den Prozess auswendig kennt.

---

## 4. Die 10 kritischsten Verbesserungsvorschläge

### 1. 🚨 Automatische Phasenübergänge implementieren
**Problem**: Projekte hängen nach Angebotserstellung fest
**Lösung**: `saveFromWizard` → Phase "angebot_erstellt", `sendOffer` → Phase "angebot_versendet"
**Impact**: ⭐⭐⭐⭐⭐ Dashboard wird zuverlässig, Prozess läuft automatisch

### 2. 🚨 "Nächster Schritt"-Navigation im Dashboard
**Problem**: Nutzer wissen nicht was als nächstes zu tun ist
**Lösung**: Für jedes Projekt anzeigen: "📋 Angebot erstellen" / "📧 Nachfassen seit 5 Tagen" / "🏗️ Baustelle vorbereiten"
**Impact**: ⭐⭐⭐⭐⭐ Drastisch verbesserte Benutzerführung

### 3. 🚨 Automatisches Nachfass-System
**Problem**: Angebote werden vergessen
**Lösung**: Cron-Job der nach 7/14/30 Tagen Erinnerungen erstellt
**Impact**: ⭐⭐⭐⭐⭐ Mehr Aufträge, weniger verlorene Leads

### 4. 🔧 Workflow-Buttons in Detail-Ansichten
**Problem**: Fehlende Verknüpfungen zwischen Prozessschritten
**Lösung**: 
- ProjektDetail: "Angebot erstellen" Button
- AngebotDetail: "Als versendet markieren" + "Auftrag annehmen" Buttons
- BaustellenDetail: "Abnahme starten" Button
**Impact**: ⭐⭐⭐⭐ Intuitive Navigation, weniger Klicks

### 5. 🚨 Mobile App für Baustellenmanager (DB-Anbindung)
**Problem**: Komplette Baustellendokumentation ist Mock
**Lösung**: Echte Mobile App für Vorher/Nachher-Fotos, Tagesberichte
**Impact**: ⭐⭐⭐⭐⭐ Rechtssicherheit, professioneller Auftritt

### 6. 🔧 Phasen-Validierung implementieren
**Problem**: Manuelle Phasensprünge ohne Prüfungen
**Lösung**: Vor Phasenübergang prüfen: Angebot vorhanden? Vorher-Doku vollständig?
**Impact**: ⭐⭐⭐⭐ Qualitätssicherung, keine vergessenen Schritte

### 7. 📊 Echtes Berichtswesen statt Mock
**Problem**: Geschäftsführung hat keine KPIs
**Lösung**: Dashboard mit Conversion-Rates, Außenständen, Teamauslastung
**Impact**: ⭐⭐⭐⭐ Fundierte Geschäftsentscheidungen möglich

### 8. 💰 Automatischer Mahnlauf
**Problem**: Zahlungseingänge werden nicht systematisch verfolgt
**Lösung**: Automatische Mahnstufen nach 30/60/90 Tagen
**Impact**: ⭐⭐⭐ Bessere Liquidität

### 9. 🔗 Bessere HubSpot-Integration
**Problem**: Sync nur manuell, Integration-Seite ist Mock
**Lösung**: Automatischer Sync-Job, echte Integration-Verwaltung
**Impact**: ⭐⭐⭐ CRM bleibt aktuell

### 10. 📅 Einsatzplanung mit DB-Anbindung
**Problem**: Ressourcenplanung ist Mock
**Lösung**: Echte Terminplanung mit Teamverfügbarkeit
**Impact**: ⭐⭐⭐ Effiziente Ressourcennutzung

---

## 5. Fehlende Kernfunktionen

### Kritisch fehlend:
- **Vorher/Nachher-Dokumentation**: Tabelle + Workflow für Foto-Upload vor/nach Reinigung
- **Tagesberichte**: Morgenmeldung, Abendmeldung, Ereignismeldung für Baustellen
- **Witterungsdokumentation**: 3x täglich für rechtliche Absicherung
- **Mobile Baustellenapp**: Echte App statt Mock für AT-Leiter
- **Automatische Erinnerungen**: System für Nachfassen, Mahnungen, fällige Aufgaben

### Wichtig fehlend:
- **Aufgaben-Management**: Welche Baustellen-Aufgaben sind überfällig?
- **Materialbestellung**: Verknüpfung von Baustellen mit Materialbedarf
- **Qualitätskontrolle**: Checklisten für Abnahmen
- **Kundenportal**: Echter Kunde-Login statt Mock

### Nice-to-have fehlend:
- **Sprachsteuerung**: Für Baustellenberichte (aktuell nur Platzhalter)
- **KI-Preisvorschläge**: Basierend auf historischen Daten
- **Wetter-Integration**: Automatische Verschiebung bei schlechtem Wetter

---

## 6. Empfohlene Umsetzungsreihenfolge

### Phase 1 (Sofort - 2 Wochen): Workflow reparieren
1. **Automatische Phasenübergänge** bei Angebotserstellung/-versand
2. **"Nächster Schritt"-Buttons** im Dashboard
3. **Workflow-Navigation** in Detail-Ansichten (Angebot → Auftrag → Baustelle)
4. **Phasen-Validierung** implementieren

**Ziel**: Nutzer können den Prozess Ende-zu-Ende ohne Brüche durchlaufen

### Phase 2 (Woche 3-6): Automatisierung
1. **Nachfass-System** für Angebote
2. **Automatischer Mahnlauf** für Rechnungen
3. **Aufgaben-Erinnerungen** für überfällige Baustellen-Tasks
4. **HubSpot Auto-Sync**

**Ziel**: System arbeitet proaktiv, weniger vergessene Termine

### Phase 3 (Woche 7-12): Mobile Baustelle
1. **Mobile App** für Baustellenmanager (DB-angebunden)
2. **Vorher/Nachher-Dokumentation** Workflow
3. **Tagesberichte** (Morgen-/Abendmeldung)
4. **Witterungsdokumentation**

**Ziel**: Vollständige Baustellendokumentation, Rechtssicherheit

### Phase 4 (Woche 13-16): Management & Reporting
1. **Echtes Berichtswesen** statt Mock
2. **Einsatzplanung** mit echter Terminverwaltung
3. **Ressourcenübersicht** für Teamauslastung
4. **Finanzdashboard** für Geschäftsführung

**Ziel**: Fundierte Geschäftsentscheidungen durch echte Daten

### Phase 5 (ab Woche 17): Optimierung
1. **Kundenportal** ausbauen
2. **Erweiterte Integrationen**
3. **KI-Features** für Preisfindung
4. **Sprachsteuerung** für Baustellenberichte

**Ziel**: Wettbewerbsvorteile durch innovative Features

---

**Empfehlung**: Beginnen Sie sofort mit Phase 1. Jede Woche Verzögerung bedeutet verlorene Aufträge durch das defekte Nachfass-System und Frust bei den Mitarbeitern durch die unvollständige Benutzerführung.