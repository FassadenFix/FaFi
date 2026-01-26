// ============================================
// ROUTER (Platzhalter - Phase 2)
// ============================================

function navigateTo(step) {
    console.log('[Router] Navigate to:', step);
    updateState('ui.currentStep', step);
}
