import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-lg mx-4 shadow-lg border-0 bg-card/80 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-pulse" />
                <AlertCircle className="relative h-16 w-16 text-red-500" />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-2">404</h1>

            <h2 className="text-xl font-semibold text-foreground/80 mb-4">
              Seite nicht gefunden
            </h2>

            <p className="text-muted-foreground mb-8 leading-relaxed">
              Die angeforderte Seite existiert nicht oder wurde verschoben.
              <br />
              Bitte prüfen Sie die URL oder kehren Sie zum Dashboard zurück.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="px-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
              <Button
                onClick={() => setLocation("/")}
                className="bg-primary hover:bg-primary/90 text-white px-6"
              >
                <Home className="w-4 h-4 mr-2" />
                Zum Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
