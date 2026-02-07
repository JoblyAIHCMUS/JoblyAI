#!/usr/bin/env bash
set -euo pipefail

DOMAIN="joblyAI-local.com"
HOSTS_FILE="/etc/hosts"
ENTRY="127.0.0.1 ${DOMAIN}"

if ! grep -qE "^[[:space:]]*127\.0\.0\.1[[:space:]]+${DOMAIN}(\s|$)" "$HOSTS_FILE"; then
	echo "Adding ${DOMAIN} to ${HOSTS_FILE} (requires sudo)..."
	echo "$ENTRY" | sudo tee -a "$HOSTS_FILE" >/dev/null
else
	echo "${DOMAIN} already present in ${HOSTS_FILE}."
fi

echo "Flushing DNS cache..."
sudo dscacheutil -flushcache || true
sudo killall -HUP mDNSResponder || true

echo "Local domain ready: http://${DOMAIN}:5173"
