import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { SiteLayout } from '@/shell'
import siteConfig from '@/config/siteConfig'
import AdminLayout from '@/components/AdminLayout'
import RequireAuth from '@/components/RequireAuth'
import RequireAdmin from '@/components/RequireAdmin'
import RequireBoardAccess from '@/components/RequireBoardAccess'
import LoyaltyAdminLayout from '@/components/admin/LoyaltyAdminLayout'
import { RestaurantJsonLd } from '@/site/seo'

import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import CartPage from '@/pages/CartPage'
import CheckoutPage from '@/pages/CheckoutPage'
import GalleryPage from '@/pages/GalleryPage'
import ProductsPage from '@/pages/ProductsPage'
import ProductDetailPage from '@/pages/ProductDetailPage'
import EventsPage from '@/pages/EventsPage'
import EventDetailPage from '@/pages/EventDetailPage'
import OrdersPage from '@/pages/OrdersPage'
import OrderDetailPage from '@/pages/OrderDetailPage'
import BranchesPage from '@/pages/BranchesPage'
import SupportPage from '@/pages/SupportPage'
import AccountPage from '@/pages/AccountPage'
import LoyaltyTermsPage from '@/pages/LoyaltyTermsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import MenuPage from '@/pages/MenuPage'
import OrderPage from '@/pages/OrderPage'
import BookPage from '@/pages/BookPage'
import PartyPage from '@/pages/PartyPage'
import OfficeLunchPage from '@/pages/OfficeLunchPage'
import FeastCalendarPage from '@/pages/FeastCalendarPage'
import TrackPage from '@/pages/TrackPage'
import StoryPage from '@/pages/StoryPage'
import ReviewsPage from '@/pages/ReviewsPage'
import SuggestPage from '@/pages/SuggestPage'
import MePage from '@/pages/MePage'
import AreaPage from '@/pages/AreaPage'

import AdminMediaPage from '@/pages/admin/AdminMediaPage'
import AdminSupportPage from '@/pages/admin/AdminSupportPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminProductsPage from '@/pages/admin/AdminProductsPage'
import AdminEventsPage from '@/pages/admin/AdminEventsPage'
import AdminRecommendationsPage from '@/pages/admin/AdminRecommendationsPage'
import OrderBoardPage from '@/pages/admin/OrderBoardPage'
import AdminOrdersArchivePage from '@/pages/admin/AdminOrdersArchivePage'
import AdminWorkflowPage from '@/pages/admin/AdminWorkflowPage'
import AdminConnectorsPage from '@/pages/admin/AdminConnectorsPage'
import AdminBranchesPage from '@/pages/admin/AdminBranchesPage'
import AdminReviewsPage from '@/pages/admin/AdminReviewsPage'
import AdminFeedbackPage from '@/pages/admin/AdminFeedbackPage'
import AdminAnalyticsPage from '@/pages/admin/AdminAnalyticsPage'
import AdminLogsPage from '@/pages/admin/AdminLogsPage'
import LoyaltyOverviewPage from '@/pages/admin/loyalty/OverviewPage'
import LoyaltyCustomersPage from '@/pages/admin/loyalty/CustomersPage'
import LoyaltyCodesPage from '@/pages/admin/loyalty/CodesPage'
import LoyaltyTriggersPage from '@/pages/admin/loyalty/TriggersPage'
import LoyaltyTiersPage from '@/pages/admin/loyalty/TiersPage'
import LoyaltyScoringPage from '@/pages/admin/loyalty/ScoringPage'
import LoyaltySettingsPage from '@/pages/admin/loyalty/SettingsPage'
import AdminMenuPage from '@/pages/admin/AdminMenuPage'
import AdminKitchenPage from '@/pages/admin/AdminKitchenPage'
import AdminTablesPage from '@/pages/admin/AdminTablesPage'
import AdminDetailsPage from '@/pages/admin/AdminDetailsPage'
import AdminFeastDatesPage from '@/pages/admin/AdminFeastDatesPage'
import AdminSuggestionsPage from '@/pages/admin/AdminSuggestionsPage'
import { CHUL, FEAST, TABLE } from '@/site/api'

