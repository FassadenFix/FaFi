# Lücken-Bericht: Gegenprüfung Code vs. Anforderungen

**Datum:** 09. Februar 2026
**Methode:** Jede Anforderung aus Implementierungsplan, MVP-Spec, Interviews, Opus-Validierung gegen tatsächlichen Code geprüft

---

## Identifizierte Lücken (7 Stück)

### L1: "Eingangsseite" → "Frontseite" nicht überall korrigiert (KRITISCH)
**Quelle:** Interview-Revalidierung A1
**Status in todo:** Als erledigt markiert
**Tatsächlich:** Nur im ObjektaufnahmeWizard korrigiert. 26 Referenzen in 11 weiteren Dateien verwenden noch "Eingangsseite":
- AngebotWizard.tsx (3x in Mock-Daten)
- BaustellenFotoUpload.tsx (1x)
- FotoGalerie.tsx (7x)
- GebaeudeSatellitenansicht.tsx (1x)
- ImmobilienPDFExport.tsx (4x)
- FotoUpload.tsx (1x)
- FotoGalerieView.tsx (1x)
- VorherDokuWizard.tsx (1x)
- NachherDokuWizard.tsx (1x)
- Immobilien.tsx (1x)

### L2: Kundenportal fehlt Feedback-Formular (MITTEL)
**Quelle:** Implementierungsplan Phase 6, MVP-Spec M8
**Status in todo:** Kundenportal als erledigt markiert
**Tatsächlich:** Kundenportal.tsx hat Tabs für "Projekte", "Garantien", "Dokumente" – aber KEIN Feedback-Tab/Formular für Kundenzufriedenheit/Bewertung.

### L3: Angebote-Seite verwendet noch Mock-Daten (MITTEL)
**Quelle:** Implementierungsplan Phase 7 "Mock-Seiten ersetzen"
**Status in todo:** Nicht explizit als offen markiert
**Tatsächlich:** Angebote.tsx importiert `MOCK_VERSIONEN` aus AngebotVersionierung.tsx. Die Versionierung nutzt hardcodierte Mock-Daten statt tRPC-Queries.

### L4: PDFEntwuerfe-Seite komplett Mock-basiert (MITTEL)
**Quelle:** Implementierungsplan Phase 7 "Mock-Seiten ersetzen"
**Status in todo:** Nicht explizit als offen markiert
**Tatsächlich:** PDFEntwuerfe.tsx hat `const mockData = {...}` mit hardcodierten Kundendaten.

### L5: GPS-Koordinaten bei Foto-Upload nicht automatisch erfasst (NIEDRIG)
**Quelle:** Interview: "GPS bei Foto-Upload"
**Status in todo:** Als erledigt markiert (Wasserzeichen)
**Tatsächlich:** imageCompression.ts hat GPS-Wasserzeichen-Support, aber BaustellenFotoUpload.tsx ruft `navigator.geolocation` NICHT automatisch auf. GPS wird nur in MobileApp.tsx (useGPSLocation Hook) verwendet, nicht im Standard-Foto-Upload.

### L6: API Response Compression fehlt (NIEDRIG)
**Quelle:** Implementierungsplan Infrastruktur
**Status in todo:** Als erledigt markiert (Performance)
**Tatsächlich:** Kein `compression` Middleware in server/_core/index.ts. Express-Responses werden unkomprimiert gesendet.

### L7: Kundenportal-Feedback-Tab fehlt (siehe L2)
Duplikat von L2 – aus unterschiedlicher Quelle identifiziert.

---

## Zusammenfassung

| # | Lücke | Priorität | Aufwand |
|---|---|---|---|
| L1 | "Eingangsseite" → "Frontseite" global | KRITISCH | 30min |
| L2 | Feedback-Formular im Kundenportal | MITTEL | 2h |
| L3 | Angebote-Versionierung Mock → tRPC | MITTEL | 1h |
| L4 | PDFEntwuerfe Mock → tRPC | MITTEL | 1h |
| L5 | GPS-Auto-Erfassung bei Foto-Upload | NIEDRIG | 30min |
| L6 | API Response Compression | NIEDRIG | 15min |

**Gesamt: ~5h Aufwand für vollständige Schließung aller Lücken**
