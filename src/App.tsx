import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import RankPredictor from "./pages/RankPredictor";
import CutoffExplorer from "./pages/CutoffExplorer";
import CollegeFinder from "./pages/CollegeFinder";
import MockSimulator from "./pages/MockSimulator";
import SeatMatrix from "./pages/SeatMatrix";
import RoundTracker from "./pages/RoundTracker";
import CollegeCompare from "./pages/CollegeCompare";
import Documents from "./pages/Documents";
import Planner from "./pages/Planner";
import ErrorBoundary from "./components/ErrorBoundary";
import FeeCalculator from "./pages/FeeCalculator";
import Analytics from "./pages/Analytics";
import Reviews from "./pages/Reviews";
import XLSXDemo from "./pages/XLSXDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rank-predictor" element={<RankPredictor />} />
            <Route path="/cutoff-explorer" element={<CutoffExplorer />} />
            <Route path="/college-finder" element={<CollegeFinder />} />
            <Route path="/mock-simulator" element={<MockSimulator />} />
            <Route path="/seat-matrix" element={<SeatMatrix />} />
            <Route path="/round-tracker" element={<RoundTracker />} />
            <Route path="/college-compare" element={<CollegeCompare />} />
            <Route path="/planner" element={
          <ErrorBoundary>
            <Planner />
          </ErrorBoundary>
        } />
            <Route path="/documents" element={<Documents />} />
            <Route path="/fee-calculator" element={<FeeCalculator />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/xlsx-demo" element={<XLSXDemo />} />
            {/* More routes will be added here */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
