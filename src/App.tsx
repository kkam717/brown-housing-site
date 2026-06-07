import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReviewSyncProvider } from "./context/ReviewSyncContext";
import { useBackendWarmup } from "./hooks/useBackendWarmup";
import NavBar from "./components/NavBar";
import SyncStatusBanner from "./components/SyncStatusBanner";
import HomePage from "./pages/HomePage";
import ListingsPage from "./pages/ListingsPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";
import "./App.css";

const CampusMap = lazy(() => import("./components/CampusMap"));

function AppRoutes() {
  useBackendWarmup();

  return (
    <BrowserRouter>
      <div className="app">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SyncStatusBanner />
        <NavBar />
        <main id="main-content" className="app__main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route
              path="/map"
              element={
                <Suspense fallback={<p className="app__loading">Loading map...</p>}>
                  <CampusMap />
                </Suspense>
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <footer className="app__footer">
          <p>
            Brown Housing Lottery Demystified — Caspar Schliemann, Kian Kamshad, Martin Pohlen
          </p>
          <p className="app__footer-meta">
            CS0320 project · Built with React + Vite ·{" "}
            <a href="/contact">Contact</a>
            {" · "}
            <a
              href="https://github.com/kiankamshad/portfolio-site"
              target="_blank"
              rel="noopener noreferrer"
            >
              View source
            </a>
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ReviewSyncProvider>
      <AppRoutes />
    </ReviewSyncProvider>
  );
}
