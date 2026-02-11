/**
 * Auto-Archivierungs-Service
 * 
 * Zweck: Stellt sicher, dass jedes im FaFi PM generierte oder hochgeladene
 * Dokument automatisch im zentralen Archiv (documents-Tabelle) erfasst wird.
 * 
 * Wird aufgerufen von:
 * - Angebots-PDF-Erstellung/-Versand
 * - Rechnungs-PDF-Erstellung
 * - Garantie-Zertifikat-Erstellung
 * - Foto-Upload (Objektaufnahme, Baustelle, Abnahme)
 * - Mahnungs-Erstellung
 * - Manueller Datei-Upload
 */

import * as db from '../db';

type ArchiveCategory = 'angebot' | 'auftragsbestaetigung' | 'vertrag' | 'rechnung' | 'garantie' | 'abnahmeprotokoll' | 'protokoll' | 'foto' | 'sonstiges';
type FileType = 'dokument' | 'bild' | 'video' | 'sonstiges';

interface AutoArchiveParams {
  /** Anzeigename im Archiv */
  name: string;
  /** Originaler Dateiname */
  originalName: string;
  /** MIME-Typ der Datei */
  mimeType: string;
  /** Dateigröße in Bytes (0 wenn unbekannt) */
  fileSize: number;
  /** S3-URL der Datei */
  storageUrl: string;
  /** S3-Key der Datei */
  storageKey: string;
  /** Archiv-Kategorie */
  category: ArchiveCategory;
  /** Beschreibung */
  description?: string;
  /** Wer hat hochgeladen */
  uploadedBy?: string;
  /** Verknüpfungen */
  companyId?: number;
  projectId?: number;
  offerId?: number;
  orderId?: number;
  invoiceId?: number;
  warrantyId?: number;
  constructionSiteId?: number;
  propertyId?: number;
  contactId?: number;
}

/**
 * Bestimmt den Dateityp basierend auf dem MIME-Typ
 */
function getFileType(mimeType: string): FileType {
  if (mimeType.startsWith('image/')) return 'bild';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('application/pdf') || mimeType.startsWith('text/') || mimeType.includes('document') || mimeType.includes('spreadsheet')) return 'dokument';
  return 'sonstiges';
}

/**
 * Archiviert eine Datei automatisch im zentralen Archiv.
 * Fehler werden geloggt aber nicht weitergegeben, damit der Hauptprozess nicht blockiert wird.
 */
export async function autoArchive(params: AutoArchiveParams): Promise<{ id: number } | null> {
  try {
    const result = await db.createDocumentInArchive({
      name: params.name,
      originalName: params.originalName,
      fileType: getFileType(params.mimeType),
      mimeType: params.mimeType,
      fileSize: params.fileSize,
      storageUrl: params.storageUrl,
      storageKey: params.storageKey,
      category: params.category,
      description: params.description,
      uploadedBy: params.uploadedBy,
      companyId: params.companyId,
      projectId: params.projectId,
      offerId: params.offerId,
      orderId: params.orderId,
      invoiceId: params.invoiceId,
      warrantyId: params.warrantyId,
      constructionSiteId: params.constructionSiteId,
      propertyId: params.propertyId,
      contactId: params.contactId,
    });
    console.log(`[AutoArchiv] ✓ ${params.category}: "${params.name}" archiviert (ID: ${result.id})`);
    return { id: result.id };
  } catch (error) {
    console.error(`[AutoArchiv] ✗ Fehler beim Archivieren von "${params.name}":`, error);
    return null;
  }
}

/**
 * Archiviert ein Angebots-PDF
 */
export async function archiveOfferPdf(offer: {
  id: number;
  offerNumber: string;
  projectId?: number | null;
  companyId?: number | null;
  pdfUrl: string;
}, uploadedBy?: string): Promise<void> {
  await autoArchive({
    name: `Angebot ${offer.offerNumber}.pdf`,
    originalName: `${offer.offerNumber}.pdf`,
    mimeType: 'application/pdf',
    fileSize: 0,
    storageUrl: offer.pdfUrl,
    storageKey: `angebote/${offer.offerNumber}.pdf`,
    category: 'angebot',
    description: `Automatisch archiviertes Angebots-PDF für ${offer.offerNumber}`,
    uploadedBy: uploadedBy || 'System (Auto-Archiv)',
    offerId: offer.id,
    projectId: offer.projectId ?? undefined,
    companyId: offer.companyId ?? undefined,
  });
}

