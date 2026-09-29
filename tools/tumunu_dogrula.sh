#!/usr/bin/env bash
# Butun dogrulamalari tek komutta calistirir.
#   bash tools/tumunu_dogrula.sh
# Cikis kodu: herhangi bir adim basarisizsa 1.
set -u
KOK="$(cd "$(dirname "$0")/.." && pwd)"
cd "$KOK"
PORT="${PORT:-8099}"
VERI="${DATA_DIR:-/tmp/mk-dogrulama}"
SIFRE="${ADMIN_PASSWORD:-Admin12345}"
hata=0
baslik() { printf '\n==== %s ====\n' "$1"; }

baslik "1/5  Python derlemesi"
python3 -m py_compile tools/backend_server.py && echo "TAMAM derleme" || { echo "SORUN derleme"; hata=1; }

baslik "2/5  Arayuz derlemesi"
npx vite build >/tmp/mk-build.log 2>&1 && echo "TAMAM vite build" || { echo "SORUN vite build"; tail -20 /tmp/mk-build.log; hata=1; }

baslik "3/5  Backend test paketleri"
( cd tools && rm -f test_*.db
  for t in admin_api_test.py market_admin_test.py admin_delete_test.py money_flow_test.py document_flow_test.py order_price_test.py test_news_feed.py; do
    printf '%-24s ' "$t"
    if timeout 300 python3 "$t" >/tmp/mk-$t.log 2>&1; then tail -1 /tmp/mk-$t.log; else echo "SORUN"; tail -3 /tmp/mk-$t.log; fi
  done
  rm -f test_*.db ) || hata=1

baslik "3b/5  Arayuz birim testleri"
node tools/market_hours_test.mjs | tail -1 || hata=1

baslik "4/5  Ornek veri + sunucu"
rm -rf "$VERI"
DATA_DIR="$VERI" PORT="$PORT" ADMIN_PASSWORD="$SIFRE" REQUIRE_LIVE_MARKET_FOR_TRADING=0 \
  python3 tools/backend_server.py >/tmp/mk-be.log 2>&1 &
BE=$!
for i in $(seq 1 60); do curl -sf "http://127.0.0.1:$PORT/api/health" >/dev/null && break; sleep 0.5; done
KOK="http://127.0.0.1:$PORT" ADMIN_PASSWORD="$SIFRE" python3 tools/seed_demo.py >/tmp/mk-seed.log 2>&1 \
  && echo "TAMAM ornek veri" || { echo "SORUN ornek veri"; tail -5 /tmp/mk-seed.log; hata=1; }

baslik "5/5  Tarayici denetimleri"
node tools/verify_esube.mjs "http://127.0.0.1:$PORT" || hata=1
node tools/verify_admin.mjs "http://127.0.0.1:$PORT" || hata=1

kill $BE 2>/dev/null
wait $BE 2>/dev/null

printf '\n==== SONUC: %s ====\n' "$([ $hata -eq 0 ] && echo TAMAM || echo SORUN)"
exit $hata
