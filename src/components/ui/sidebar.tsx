"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"
import { parseCookies, setCookie } from "nookies" // Using nookies for server-side friendly cookies

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

// Define the context value type more clearly
type SidebarContextType = {
  state: "expanded" | "collapsed"
  open: boolean // Represents the current open state
  setOpen: (open: boolean | ((prevOpen: boolean) => boolean)) => void // Function to change the open state, accepting function or value
  isMobile: boolean
  toggleSidebar: () => void // Convenience function to toggle
  collapsible: "offcanvas" | "icon" | "none" | undefined // Include collapsible state in context
  variant: "sidebar" | "floating" | "inset" | undefined // Include variant in context
}

// Initialize context with null, will be provided by the provider
const SidebarContext = React.createContext<SidebarContextType | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    // Use a clearer error message
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    // Props for external control (optional, but recommended for flexibility)
    open?: boolean
    onOpenChange?: (open: boolean) => void
    // Initial state for uncontrolled usage (if open/onOpenChange not provided)
    defaultOpen?: boolean
    // Add variant and collapsible props here so context can access them
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
>(
  (
    {
      // Correctly destructure props as a single object
      defaultOpen = true, // Default value for uncontrolled mode
      open: controlledOpen, // Rename to controlledOpen to avoid name collision
      onOpenChange,
      variant, // Destructure variant
      collapsible, // Destructure collapsible
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()

    // Manage internal state if not externally controlled
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(() => {
      // Initialize state from cookie only on client-side
      if (typeof window !== 'undefined') {
         const cookies = parseCookies();
         const savedState = cookies[SIDEBAR_COOKIE_NAME];
         if (savedState !== undefined) {
           return savedState === 'true';
         }
      }
      return defaultOpen; // Fallback to defaultOpen if no cookie
    });

    // Determine the effective open state and the setter function
    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
    const setOpen = React.useCallback(
      (value: boolean | ((prevOpen: boolean) => boolean)) => {
        const newState = typeof value === "function" ? value(open) : value;

        // Call the external setter if provided
        if (onOpenChange) {
          onOpenChange(newState);
        }

        // Update internal state if not externally controlled
        if (controlledOpen === undefined) {
          setUncontrolledOpen(newState);
        }

        // Update the cookie
        if (typeof document !== 'undefined') {
          setCookie(null, SIDEBAR_COOKIE_NAME, String(newState), {
            path: '/',
            maxAge: SIDEBAR_COOKIE_MAX_AGE,
          });
        }
      },
      [open, controlledOpen, onOpenChange] // Add dependencies
    );

    // Helper to toggle the sidebar, uses the effective setOpen
    const toggleSidebar = React.useCallback(() => {
      setOpen(!open);
    }, [setOpen, open]); // Add dependencies

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        // Ensure the shortcut doesn't trigger if input fields are focused
        if (
          !event.defaultPrevented && // Check if the event was already handled
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey) &&
          // Avoid triggering when focus is on input, textarea, or select
          !(event.target instanceof HTMLInputElement) &&
          !(event.target instanceof HTMLTextAreaElement) &&
          !(event.target instanceof HTMLSelectElement)
        ) {
          event.preventDefault();
          toggleSidebar();
        }
      }

      // Add event listener only on the client side
      if (typeof window !== 'undefined') {
         window.addEventListener("keydown", handleKeyDown)
         return () => window.removeEventListener("keydown
