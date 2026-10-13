# -*- coding: utf-8 -*-
"""T+2: satış tutarı iki iş günü sonunda KENDİLİĞİNDEN çekilebilir nakde geçmelidir.

Hiçbir bakiye yalnızca yöneticinin elle onayına bağlı olarak süresiz bekletilemez;
bu test o davranışın geri gelmesini engeller."""
import io, os, sys, tempfile
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
os.environ["DATABASE_PATH"] = os.path.join(tempfile.mkdtemp(), "t2.db")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import backend_server as b

hata = 0
def bekle(ad, kosul, ek=""):
    global hata
    print(("TAMAM " if kosul else "SORUN ") + ad + ((" — " + str(ek)) if ek else ""))
    if not kosul: hata += 1

b.init_db()
conn = b.connect_db()
b.seed_test_user(conn)
uid = conn.execute("SELECT id FROM users WHERE role!='admin' ORDER BY id LIMIT 1").fetchone()["id"]
conn.execute("INSERT OR REPLACE INTO system_settings (setting_key, setting_value, updated_at) VALUES ('t2_enabled','1',?)", (b.now(),))
conn.commit()

cash0 = float(b.account_for(conn, uid)["cash_balance"])
b.credit_sale_proceeds(conn, uid, 1, "ASELS", "Aselsan", 1000.0, 10, 100.0, "test satış")
conn.commit()
a = b.account_for(conn, uid)
bekle("satış tutarı T+2'ye (bekleyen bakiyeye) yazıldı", abs(float(a["pending_balance"]) - 1000.0) < 0.01, a["pending_balance"])
bekle("nakit henüz değişmedi", abs(float(a["cash_balance"]) - cash0) < 0.01)

b.settle_due_t2(conn)
a = b.account_for(conn, uid)
bekle("vadesi gelmeden çözülmedi", abs(float(a["pending_balance"]) - 1000.0) < 0.01)

conn.execute("UPDATE t2_settlements SET settlement_date=? WHERE user_id=?", (b.now() - 10, uid))
conn.commit()
b.settle_due_t2(conn)
a = b.account_for(conn, uid)
bekle("vadesi gelince KENDİLİĞİNDEN nakde geçti", abs(float(a["cash_balance"]) - (cash0 + 1000.0)) < 0.01 and float(a["pending_balance"]) < 0.01,
      f"nakit={a['cash_balance']} bekleyen={a['pending_balance']}")

conn.execute("UPDATE system_settings SET setting_value='0' WHERE setting_key='t2_enabled'")
conn.commit()
c1 = float(b.account_for(conn, uid)["cash_balance"])
b.credit_sale_proceeds(conn, uid, 2, "ASELS", "Aselsan", 500.0, 5, 100.0, "test satış 2")
conn.commit()
bekle("T+2 kapalıyken satış anında nakde geçti", abs(float(b.account_for(conn, uid)["cash_balance"]) - (c1 + 500.0)) < 0.01)

print("SONUC: " + ("TAMAM" if hata == 0 else f"SORUN {hata}"))
sys.exit(1 if hata else 0)
