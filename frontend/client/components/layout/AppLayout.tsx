/*

AppLayout — Shared Layout Shell

This component provides the common page chrome (background, 
spacing, wrappers) and renders page content via children. Put global elements 
(e.g., disclaimer bar) here so they appear everywhere.

*/


import type { PropsWithChildren } from "react";
import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AppLayoutProps extends PropsWithChildren {
  contentClassName?: string;
  variant?: "full" | "minimal";
  backgroundClassName?: string;
}

const navigationLinks = [
  { name: "Home", to: "/" },
  { name: "Main", to: "/main" },
];

const AppLayout = ({
  children,
  contentClassName,
  variant = "full",
  backgroundClassName,
}: AppLayoutProps) => {
  if (variant === "minimal") {
    return (
      <div
        className={cn(
          "flex min-h-screen w-full items-center justify-center p-6",
          backgroundClassName ?? "bg-[#dff4e6]",
        )}
      >
        <main className={cn("w-full max-w-xl", contentClassName)}>{children}</main>
      </div>
    );
  }

  return (
    <div className={cn("relative min-h-screen overflow-hidden", backgroundClassName)}>
      <span className="pointer-events-none absolute -left-24 top-[-10%] h-[28rem] w-[28rem] rounded-full bg-aurora-gradient blur-3xl opacity-80" />
      <span className="pointer-events-none absolute -right-40 bottom-[-10%] h-[32rem] w-[32rem] rounded-full bg-aurora-gradient blur-3xl opacity-80" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="py-2">
          <div className="container flex flex-wrap items-center justify-between gap-6">
            {/* Removed Input Aurora section */}

           {/* <nav className="flex items-center gap-1 rounded-full border border-white/40 bg-white/60 px-1 py-1 text-sm font-medium text-foreground shadow-sm backdrop-blur-md">
              {navigationLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-4 py-2 transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow"
                        : "text-foreground/70 hover:text-foreground",
                    )
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>*/}

          </div>
        </header>
        <main className={cn("container flex-1 pb-20", contentClassName)}>
          {children}
        </main>
        <footer className="border-t border-white/40 bg-white/60 py-6 backdrop-blur-md">
          <div className="container flex flex-wrap items-center justify-between gap-4 text-sm text-foreground/60">
            <p>
              Built with love for seamless idea collection. Submit and elevate.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/" className="hover:text-primary">
                Start again
              </Link>
              <Link to="/main" className="hover:text-primary">
                View submission
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
