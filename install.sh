#!/usr/bin/env bash
# =====================================================
# FaFi - Installationsskript
# FassadenFix Multi-Agent Orchestration Hub
# =====================================================
#
# Verwendung:
#   curl -fsSL <URL>/install.sh | bash
#   oder:
#   bash install.sh
#
# Optionen (Umgebungsvariablen):
#   FAFI_DIR        - Installationsverzeichnis (Standard: ./FaFi)
#   FAFI_VENV       - Name des Virtual Environments (Standard: .venv)
#   FAFI_SKIP_VENV  - Virtual Environment überspringen (Standard: 0)
#   FAFI_BRANCH     - Git-Branch zum Klonen (Standard: main)
#
set -euo pipefail

# --- Farben & Formatierung ---
if [ -t 1 ] && command -v tput &>/dev/null; then
    GREEN=$(tput setaf 2)
    YELLOW=$(tput setaf 3)
    RED=$(tput setaf 1)
    CYAN=$(tput setaf 6)
    BOLD=$(tput bold)
    RESET=$(tput sgr0)
else
    GREEN="" YELLOW="" RED="" CYAN="" BOLD="" RESET=""
fi

info()  { echo "${CYAN}[INFO]${RESET}  $*"; }
ok()    { echo "${GREEN}[OK]${RESET}    $*"; }
warn()  { echo "${YELLOW}[WARN]${RESET}  $*"; }
error() { echo "${RED}[FEHLER]${RESET} $*" >&2; }
die()   { error "$@"; exit 1; }

# --- Konfiguration ---
FAFI_REPO="${FAFI_REPO:-https://github.com/FassadenFix/FaFi.git}"
FAFI_DIR="${FAFI_DIR:-FaFi}"
FAFI_VENV="${FAFI_VENV:-.venv}"
FAFI_SKIP_VENV="${FAFI_SKIP_VENV:-0}"
FAFI_BRANCH="${FAFI_BRANCH:-main}"
MIN_PYTHON_MAJOR=3
MIN_PYTHON_MINOR=8

# --- Banner ---
echo ""
echo "${BOLD}${GREEN}"
echo "  ___       ___ _ "
echo " | __|__ _ | __|(_)"
echo " | _|/ _\` || _| | |"
echo " |_| \\__,_||_|  |_|"
echo "${RESET}"
echo "  ${BOLD}FassadenFix Multi-Agent Hub${RESET}"
echo "  Installationsskript v1.0"
echo ""

# --- Voraussetzungen pruefen ---
info "Pruefe Voraussetzungen..."

# Git
if ! command -v git &>/dev/null; then
    die "Git ist nicht installiert. Bitte installieren: https://git-scm.com"
fi
ok "Git gefunden: $(git --version)"

# Python 3
PYTHON_CMD=""
for cmd in python3 python; do
    if command -v "$cmd" &>/dev/null; then
        # Pruefe ob es Python 3 ist
        if "$cmd" -c "import sys; sys.exit(0 if sys.version_info[0] == 3 else 1)" 2>/dev/null; then
            PYTHON_CMD="$cmd"
            break
        fi
    fi
done

if [ -z "$PYTHON_CMD" ]; then
    die "Python 3 ist nicht installiert. Bitte installieren: https://www.python.org/downloads/"
fi