/**
 * Archiviert ein Rechnungs-PDF
 */
export async function archiveInvoicePdf(invoice: {
  id: number;
  invoiceNumber: string;
  projectId?: number | null;
  companyId?: number | null;
  pdfUrl: string;
}, uploadedBy?: string): Promise<void> {
  await autoArchive({
    name: `Rechnung ${invoice.invoiceNumber}.pdf`,
    originalName: `${invoice.invoiceNumber}.pdf`,
    mimeType: 'application/pdf',
    fileSize: 0,
    storageUrl: invoice.pdfUrl,
    storageKey: `rechnungen/${invoice.invoiceNumber}.pdf`,
    category: 'rechnung',
    description: `Automatisch archiviertes Rechnungs-PDF für ${invoice.invoiceNumber}`,
    uploadedBy: uploadedBy || 'System (Auto-Archiv)',
    invoiceId: invoice.id,
    projectId: invoice.projectId ?? undefined,
    companyId: invoice.companyId ?? undefined,
  });
}

/**
 * Archiviert ein Garantie-Zertifikat
 */
export async function archiveWarrantyCertificate(warranty: {
  id: number;
  warrantyNumber: string;
  projectId?: number | null;
  companyId?: number | null;
  orderId?: number | null;
  certificateUrl: string;
}, uploadedBy?: string): Promise<void> {
  await autoArchive({
    name: `Garantie ${warranty.warrantyNumber}.pdf`,
    originalName: `${warranty.warrantyNumber}.pdf`,
    mimeType: 'application/pdf',
    fileSize: 0,
    storageUrl: warranty.certificateUrl,
    storageKey: `garantien/${warranty.warrantyNumber}.pdf`,
    category: 'garantie',
    description: `Automatisch archiviertes Garantie-Zertifikat für ${warranty.warrantyNumber}`,
    uploadedBy: uploadedBy || 'System (Auto-Archiv)',
    warrantyId: warranty.id,
    projectId: warranty.projectId ?? undefined,
    companyId: warranty.companyId ?? undefined,
    orderId: warranty.orderId ?? undefined,
  });
}

/**
 * Archiviert ein hochgeladenes Foto
 */
export async function archivePhoto(photo: {
  url: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  context: string;
  propertyId?: number | null;
  constructionSiteId?: number | null;
  projectId?: number | null;
  description?: string | null;
}, uploadedBy?: string): Promise<void> {
  const contextLabels: Record<string, string> = {
    objektaufnahme: 'Objektaufnahme',
    baustelle: 'Baustelle',
    abnahme: 'Abnahme',
    schaden: 'Schadensdokumentation',
    allgemein: 'Allgemein',
  };
  const contextLabel = contextLabels[photo.context] || photo.context;
  
  await autoArchive({
    name: `${contextLabel}: ${photo.filename}`,
    originalName: photo.originalFilename,
    mimeType: photo.mimeType,
    fileSize: photo.fileSize,
    storageUrl: photo.url,
    storageKey: `fotos/${photo.context}/${photo.filename}`,
    category: 'foto',
    description: photo.description || `${contextLabel}-Foto`,
    uploadedBy: uploadedBy || 'System (Auto-Archiv)',
    propertyId: photo.propertyId ?? undefined,
    constructionSiteId: photo.constructionSiteId ?? undefined,
    projectId: photo.projectId ?? undefined,
  });
}

/**
 * Archiviert eine Mahnung
 */
/**
 * Archiviert einen Bautagebuch-Eintrag (Tagesbericht)
 */
