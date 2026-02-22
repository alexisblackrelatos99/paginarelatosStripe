import { Navigate, Route, Routes } from 'react-router-dom';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { SearchPage } from '@/pages/search-page';
import { CollectionPage } from '@/pages/collection-page';
import { ProductPage } from '@/pages/product-page';
import { NotFoundPage } from '@/pages/not-found-page';
import { CartPage } from '@/pages/cart-page';
import { CheckoutPage } from '@/pages/checkout-page';
import { SignInPage } from '@/pages/sign-in-page';
import { RegisterPage } from '@/pages/register-page';
import { ForgotPasswordPage } from '@/pages/forgot-password-page';
import { ResetPasswordPage } from '@/pages/reset-password-page';
import { VerifyPage } from '@/pages/verify-page';
import { VerifyPendingPage } from '@/pages/verify-pending-page';
import { VerifiedPage } from '@/pages/verified-page';
import { VerifyErrorPage } from '@/pages/verify-error-page';
import { OrderConfirmationPage } from '@/pages/order-confirmation-page';
import { AccountLayoutPage } from '@/pages/account-layout-page';
import { AccountProfilePage } from '@/pages/account-profile-page';
import { AccountOrdersPage } from '@/pages/account-orders-page';
import { AccountCreateStoryPage } from '@/pages/account-create-story-page';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <Routes>
          <Route path="/" element={<Navigate to="/collection/catalogo" replace />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/collection/:slug" element={<CollectionPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/verify-pending" element={<VerifyPendingPage />} />
          <Route path="/verified" element={<VerifiedPage />} />
          <Route path="/verify-error" element={<VerifyErrorPage />} />
          <Route path="/order-confirmation/:code" element={<OrderConfirmationPage />} />
          <Route path="/account" element={<AccountLayoutPage />}>
            <Route path="profile" element={<AccountProfilePage />} />
            <Route path="orders" element={<AccountOrdersPage />} />
            <Route path="create-story" element={<AccountCreateStoryPage />} />
            <Route index element={<Navigate to="profile" replace />} />
          </Route>
          <Route path="/not-found" element={<NotFoundPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