const admin = (el: React.ReactNode) => <RequireAdmin>{el}</RequireAdmin>

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<SiteLayout config={siteConfig}><RestaurantJsonLd /><Outlet /></SiteLayout>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/book" element={<RequireAuth><BookPage /></RequireAuth>} />
        <Route path="/party" element={<RequireAuth><PartyPage /></RequireAuth>} />
        <Route path="/office-lunch" element={<OfficeLunchPage />} />
        <Route path="/feast-calendar" element={<FeastCalendarPage />} />
        <Route path="/track/:id" element={<RequireAuth><TrackPage /></RequireAuth>} />
        <Route path="/story" element={<StoryPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/suggest" element={<SuggestPage />} />
        <Route path="/me" element={<RequireAuth><MePage /></RequireAuth>} />
        <Route path="/mutton-thali-baner" element={<AreaPage area="baner" />} />
        <Route path="/mutton-thali-balewadi" element={<AreaPage area="balewadi" />} />
        <Route path="/non-veg-restaurant-aundh" element={<AreaPage area="aundh" />} />
        <Route path="/maharashtrian-thali-pashan-sus-road" element={<AreaPage area="pashan" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/loyalty-terms" element={<LoyaltyTermsPage />} />
        <Route path="/support" element={<RequireAuth><SupportPage /></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
        <Route path="/orders/:id" element={<RequireAuth><OrderDetailPage /></RequireAuth>} />
        <Route path="/account" element={<RequireAuth><AccountPage /></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/admin" element={<RequireBoardAccess><AdminLayout /></RequireBoardAccess>}>
        <Route index element={<Navigate to="orders" replace />} />
        <Route path="orders" element={<OrderBoardPage />} />
        <Route path="order-archive" element={admin(<AdminOrdersArchivePage />)} />
        <Route path="kitchen" element={admin(<AdminKitchenPage />)} />
        <Route path="menu" element={admin(<AdminMenuPage />)} />
        <Route path="tables" element={admin(<AdminTablesPage />)} />
        <Route path="kitchen-orders" element={admin(<AdminDetailsPage workflow={CHUL} title="Kitchen orders" />)} />
        <Route path="bookings" element={admin(<AdminDetailsPage workflow={TABLE} title="Table bookings" />)} />
        <Route path="party" element={admin(<AdminDetailsPage workflow={FEAST} title="Party orders" />)} />
        <Route path="feast-dates" element={admin(<AdminFeastDatesPage />)} />
        <Route path="suggestions" element={admin(<AdminSuggestionsPage />)} />
        <Route path="media" element={admin(<AdminMediaPage />)} />
        <Route path="support" element={admin(<AdminSupportPage />)} />
        <Route path="users" element={admin(<AdminUsersPage />)} />
        <Route path="products" element={admin(<AdminProductsPage />)} />
        <Route path="events" element={admin(<AdminEventsPage />)} />
        <Route path="recommendations" element={admin(<AdminRecommendationsPage />)} />
        <Route path="workflow" element={admin(<AdminWorkflowPage />)} />
        <Route path="connectors" element={admin(<AdminConnectorsPage />)} />
        <Route path="branches" element={admin(<AdminBranchesPage />)} />
        <Route path="reviews" element={admin(<AdminReviewsPage />)} />
        <Route path="feedback" element={admin(<AdminFeedbackPage />)} />
        <Route path="loyalty" element={admin(<LoyaltyAdminLayout />)}>
          <Route index element={<LoyaltyOverviewPage />} />
          <Route path="customers" element={<LoyaltyCustomersPage />} />
          <Route path="codes" element={<LoyaltyCodesPage />} />
          <Route path="triggers" element={<LoyaltyTriggersPage />} />
          <Route path="tiers" element={<LoyaltyTiersPage />} />
          <Route path="scoring" element={<LoyaltyScoringPage />} />
          <Route path="settings" element={<LoyaltySettingsPage />} />
        </Route>
        <Route path="analytics" element={admin(<AdminAnalyticsPage />)} />
        <Route path="logs" element={admin(<AdminLogsPage />)} />
      </Route>
    </Routes>
  )
}
