import { useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useTradeModal } from '../../context/TradeModalContext.jsx'

// Dogrudan /app/al-sat veya /app/al-sat/:symbol linklerini acan eski rotalar
// artik APK'daki gibi alt-sayfa (bottom-sheet) modalini acar.
export default function TradeRoute() {
  const { symbol } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { openTrade } = useTradeModal()

  useEffect(() => {
    openTrade(symbol || null, location.state?.side || 'buy')
    navigate('/app', { replace: true })
  }, []) // eslint-disable-line

  return null
}
