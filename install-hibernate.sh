#!/bin/bash
# Allow hibernating without authentication.

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

sudo install --verbose --backup -D -m 644 \
    etc/polkit-1/rules.d/10-enable-hibernate.rules /etc/polkit-1/rules.d/10-enable-hibernate.rules
