# Loom-Feedback Transkription

**Video**: iOS-Aufnahme – 9. Februar 2026
**Autor**: Alex Retzlaff
**Dauer**: 2 Minuten 44 Sekunden
**Kontext**: Feedback zur FaFi PM Projektmanagement-Software

## Vollständige Transkription

So, wir gehen in den Fassadenfix Projekt Manager und möchten auf folgende Änderungen hinweisen, nämlich in der Objektaufnahme, sprich, wenn eine neue Immobilie angelegt wird oder erfasst wird, soll das Aufmaß, was wir hiermit Breite und Höhe haben, etwas flexibler dargestellt werden, nämlich für den Fall der Fälle, dass wir eine eine Seite haben, eine Frontseite haben, die wie an einer Front beispielsweise mit Fahrstuhlschächten ähm sozusagen unterbrochen ist und der Fahrstuhlschacht als solches endet schon in der fünften Etage, wo das Objekt an sich aber sechs Etagen hat. Dann ist hier von mir gewollt, dass wir das Aufmaß in Teilbereiche untergliedern können. Das heißt, ich möchte hier eine eine ähm Option, eine Auswahloption haben, Seite in Teilbereiche aufmessen. Und wenn ich dort einen Haken setze, habe ich erste Teilfläche. Was ist das? Ja, habe ich dann, wie gesagt, erste Teilfläche. Gebe Höhe und Breite ein. Habe dahinter noch ein Bemerkungstextfeld, wenn ich optional eine Bemerkung oder irgendwas machen möchte. Und kann dann anwählen, zweite Teilfläche oder weitere Teilfläche hinzufügen. Wenn ich den Haken setze, kriege ich noch eine Zeile sozusagen, Höhe, Breite, Bemerkungsfeld. Wieder Frage, weitere Teilfläche hinzufügen. Dann, wenn ich den Haken setze, wäre das dann die dritte, etc. Und übergeordnet, das was oben steht, ist dann bitte die summierte, also sprich aufgerechnete, kumulierte Fläche als solches. Ja, die sich aufgrund der Teilflächen ergibt. Die Teilflächen sind sozusagen ein Kind der Mutter des Gesamten.

## Extrahierte Änderungswünsche

### ÄNDERUNG 1: Aufmaß in Teilbereiche untergliedern (KRITISCH)

**Betroffene Stelle**: Objektaufnahme → Immobilie erfassen → Aufmaß (Breite/Höhe pro Seite)

**Problem**: Aktuell kann pro Seite nur EIN Aufmaß (Breite × Höhe) eingegeben werden. In der Praxis gibt es aber Fassadenseiten, die durch Fahrstuhlschächte, Vorsprünge oder andere Unterbrechungen in mehrere Teilbereiche mit unterschiedlichen Höhen zerfallen.

**Beispiel**: Eine Frontseite hat 6 Etagen, aber der Fahrstuhlschacht endet bei der 5. Etage → die Fassade hat zwei Teilflächen mit unterschiedlichen Höhen.

**Gewünschte Lösung**:
1. **Checkbox**: "Seite in Teilbereiche aufmessen" (Toggle/Checkbox)
2. **Wenn aktiviert**: Erste Teilfläche erscheint mit:
   - Höhe (m)
   - Breite (m)
   - Bemerkung (optionales Textfeld)
3. **Button**: "Weitere Teilfläche hinzufügen" → erzeugt neue Zeile mit Höhe, Breite, Bemerkung
4. **Beliebig viele Teilflächen** möglich (2., 3., 4., etc.)
5. **Übergeordnete Gesamtfläche**: Wird automatisch als Summe aller Teilflächen berechnet und oben angezeigt
6. **Hierarchie**: Teilflächen sind "Kinder" der Gesamtfläche ("Kind der Mutter des Gesamten")

**Datenmodell-Implikation**:
- Jede Seite (side) einer Immobilie braucht eine 1:n-Beziehung zu Teilflächen (sub_areas)
- Gesamtfläche = Summe aller Teilflächen-Flächen
- Wenn keine Teilbereiche: Verhalten wie bisher (einfach Breite × Höhe)
