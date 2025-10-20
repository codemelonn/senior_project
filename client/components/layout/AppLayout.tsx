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
        <header className="py-8">
          <div className="container flex flex-wrap items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-3 text-foreground">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25">
                TCB
              </span>
              <div className="flex flex-col">
                <span className="text-lg font-semibold tracking-tight">
                  TryCatch(Bias)
                </span>
                <span className="text-sm text-foreground/60">
                  Find and Fix Bias in Text
                </span>
              </div>
            </Link>
            <nav className="flex items-center gap-1 rounded-full border border-white/40 bg-white/60 px-1 py-1 text-sm font-medium text-foreground shadow-sm backdrop-blur-md">
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
            </nav>
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
