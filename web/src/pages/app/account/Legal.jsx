import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'

const DOCS = [
  {
    title: 'Platform Kullanım Şartları',
    body: 'Mukatabak; hisse senedi takibi, sanal portföy yönetimi ve piyasa haberlerini bir arada sunan demo/eğitim amaçlı bir platformdur. Lisanslı bir aracı kurum, banka veya yatırım kuruluşu değildir. Platformda gösterilen bakiyeler, işlemler ve piyasa hareketleri gerçek para transferi içermeyen bir simülasyondur.',
  },
  {
    title: 'KVKK Aydınlatma Metni',
    body: 'Kayıt sırasında paylaştığın ad, e-posta ve şifre bilgileri yalnızca hesabını oluşturmak ve platform içi deneyimini sağlamak amacıyla işlenir. Bilgilerin üçüncü taraflarla paylaşılmaz, pazarlama amacıyla kullanılmaz. Hesabının silinmesini istediğinde destek@mukatabak.app adresinden talepte bulunabilirsin.',
  },
  {
    title: 'Risk Bildirim Formu',
    body: 'Bu platformda gösterilen fiyat hareketleri ve getiriler simülasyon amaçlıdır; gerçek yatırım kararı vermek için kullanılmamalıdır. Gerçek sermaye piyasası işlemleri risk içerir ve gerçek yatırım kararları için Sermaye Piyasası Kurulu (SPK) lisanslı bir aracı kurumla görüşülmesi önerilir.',
  },
  {
    title: 'Çerçeve Sözleşme (Demo)',
    body: 'Mukatabak demo hesabı kullanarak, bu platformun sanal bir portföy simülasyonu olduğunu, gerçek para transferi veya menkul kıymet mülkiyeti doğurmadığını kabul etmiş olursun.',
  },
]

export default function Legal() {
  const navigate = useNavigate()

  return (
    <div style={{ paddingTop: 8 }}>
      <button onClick={() => navigate('/app/hesap')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--brand-blue)', fontWeight: 600, fontSize: 13.5, marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={16} /> Hesap
      </button>
      <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Güvenlik Politikası ve Sözleşmeler</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {DOCS.map(d => (
          <div key={d.title} className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <FileText size={16} color="var(--brand-blue)" />
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{d.title}</div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>{d.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
