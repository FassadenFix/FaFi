import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy loading wrapper
function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      {children}
    </Suspense>
  );
}

// Critical pages - eager loaded
import Dashboard from "./pages/Dashboard";
import Projekte from "./pages/Projekte";
import ProjektDetail from "./pages/ProjektDetail";
import Login from "./pages/Login";

// Lazy-loaded pages - Bereich 1
const Immobilien = lazy(() => import("./pages/Immobilien"));
const Baustellen = lazy(() => import("./pages/Baustellen"));
const ImmobilienDetail = lazy(() => import("./pages/ImmobilienDetail"));
const BaustellenDetail = lazy(() => import("./pages/BaustellenDetail"));

// Lazy-loaded pages - Bereich 2
const Angebote = lazy(() => import("./pages/Angebote"));
const Kontakte = lazy(() => import("./pages/Kontakte"));
const Auftraege = lazy(() => import("./pages/Auftraege"));
const Garantien = lazy(() => import("./pages/Garantien"));
const AuftragDetail = lazy(() => import("./pages/AuftragDetail"));
const RechnungDetail = lazy(() => import("./pages/RechnungDetail"));
const GarantieDetail = lazy(() => import("./pages/GarantieDetail"));

// Lazy-loaded pages - Bereich 3: Planung
const Terminfinder = lazy(() => import("./pages/Terminfinder"));
const Einsatzplanung = lazy(() => import("./pages/Einsatzplanung"));
const Ressourcen = lazy(() => import("./pages/Ressourcen"));

// Lazy-loaded pages - Bereich 4: Projektvorbereitung
const ProjekteOffen = lazy(() => import("./pages/ProjekteOffen"));
const ProjekteUeberfaellig = lazy(() => import("./pages/ProjekteUeberfaellig"));
const BaustellenOffen = lazy(() => import("./pages/BaustellenOffen"));
const BaustellenUeberfaellig = lazy(() => import("./pages/BaustellenUeberfaellig"));
const Vorbereitungsaufgaben = lazy(() => import("./pages/Vorbereitungsaufgaben"));

// Lazy-loaded pages - Bereich 5: Umsetzung
const Teamleitercheck = lazy(() => import("./pages/Teamleitercheck"));
const MobileApp = lazy(() => import("./pages/MobileApp"));
const Berichtswesen = lazy(() => import("./pages/Berichtswesen"));

// Lazy-loaded pages - Bereich 6: Finanzen
const Finanzen = lazy(() => import("./pages/Finanzen"));
const Rechnungen = lazy(() => import("./pages/Rechnungen"));
const Zahlungen = lazy(() => import("./pages/Zahlungen"));
const Budgets = lazy(() => import("./pages/Budgets"));

// Lazy-loaded pages - Bereich 7: Kundenportal
const Kundenportal = lazy(() => import("./pages/Kundenportal"));
const CustomerPortal = lazy(() => import("./pages/CustomerPortal"));
const Dokumente = lazy(() => import("./pages/Dokumente"));
const Kundenmeldungen = lazy(() => import("./pages/Kundenmeldungen"));

// Lazy-loaded pages - Bereich 8: Unternehmenssystem
const Archiv = lazy(() => import("./pages/Archiv"));
const Vorlagen = lazy(() => import("./pages/Vorlagen"));
const Bibliothek = lazy(() => import("./pages/Bibliothek"));

// Lazy-loaded pages - Bereich 10: HR / Personal
const HRDashboard = lazy(() => import("./pages/HRDashboard"));
const HRMitarbeiter = lazy(() => import("./pages/HRMitarbeiter"));
const HRMitarbeiterDetail = lazy(() => import("./pages/HRMitarbeiterDetail"));
const HRDokumente = lazy(() => import("./pages/HRDokumente"));

// Lazy-loaded pages - Bereich 9: System & Einstellungen
const Team = lazy(() => import("./pages/Team"));
const HubSpotIntegration = lazy(() => import("./pages/HubSpotIntegration"));
const Sprachsteuerung = lazy(() => import("./pages/Sprachsteuerung"));
const Einstellungen = lazy(() => import("./pages/Einstellungen"));
const PDFEntwuerfe = lazy(() => import("./pages/PDFEntwuerfe"));

