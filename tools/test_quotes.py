"""Yalnızca testler için örnek fiyatlar.

Canlıda KULLANILMAZ: backend_server.py bunu yalnızca MUKATABAK_TEST_QUOTES=1
verildiğinde (tools/tumunu_dogrula.sh bunu kendisi verir) yükler. Böylece canlı
borsa kaynağına erişemeyen ortamlarda da testler çalışır, üretimde ise ekranda
yalnızca kaynaktan gelmiş veri görünür.
"""

TEST_QUOTES = [
    ("XU100", "BIST 100", 11048.12, 0.72, 0, "index"),
    ("XU030", "BIST 30", 12204.48, 0.68, 0, "index"),
    ("XBANK", "BIST Banka", 15782.35, 1.18, 0, "index"),
    ("USDTRY", "Amerikan Doları", 48.81, 0.0, 0, "fx"),
    ("EURTRY", "Euro", 56.07, 0.0, 0, "fx"),
    ("GBPTRY", "İngiliz Sterlini", 65.22, 0.0, 0, "fx"),
    ("XAUTRY", "Gram Altın", 4424.18, 0.44, 0, "commodity"),
    ("XAGTRY", "Gram Gümüş", 52.31, -0.22, 0, "commodity"),
    ("BRENT", "Brent Petrol", 80.24, -0.36, 0, "commodity"),
    ("BTCUSD", "Bitcoin", 114250.0, 1.74, 0, "crypto"),
    ("AKBNK", "Akbank T.A.S.", 67.65, -0.51, 88400000),
    ("ARCLK", "Arcelik A.S.", 142.40, 0.64, 11700000),
    ("ASELS", "Aselsan Elektronik Sanayi ve Ticaret A.S.", 381.25, -1.99, 24100000),
    ("ASTOR", "Astor Enerji A.S.", 102.60, 2.18, 36500000),
    ("BRSAN", "Borusan Mannesmann", 480.25, 1.16, 1800000),
    ("BIMAS", "BIM Birlesik Magazalar A.S.", 405.00, 6.02, 19200000),
    ("DOAS", "Dogus Otomotiv", 214.80, -0.42, 4100000),
    ("EKGYO", "Emlak Konut GYO", 16.26, 1.54, 220000000),
    ("ENKAI", "Enka Insaat", 65.20, 0.37, 29400000),
    ("EREGL", "Eregli Demir Celik", 27.88, -0.71, 196000000),
    ("FROTO", "Ford Otosan", 1036.00, 0.86, 2200000),
    ("GARAN", "Garanti BBVA", 134.70, 1.11, 98200000),
    ("GUBRF", "Gubre Fabrikalari", 274.50, -1.04, 6200000),
    ("HALKB", "Halkbank", 23.76, 0.51, 128000000),
    ("ISCTR", "Turkiye Is Bankasi A.S. C", 12.38, -0.16, 356000000),
    ("KCHOL", "Koc Holding A.S.", 189.20, 0.73, 31500000),
    ("KRDMD", "Kardemir D", 27.34, -0.88, 156000000),
    ("MGROS", "Migros Ticaret", 545.50, 1.92, 2700000),
    ("PETKM", "Petkim", 21.28, -0.36, 186000000),
    ("PGSUS", "Pegasus Hava Tasimaciligi A.S.", 149.30, -1.26, 13800000),
    ("SAHOL", "Sabanci Holding", 101.40, 0.95, 54200000),
    ("SASA", "Sasa Polyester Sanayi A.S.", 2.25, -3.85, 2900000000),
    ("SISE", "Turkiye Sise ve Cam Fabrikalari", 49.16, -0.28, 70200000),
    ("TCELL", "Turkcell", 97.35, 0.48, 27500000),
    ("THYAO", "Turk Hava Yollari A.O.", 300.50, -0.17, 78300000),
    ("TOASO", "Tofas Turk Otomobil", 224.90, 0.32, 3400000),
    ("TSKB", "Turkiye Sinai Kalkinma Bankasi", 13.72, 2.46, 284000000),
    ("TUPRS", "Tupras", 169.80, -0.64, 61200000),
    ("VAKBN", "Vakifbank", 25.18, 0.88, 178000000),
    ("YKBNK", "Yapi Kredi Bankasi", 31.64, 1.38, 342000000),
    ("ALARK", "Alarko Holding A.S.", 107.00, 3.08, 5300000),
]
