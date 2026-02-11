/*
 * DESIGN: "Organic Flow" – Biophiles Dashboard-Design
 * CI: FassadenFix #77bc1f (Pantone 368 C), #4e5758 (Pantone 445 C)
 * PDF Preview Component for Angebote
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, Mail, X } from "lucide-react";
import { toast } from "sonner";

interface OfferData {
  offerNumber: string;
  version: number;
  projectName: string;
  customerName: string;
  totalArea: number;
  totalPrice: number;
  discountPercent: number;
  discountType: string | null;
  validUntil: string;
  createdAt: string;
}

interface OfferPDFPreviewProps {
  offer: OfferData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OfferPDFPreview({ offer, isOpen, onClose }: OfferPDFPreviewProps) {
  if (!offer) return null;

  const basePrice = offer.totalPrice / (1 - offer.discountPercent / 100);
  const discountAmount = basePrice - offer.totalPrice;
  const pricePerSqm = offer.totalPrice / offer.totalArea;

  const handleDownload = () => {
    toast.success("PDF wird heruntergeladen...", {
      description: `${offer.offerNumber}.pdf`,
    });
  };

  const handlePrint = () => {
    toast.info("Druckdialog wird geöffnet...");
  };

  const handleSendEmail = () => {
    toast.success("E-Mail wird vorbereitet...", {
      description: "Angebot wird an den Kunden gesendet.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>PDF-Vorschau: {offer.offerNumber}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Vorschau des Angebots im finalen PDF-Layout
          </DialogDescription>
        </DialogHeader>

        {/* PDF Preview Container */}
        <div className="bg-white border rounded-lg shadow-inner p-8 my-4" style={{ minHeight: "600px" }}>
          {/* PDF Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#77bc1f] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">FF</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#4e5758]">FassadenFix GmbH</h1>
                  <p className="text-sm text-gray-500">Ihr sicherer Weg zur sauberen Fassade</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>Musterstraße 123</p>
                <p>12345 Musterstadt</p>
                <p>Tel: 0800 123 456 789</p>
                <p>info@fassadenfix.de</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-[#77bc1f] mb-2">ANGEBOT</h2>
              <p className="text-lg font-semibold">{offer.offerNumber}</p>
              <p className="text-sm text-gray-500">Version {offer.version}</p>
              <p className="text-sm text-gray-500 mt-2">
                Datum: {new Date(offer.createdAt).toLocaleDateString("de-DE")}
              </p>
              <p className="text-sm text-gray-500">
                Gültig bis: {new Date(offer.validUntil).toLocaleDateString("de-DE")}
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Customer Info */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">KUNDE</h3>
            <p className="font-semibold text-lg">{offer.customerName}</p>
            <p className="text-gray-600">z.Hd. Geschäftsführung</p>
            <p className="text-gray-600">Kundenstraße 45</p>
            <p className="text-gray-600">12345 Kundenstadt</p>
          </div>

          {/* Project Info */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">PROJEKT</h3>
            <p className="font-semibold text-lg">{offer.projectName}</p>
            <p className="text-gray-600">Fassadenreinigung mit Langzeitschutz</p>
          </div>

          {/* Price Table */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-500 mb-4">LEISTUNGSÜBERSICHT</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#4e5758]">
                  <th className="text-left py-2 font-semibold">Position</th>
                  <th className="text-right py-2 font-semibold">Menge</th>
                  <th className="text-right py-2 font-semibold">Einheit</th>
                  <th className="text-right py-2 font-semibold">Einzelpreis</th>
                  <th className="text-right py-2 font-semibold">Gesamtpreis</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3">
                    <p className="font-medium">Fassadenreinigung</p>
                    <p className="text-sm text-gray-500">Professionelle Reinigung mit Spezialverfahren</p>
                  </td>
                  <td className="text-right py-3">{offer.totalArea.toLocaleString("de-DE")}</td>
                  <td className="text-right py-3">m²</td>
                  <td className="text-right py-3">{(pricePerSqm * 0.7).toFixed(2)} €</td>
                  <td className="text-right py-3">{(offer.totalArea * pricePerSqm * 0.7).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">
                    <p className="font-medium">Langzeitschutz-Imprägnierung</p>
                    <p className="text-sm text-gray-500">5 Jahre Garantie gegen Neubefall</p>
                  </td>
                  <td className="text-right py-3">{offer.totalArea.toLocaleString("de-DE")}</td>
                  <td className="text-right py-3">m²</td>
                  <td className="text-right py-3">{(pricePerSqm * 0.3).toFixed(2)} €</td>
                  <td className="text-right py-3">{(offer.totalArea * pricePerSqm * 0.3).toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Zwischensumme:</span>
                <span>{basePrice.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</span>
              </div>
              {offer.discountPercent > 0 && (
                <div className="flex justify-between py-2 text-[#77bc1f]">
                  <span>
                    Rabatt ({offer.discountPercent}%)
                    {offer.discountType && (
                      <span className="text-xs ml-1">
                        ({offer.discountType === "kennenlernen" ? "Kennenlern" : 
                          offer.discountType === "fruehbucher" ? "Frühbucher" : 
                          offer.discountType === "treue" ? "Treue" : "Sonstig"})
                      </span>
                    )}
                  </span>
                  <span>-{discountAmount.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between py-2 font-bold text-lg">
                <span>Gesamtbetrag:</span>
                <span className="text-[#77bc1f]">{offer.totalPrice.toLocaleString("de-DE", { minimumFractionDigits: 2 })} €</span>
              </div>
              <p className="text-xs text-gray-500 text-right">inkl. 19% MwSt.</p>
            </div>
          </div>

          {/* Terms */}
          <div className="text-sm text-gray-600 mb-8">
            <h3 className="font-semibold text-gray-700 mb-2">Zahlungsbedingungen</h3>
            <p>Zahlbar innerhalb von 14 Tagen nach Rechnungsstellung ohne Abzug.</p>
          </div>

          {/* Guarantee Box */}
          <div className="p-4 bg-[#77bc1f]/10 rounded-lg border border-[#77bc1f]/30 mb-8">
            <h3 className="font-semibold text-[#77bc1f] mb-2">🛡️ FassadenFix Garantie</h3>
            <p className="text-sm text-gray-700">
              Mit diesem Angebot erhalten Sie unsere 5-Jahres-Garantie gegen Neubefall. 
              Sollte innerhalb von 5 Jahren nach der Behandlung erneut Algen- oder Moosbefall auftreten, 
              reinigen wir die betroffenen Flächen kostenfrei nach.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-4 border-t">
            <p>FassadenFix GmbH • Musterstraße 123 • 12345 Musterstadt</p>
            <p>Geschäftsführer: Alexander Retzlaff • HRB 12345 • USt-IdNr: DE123456789</p>
            <p className="mt-2 text-[#77bc1f] font-medium">www.fassadenfix.de</p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" />
            Drucken
          </Button>
          <Button variant="outline" onClick={handleSendEmail} className="gap-2">
            <Mail className="w-4 h-4" />
            Per E-Mail senden
          </Button>
          <Button onClick={handleDownload} className="gap-2 ff-button">
            <Download className="w-4 h-4" />
            PDF herunterladen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
