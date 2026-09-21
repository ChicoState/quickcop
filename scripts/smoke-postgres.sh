#!/usr/bin/env bash
set -euo pipefail

cleanup() { docker compose down --volumes --remove-orphans >/dev/null 2>&1 || true; }
trap cleanup EXIT

docker compose up -d postgres
for _ in $(seq 1 24); do
  if docker compose exec -T postgres pg_isready -U quickcop_dev -d quickcop_dev >/dev/null; then
    docker compose exec -T postgres psql -U quickcop_dev -d quickcop_dev -tAc 'SELECT 1' | grep -qx '1'
    exit 0
  fi
  sleep 2
done

echo 'PostgreSQL did not become ready.' >&2
exit 1
