import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Suspense, lazy } from "react";
import { Skeleton } from "./components/ui/skeleton";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const ColorTest = lazy(() => import("./pages/ColorTest"));
const BasicTest = lazy(() => import("./pages/BasicTest"));
const TestNoAPI = lazy(() => import("./pages/TestNoAPI"));
const MinimalTest = lazy(() => import("./pages/MinimalTest"));
const TailwindTest = lazy(() => import("./pages/TailwindTest"));
const WorkingTest = lazy(() => import("./pages/WorkingTest"));
const BetterBeingHome = lazy(() => import("./pages/BetterBeingHome"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Account = lazy(() => import("./pages/Account"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
// Additional pages
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Wellness = lazy(() => import("./pages/Wellness"));
const Blog = lazy(() => import("./pages/Blog"));
const Nutrition = lazy(() => import("./pages/Nutrition"));
const Mindfulness = lazy(() => import("./pages/Mindfulness"));
const Sleep = lazy(() => import("./pages/Sleep"));
// Enterprise pages
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
import EnterpriseNavigation from "@/components/navbar/EnterpriseNavigation";
import { devLog } from './utils/logger';

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex flex-col space-y-3 p-8">
    <Skeleton className="h-[125px] w-full rounded-xl" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[80%]" />
    </div>
  </div>
);

const queryClient = new QueryClient();

// Debug: Log when App module is evaluated (removed in production)
devLog('App.tsx: module evaluated');

const App = () => {
  devLog('App.tsx: App render start');
  return (
    <ErrorBoundary level="critical">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <ErrorBoundary level="page">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/colortest" element={<ColorTest />} />
              <Route path="/basictest" element={<BasicTest />} />
              <Route path="/testnoapi" element={<TestNoAPI />} />
              <Route path="/minimal" element={<MinimalTest />} />
              <Route path="/tailwind" element={<TailwindTest />} />
              <Route path="/working" element={<WorkingTest />} />
              <Route path="/better-being" element={<BetterBeingHome />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/account" element={<Account />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />

              {/* Additional routes to match Navigation */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/wellness" element={<Wellness />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/nutrition" element={<Nutrition />} />
              <Route path="/mindfulness" element={<Mindfulness />} />
              <Route path="/sleep" element={<Sleep />} />

              {/* Enterprise routes */}
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;