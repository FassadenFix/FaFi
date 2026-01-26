// ============================================
// EXPORT (Platzhalter - Phase 4)
// ============================================

async function exportAsJSON() {
    console.log('[Export] Wird in Phase 4 implementiert');
    const data = await storageManager.exportAllData();
    console.log('Export-Daten:', data);
    return data;
}