// Other Pages
const Benachrichtigungen = lazy(() => import("./pages/Benachrichtigungen"));
import Onboarding from "./components/Onboarding";
import { OfflineProvider } from "./components/OfflineMode";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
    <Switch>
      {/* Bereich 1: Erstellen & Erfassen */}
      <Route path="/" component={Dashboard} />
      <Route path="/projekte" component={Projekte} />
      <Route path="/projekte/:id" component={ProjektDetail} />
      <Route path="/baustellen" component={Baustellen} />
      <Route path="/immobilien" component={Immobilien} />
      <Route path="/immobilien/:id" component={ImmobilienDetail} />
      <Route path="/baustellen/:id" component={BaustellenDetail} />

      {/* Bereich 2: Kundenberatung */}
      <Route path="/kontakte" component={Kontakte} />
      <Route path="/angebote" component={Angebote} />
      <Route path="/auftraege" component={Auftraege} />
      <Route path="/auftraege/:id" component={AuftragDetail} />
      <Route path="/garantien" component={Garantien} />
      <Route path="/garantien/:id" component={GarantieDetail} />

      {/* Bereich 3: Planung */}
      <Route path="/terminfinder" component={Terminfinder} />
      <Route path="/einsatzplanung" component={Einsatzplanung} />
      <Route path="/ressourcen" component={Ressourcen} />

      {/* Bereich 4: Projektvorbereitung */}
      <Route path="/projekte-offen" component={ProjekteOffen} />
      <Route path="/projekte-ueberfaellig" component={ProjekteUeberfaellig} />
      <Route path="/baustellen-offen" component={BaustellenOffen} />
      <Route path="/baustellen-ueberfaellig" component={BaustellenUeberfaellig} />
      <Route path="/vorbereitungsaufgaben" component={Vorbereitungsaufgaben} />

      {/* Bereich 5: Umsetzung */}
      <Route path="/teamleitercheck" component={Teamleitercheck} />
      <Route path="/mobile" component={MobileApp} />
      <Route path="/berichte" component={Berichtswesen} />

      {/* Bereich 6: Finanzen */}
      <Route path="/finanzen" component={Finanzen} />
      <Route path="/rechnungen" component={Rechnungen} />
      <Route path="/rechnungen/:id" component={RechnungDetail} />
      <Route path="/zahlungen" component={Zahlungen} />
      <Route path="/budgets" component={Budgets} />

      {/* Bereich 7: Kundenportal */}
      <Route path="/kundenportal" component={Kundenportal} />
      <Route path="/portal/:token" component={CustomerPortal} />
      <Route path="/dokumente" component={Dokumente} />
      <Route path="/kundenmeldungen" component={Kundenmeldungen} />

      {/* Bereich 8: Unternehmenssystem */}
      <Route path="/archiv" component={Archiv} />
      <Route path="/vorlagen" component={Vorlagen} />
      <Route path="/materialien" component={Ressourcen} />
      <Route path="/bibliothek" component={Bibliothek} />

      {/* Bereich 10: HR / Personal */}
      <Route path="/hr" component={HRDashboard} />
      <Route path="/hr/mitarbeiter" component={HRMitarbeiter} />
      <Route path="/hr/mitarbeiter/:id" component={HRMitarbeiterDetail} />
      <Route path="/hr/dokumente" component={HRDokumente} />

      {/* Bereich 9: System & Einstellungen */}
      <Route path="/team" component={Team} />
      <Route path="/hubspot" component={HubSpotIntegration} />
      <Route path="/sprachsteuerung" component={Sprachsteuerung} />
      <Route path="/einstellungen" component={Einstellungen} />

      {/* Other Routes */}
      <Route path="/pdf-entwuerfe" component={PDFEntwuerfe} />
      <Route path="/benachrichtigungen" component={Benachrichtigungen} />
      <Route path="/login" component={Login} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <OfflineProvider>
          <TooltipProvider>
            <Toaster />
            <Onboarding />
            <Router />
          </TooltipProvider>
        </OfflineProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
