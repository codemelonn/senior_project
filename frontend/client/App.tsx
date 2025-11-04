/*

App.tsx — App Router & Providers

This file wires up global providers (React Query, tooltips, toasters) 
and defines routes for “/” → Index and “/main” → Main, plus a catch-all to NotFound.

*/

import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import WelcomePage from "./pages/Welcome";  // ⬅️ new
import Index from "./pages/Index";          // input/analyze page
import Main from "./pages/Main";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* First page = Welcome */}
          <Route path="/" element={<WelcomePage />} />

          {/* Put Index at /analyze so the Welcome can live at "/" */}
          <Route path="/analyze" element={<Index />} />

          {/* Dashboard/results */}
          <Route path="/main" element={<Main />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
