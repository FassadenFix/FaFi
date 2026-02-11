/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * MVP-Spec: Kernmodul 6 - Benutzerverwaltung (Login/Logout)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { IMAGES } from "@shared/const";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (email && password) {
      toast.success("Erfolgreich angemeldet", {
        description: "Willkommen zurück bei FaFi PM!",
      });
      setLocation("/");
    } else {
      toast.error("Anmeldung fehlgeschlagen", {
        description: "Bitte überprüfen Sie Ihre Zugangsdaten.",
      });
    }

    setIsLoading(false);
  };

  const handleForgotPassword = () => {
    toast.info("Passwort zurücksetzen", {
      description: "Ein Link wurde an Ihre E-Mail-Adresse gesendet.",
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={IMAGES.heroProject}
          alt="FassadenFix Projekt"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#4e5758]/80 to-[#4e5758]/40" />
        <div className="absolute inset-0 flex flex-col justify-center p-12">
          <img
            src="/logo.png"
            alt="FassadenFix Logo"
            className="h-12 w-auto mb-8"
          />
          <h1 className="text-4xl font-bold text-white mb-4">
            FaFi PM
          </h1>
          <p className="text-xl text-white/80 max-w-md">
            Ihr sicherer Weg zur sauberen Fassade – Projektmanagement für professionelle Fassadenreinigung.
          </p>
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-2 h-2 rounded-full bg-[#77bc1f]" />
              <span>Projekte effizient verwalten</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-2 h-2 rounded-full bg-[#77bc1f]" />
              <span>Angebote in Minuten erstellen</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-2 h-2 rounded-full bg-[#77bc1f]" />
              <span>HubSpot-Integration inklusive</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <img
              src="/logo.png"
              alt="FassadenFix Logo"
              className="h-10 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold">FaFi PM</h1>
          </div>

          <Card className="ff-card border-0 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Anmelden</CardTitle>
              <CardDescription>
                Melden Sie sich mit Ihren Zugangsdaten an
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail-Adresse</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@fassadenfix.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Passwort</Label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-primary hover:underline"
                    >
                      Passwort vergessen?
                    </button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Angemeldet bleiben
                  </Label>
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 ff-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Wird angemeldet..." : "Anmelden"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
                <p>
                  Benutzerrollen: <span className="font-medium">Admin</span>,{" "}
                  <span className="font-medium">Kundenberater</span>,{" "}
                  <span className="font-medium">Büro</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            © 2026 FassadenFix GmbH. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </div>
  );
}