# Pruefe Mindestversion
PYTHON_VERSION=$("$PYTHON_CMD" -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')")
PYTHON_MINOR=$("$PYTHON_CMD" -c "import sys; print(sys.version_info.minor)")

if [ "$PYTHON_MINOR" -lt "$MIN_PYTHON_MINOR" ]; then
    die "Python >= ${MIN_PYTHON_MAJOR}.${MIN_PYTHON_MINOR} erforderlich (gefunden: ${PYTHON_VERSION})"
fi
ok "Python gefunden: ${PYTHON_VERSION}"

# pip
if ! "$PYTHON_CMD" -m pip --version &>/dev/null; then
    warn "pip nicht gefunden. Versuche Installation..."
    "$PYTHON_CMD" -m ensurepip --upgrade 2>/dev/null || \
        die "pip konnte nicht installiert werden. Bitte manuell installieren."
fi
ok "pip gefunden: $("$PYTHON_CMD" -m pip --version 2>/dev/null | cut -d' ' -f1-2)"

# --- Repository klonen oder vorhandenes verwenden ---
if [ -d "$FAFI_DIR" ]; then
    if [ -d "$FAFI_DIR/.git" ]; then
        info "Vorhandenes Repository gefunden in ${BOLD}${FAFI_DIR}${RESET}"
        info "Aktualisiere Repository..."
        git -C "$FAFI_DIR" pull origin "$FAFI_BRANCH" --ff-only 2>/dev/null || \
            warn "Pull fehlgeschlagen - verwende vorhandene Version"
        ok "Repository aktualisiert"
    else
        die "Verzeichnis '${FAFI_DIR}' existiert bereits, ist aber kein Git-Repository"
    fi
else
    info "Klone FaFi-Repository..."
    git clone --branch "$FAFI_BRANCH" "$FAFI_REPO" "$FAFI_DIR" 2>/dev/null || \
        git clone "$FAFI_REPO" "$FAFI_DIR"
    ok "Repository geklont nach ${BOLD}${FAFI_DIR}${RESET}"
fi

cd "$FAFI_DIR"

# --- Virtual Environment ---
if [ "$FAFI_SKIP_VENV" != "1" ]; then
    if [ ! -d "$FAFI_VENV" ]; then
        info "Erstelle Virtual Environment..."
        "$PYTHON_CMD" -m venv "$FAFI_VENV" || die "Virtual Environment konnte nicht erstellt werden"
        ok "Virtual Environment erstellt: ${FAFI_VENV}"
    else
        ok "Virtual Environment existiert bereits: ${FAFI_VENV}"
    fi

    # Aktivieren
    # shellcheck disable=SC1091
    source "${FAFI_VENV}/bin/activate"
    ok "Virtual Environment aktiviert"
    PYTHON_CMD="python"
else
    warn "Virtual Environment uebersprungen (FAFI_SKIP_VENV=1)"
fi

# --- Abhaengigkeiten installieren ---
info "Installiere Python-Abhaengigkeiten..."
"$PYTHON_CMD" -m pip install --upgrade pip --quiet 2>/dev/null
"$PYTHON_CMD" -m pip install -r requirements.txt --quiet || \
    die "Abhaengigkeiten konnten nicht installiert werden"
ok "Alle Abhaengigkeiten installiert"

# --- Umgebungsvariablen-Template ---
if [ -f "connectors/.env.template" ] && [ ! -f "connectors/.env" ]; then
    cp connectors/.env.template connectors/.env
    ok "Umgebungsvariablen-Template kopiert nach connectors/.env"
    warn "Bitte API-Keys in connectors/.env eintragen"
fi

# --- Schnelltest ---
info "Fuehre Schnelltest durch..."
if "$PYTHON_CMD" -c "import flask, requests, bs4; print('OK')" &>/dev/null; then
    ok "Kern-Abhaengigkeiten erfolgreich geladen"
else
    warn "Einige Abhaengigkeiten konnten nicht geladen werden"
fi

# --- Fertig ---
echo ""
echo "${BOLD}${GREEN}======================================${RESET}"
echo "${BOLD}${GREEN}  FaFi wurde erfolgreich installiert!${RESET}"
echo "${BOLD}${GREEN}======================================${RESET}"
echo ""
echo "  ${BOLD}Naechste Schritte:${RESET}"
echo ""
echo "  1. In das Verzeichnis wechseln:"
echo "     ${CYAN}cd ${FAFI_DIR}${RESET}"
echo ""
if [ "$FAFI_SKIP_VENV" != "1" ]; then
echo "  2. Virtual Environment aktivieren:"
echo "     ${CYAN}source ${FAFI_VENV}/bin/activate${RESET}"
echo ""
echo "  3. API-Keys konfigurieren (optional):"
echo "     ${CYAN}\$EDITOR connectors/.env${RESET}"
echo ""
echo "  4. API-Server starten:"
echo "     ${CYAN}python adapters/api_server.py${RESET}"
echo ""
echo "  5. Tests ausfuehren:"
echo "     ${CYAN}python test_api_server.py${RESET}"
else
echo "  2. API-Keys konfigurieren (optional):"
echo "     ${CYAN}\$EDITOR connectors/.env${RESET}"
echo ""
echo "  3. API-Server starten:"
echo "     ${CYAN}${PYTHON_CMD} adapters/api_server.py${RESET}"
echo ""
echo "  4. Tests ausfuehren:"
echo "     ${CYAN}${PYTHON_CMD} test_api_server.py${RESET}"
fi
echo ""
