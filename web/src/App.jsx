import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'

import SiteLayout from './layouts/SiteLayout.jsx'
import AppLayout from './layouts/AppLayout.jsx'
import AdminLayout from './layouts/AdminLayout.jsx'

import Landing from './pages/public/Landing.jsx'
import About from './pages/public/About.jsx'
import Blog from './pages/public/Blog.jsx'
import BlogPost from './pages/public/BlogPost.jsx'
import FAQ from './pages/public/FAQ.jsx'
import Login from './pages/public/Login.jsx'
import Register from './pages/public/Register.jsx'
import Contact from './pages/public/Contact.jsx'

import Home from './pages/app/Home.jsx'
import Stocks from './pages/app/Stocks.jsx'
import StockDetail from './pages/app/StockDetail.jsx'
import News from './pages/app/News.jsx'
import TradeRoute from './pages/app/TradeRoute.jsx'
import Portfolio from './pages/app/Portfolio.jsx'
import Account from './pages/app/Account.jsx'
import PersonalInfo from './pages/app/account/PersonalInfo.jsx'
import Security from './pages/app/account/Security.jsx'
import Notifications from './pages/app/account/Notifications.jsx'
import Wallet from './pages/app/account/Wallet.jsx'
import Settings from './pages/app/account/Settings.jsx'
import Legal from './pages/app/account/Legal.jsx'

import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminBlog from './pages/admin/AdminBlog.jsx'
import AdminFaq from './pages/admin/AdminFaq.jsx'

function Splash() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg-app)' }}>
      <img src="/brand/appicon.png" alt="" width={64} height={64} style={{ borderRadius: 16 }} />
    </div>
  )
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  if (!user) return <Navigate to="/giris" replace />
  return children
}

function RequireAdmin({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  if (!user || user.role !== 'admin') return <Navigate to="/giris" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/kurumsal" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/sss" element={<FAQ />} />
        <Route path="/iletisim" element={<Contact />} />
        <Route path="/giris" element={<Login />} />
        <Route path="/kayit" element={<Register />} />
      </Route>

      <Route path="/app" element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route index element={<Home />} />
        <Route path="hisseler" element={<Stocks />} />
        <Route path="hisse/:symbol" element={<StockDetail />} />
        <Route path="haberler" element={<News />} />
        <Route path="al-sat" element={<TradeRoute />} />
        <Route path="al-sat/:symbol" element={<TradeRoute />} />
        <Route path="portfoy" element={<Portfolio />} />
        <Route path="hesap" element={<Account />} />
        <Route path="hesap/kisisel" element={<PersonalInfo />} />
        <Route path="hesap/guvenlik" element={<Security />} />
        <Route path="hesap/bildirimler" element={<Notifications />} />
        <Route path="hesap/bakiye" element={<Wallet />} />
        <Route path="hesap/ayarlar" element={<Settings />} />
        <Route path="hesap/sozlesmeler" element={<Legal />} />
      </Route>

      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index element={<AdminDashboard />} />
        <Route path="kullanicilar" element={<AdminUsers />} />
        <Route path="blog" element={<AdminBlog />} />
        <Route path="sss" element={<AdminFaq />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