export async function archiveBautagebuchEntry(logEntry: {
  id: number;
  constructionSiteId: number;
  logType: string;
  entry: string;
  photos?: string[] | null;
  userName?: string | null;
  projectId?: number | null;
  loggedAt: Date | string;
}, uploadedBy?: string): Promise<void> {
  const logTypeLabels: Record<string, string> = {
    arbeitsbeginn: 'Arbeitsbeginn',
    fortschritt: 'Fortschritt',
    pause: 'Pause',
    problem: 'Problem',
    material: 'Material',
    arbeitsende: 'Arbeitsende',
    wetter: 'Wetter',
    sicherheit: 'Sicherheit',
    kundenkontakt: 'Kundenkontakt',
    geraeteausfall: 'Geräteausfall',
    sonstiges: 'Sonstiges',
  };
  const typeLabel = logTypeLabels[logEntry.logType] || logEntry.logType;
  const dateStr = logEntry.loggedAt instanceof Date 
    ? logEntry.loggedAt.toISOString().split('T')[0] 
    : new Date(logEntry.loggedAt).toISOString().split('T')[0];
  
  await autoArchive({
    name: `Bautagebuch: ${typeLabel} – ${dateStr}`,
    originalName: `bautagebuch_${logEntry.constructionSiteId}_${dateStr}_${logEntry.logType}.txt`,
    mimeType: 'text/plain',
    fileSize: new TextEncoder().encode(logEntry.entry).length,
    storageUrl: '', // Bautagebuch-Einträge sind DB-basiert, kein S3-File
    storageKey: `bautagebuch/${logEntry.constructionSiteId}/${dateStr}_${logEntry.logType}_${logEntry.id}`,
    category: 'protokoll',
    description: `${typeLabel}-Eintrag von ${logEntry.userName || 'Unbekannt'}: ${logEntry.entry.substring(0, 200)}`,
    uploadedBy: uploadedBy || logEntry.userName || 'System (Auto-Archiv)',
    constructionSiteId: logEntry.constructionSiteId,
    projectId: logEntry.projectId ?? undefined,
  });

  // Wenn der Eintrag Fotos enthält, archiviere diese separat
  if (logEntry.photos && logEntry.photos.length > 0) {
    for (const photoUrl of logEntry.photos) {
      const photoFilename = photoUrl.split('/').pop() || `bautagebuch_foto_${logEntry.id}.jpg`;
      await autoArchive({
        name: `Bautagebuch-Foto: ${typeLabel} – ${dateStr}`,
        originalName: photoFilename,
        mimeType: 'image/jpeg',
        fileSize: 0,
        storageUrl: photoUrl,
        storageKey: `bautagebuch/fotos/${logEntry.constructionSiteId}/${photoFilename}`,
        category: 'foto',
        description: `Foto zum ${typeLabel}-Eintrag vom ${dateStr}`,
        uploadedBy: uploadedBy || logEntry.userName || 'System (Auto-Archiv)',
        constructionSiteId: logEntry.constructionSiteId,
        projectId: logEntry.projectId ?? undefined,
      });
    }
  }
}

export async function archiveDunning(dunning: {
  invoiceId: number;
  invoiceNumber: string;
  level: number;
  projectId?: number | null;
  companyId?: number | null;
}, uploadedBy?: string): Promise<void> {
  const levelLabels: Record<number, string> = {
    1: 'Zahlungserinnerung',
    2: '1. Mahnung',
    3: '2. Mahnung',
    4: 'Letzte Mahnung',
  };
  const label = levelLabels[dunning.level] || `Mahnung Stufe ${dunning.level}`;
  
  await autoArchive({
    name: `${label} - ${dunning.invoiceNumber}`,
    originalName: `mahnung_${dunning.invoiceNumber}_stufe${dunning.level}.pdf`,
    mimeType: 'application/pdf',
    fileSize: 0,
    storageUrl: '', // Wird ggf. später mit tatsächlicher PDF-URL ergänzt
    storageKey: `mahnungen/${dunning.invoiceNumber}_stufe${dunning.level}`,
    category: 'sonstiges', // Mahnungen als sonstiges, da kein eigener Typ
    description: `${label} für Rechnung ${dunning.invoiceNumber}`,
    uploadedBy: uploadedBy || 'System (Auto-Archiv)',
    invoiceId: dunning.invoiceId,
    projectId: dunning.projectId ?? undefined,
    companyId: dunning.companyId ?? undefined,
  });
}
