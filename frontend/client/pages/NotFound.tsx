/*

NotFound ("*") — 404 Fallback

This page catches invalid URLs and guides users back to the landing page.

*/


import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <AppLayout contentClassName="flex flex-col items-center justify-center pb-24">
      <div className="w-full max-w-xl space-y-6 rounded-[2.5rem] border border-white/60 bg-white/75 p-10 text-center shadow-xl backdrop-blur-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/50">
          404 — page missing
        </p>
        <h1 className="text-4xl font-semibold text-foreground">We could not find that view.</h1>
        <p className="text-base text-foreground/70">
          The route <span className="font-semibold text-foreground">{location.pathname}</span> does not exist yet. Head back to continue crafting your input flow.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40 transition-transform duration-200 hover:-translate-y-0.5"
          >
            Return home
          </Link>
          <Link
            to="/main"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-6 py-3 text-sm font-semibold text-primary transition-colors duration-200 hover:border-primary hover:bg-primary/20"
          >
            View main page
          </Link>
        </div>
      </div>
    </AppLayout>
  );
};

export default NotFound;
