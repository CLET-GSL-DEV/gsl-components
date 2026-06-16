import { forwardRef, type ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "../../utils/cn";

export interface AppHeaderSearchProps {
  className?: string;
  children?: ReactNode;
}

export const AppHeaderSearch = forwardRef<HTMLButtonElement, AppHeaderSearchProps>(
  function AppHeaderSearch({ className, children }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={cn("gsl-app-header__search-btn", className)}
      >
        <Search size={14} strokeWidth={1.5} aria-hidden />
        <span className="gsl-app-header__search-text">Search</span>
        <kbd className="gsl-app-header__search-kbd">⌘K</kbd>
      </button>
    );
  },
);

(AppHeaderSearch as any).componentId = "AppHeaderSearch";
