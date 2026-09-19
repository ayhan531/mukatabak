"""Geriye dönük uyumluluk: eski start komutu (python backend/server.py) çalışsın diye
gerçek sunucuyu tools/backend_server.py üzerinden başlatır."""
import runpy
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
runpy.run_path(str(ROOT / "tools" / "backend_server.py"), run_name="__main__")
