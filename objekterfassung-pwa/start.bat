@echo off
REM Quick Start Script für FassadenFix PWA (Windows)

echo ========================================
echo FassadenFix Objekterfassung PWA - Lokaler Server
echo ========================================
echo.
echo Server startet auf: http://localhost:8888
echo.
echo Öffne einen der folgenden Browser:
echo   Chrome:  http://localhost:8888
echo   Firefox: http://localhost:8888
echo   Edge:    http://localhost:8888
echo.
echo Zum Beenden: Ctrl+C
echo.

REM Python 3 HTTP Server starten
python -m http.server 8888
