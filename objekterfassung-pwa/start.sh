#!/bin/bash
# Quick Start Script für FassadenFix PWA (Lokale Entwicklung)

echo "🚀 FassadenFix Objekterfassung PWA - Lokaler Server"
echo "=================================================="
echo ""
echo "Server startet auf: http://localhost:8888"
echo ""
echo "Öffne einen der folgenden Browser:"
echo "  Chrome:  http://localhost:8888"
echo "  Firefox: http://localhost:8888"
echo "  Safari:  http://localhost:8888"
echo ""
echo "Zum Beenden: Ctrl+C"
echo ""

# Python 3 HTTP Server starten
python3 -m http.server 8888
