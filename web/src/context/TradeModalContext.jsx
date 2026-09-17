import { createContext, useContext, useState, useCallback } from 'react'

const TradeModalContext = createContext(null)

export function TradeModalProvider({ children }) {
  const [state, setState] = useState({ open: false, symbol: null, side: 'buy' })

  const openTrade = useCallback((symbol = null, side = 'buy') => {
    setState({ open: true, symbol, side })
  }, [])
  const closeTrade = useCallback(() => setState(s => ({ ...s, open: false })), [])

  return (
    <TradeModalContext.Provider value={{ ...state, openTrade, closeTrade }}>
      {children}
    </TradeModalContext.Provider>
  )
}

export function useTradeModal() {
  return useContext(TradeModalContext)
}
