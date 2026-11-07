// GENERATED from the architecture plan — do not edit by hand.
// The complete route table, derived from the plan. Rendered by the App.tsx shell
// inside the provider tree. Re-derived every attempt — never edit by hand.

import { Routes, Route, Outlet } from 'react-router-dom'
import { SiteLayout } from '@/shell'
import AdminLayout from '@/components/AdminLayout'
import { siteConfig } from '@/config/siteConfig'

import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import CateringPage from './pages/CateringPage';
import CheckoutPage from './pages/CheckoutPage';
import ContactPage from './pages/ContactPage';
import GalleryPage from './pages/GalleryPage';
import LoginPage from './pages/LoginPage';
import MenuPage from './pages/MenuPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ReservationPage from './pages/ReservationPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCateringPage from './pages/AdminCateringPage';
import AdminGalleryPage from './pages/AdminGalleryPage';
import AdminLocationsPage from './pages/AdminLocationsPage';
import AdminMenuPage from './pages/AdminMenuPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminReservationsPage from './pages/AdminReservationsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/catering" element={<AdminCateringPage />} />
        <Route path="/admin/gallery" element={<AdminGalleryPage />} />
        <Route path="/admin/locations" element={<AdminLocationsPage />} />
        <Route path="/admin/menu" element={<AdminMenuPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />
        <Route path="/admin/reservations" element={<AdminReservationsPage />} />
      </Route>
      <Route element={<SiteLayout config={siteConfig}><Outlet /></SiteLayout>}>
        {/* Outlet receives the matched child route */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/catering" element={<CateringPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/order-history" element={<OrderHistoryPage />} />
        <Route path="/reservation" element={<ReservationPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
