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
  }
>(
  (
    {
      // Correctly destructure props as a single object
      defaultOpen = true, // Default value for uncontrolled mode
      open: controlledOpen, // Rename to controlledOpen to avoid name collision
      onOpenChange,
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
         return () => window.removeEventListener("keydown", handleKeyDown)
      }
    }, [toggleSidebar]); // Dependency is toggleSidebar

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContextType>(
      () => ({
        state,
        open,
        setOpen, // Provide the unified setter
        isMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, toggleSidebar] // Include all dependencies
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        {/* TooltipProvider should ideally wrap the entire app or a higher level */}
        {/* Placing it here means tooltips only work inside the SidebarProvider's children */}
        {/* Consider moving TooltipProvider higher in your app's component tree */}
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE, // Added mobile width variable
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            // Use data-state and data-mobile attributes on the wrapper for easier styling
             data-state={state}
             data-mobile={isMobile ? 'true' : 'false'}
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset"
    collapsible?: "offcanvas" | "icon" | "none"
  }
// Removed isOpen and onClose props from Sidebar, it gets state from context
>(
  (
    {
      side = "left",
      variant = "sidebar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Get state and setter from context
    const { isMobile, state, open, setOpen } = useSidebar()

    // Logic for non-collapsible sidebar (always visible, fixed width)
    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground",
             // Optional: Add padding here if needed, depends on desired styling
             // "p-2",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    // Mobile sidebar (using Sheet)
    if (isMobile) {
      return (
        // Use open and setOpen from context
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            // Use mobile width variable
            className="w-[--sidebar-width-mobile] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
             // Removed inline style as CSS variable is now on the wrapper
            side={side}
             // Pass props to SheetContent
            {...props}
          >
            {/* Content wrapper div */}
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    // Desktop sidebar (collapsible)
    return (
      <div
        ref={ref}
        className="group peer hidden md:block text-sidebar-foreground"
        data-state={state}
        data-collapsible={collapsible} // Use the actual prop value
        data-variant={variant}
        data-side={side}
      >
        {/* This is what handles the sidebar gap on desktop */}
        <div
          className={cn(
            "duration-200 relative h-svh w-[--sidebar-width] bg-transparent transition-[width] ease-linear",
            // Use data-state for collapsible offcanvas
            "group-data-[state=collapsed]:group-data-[collapsible=offcanvas]:w-0",
            // Handle side for the gap div rotation (less common, maybe not needed?)
            // "group-data-[side=right]:rotate-180", // This seems potentially problematic

            // Width adjustment for icon state based on variant
            variant === "floating" || variant === "inset"
              ? "group-data-[state=collapsed]:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
              : "group-data-[state=collapsed]:group-data-[collapsible=icon]:w-[--sidebar-width-icon]"
          )}
        />
        <div
          className={cn(
            "duration-200 fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] ease-linear md:flex",
            side === "left"
              ? "left-0 group-data-[state=collapsed]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
              : "right-0 group-data-[state=collapsed]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
            // Adjust the padding for floating and inset variants.
            variant === "floating" || variant === "inset"
              ? "p-2 group-data-[state=collapsed]:group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
              : "group-data-[state=collapsed]:group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l",
            // Ensure border color matches sidebar border
            "border-sidebar-border",
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow"
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()
  const { state, isMobile } = useSidebar() // Get state and isMobile

  // The rail typically only makes sense on desktop collapsible sidebars
  if (isMobile || state === 'expanded') {
      return null; // Don't render the rail on mobile or when expanded
  }

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex",
        "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize",
        // Cursor changes based on collapsed state and side
        "group-data-[state=collapsed][[data-side=left]_&]:cursor-e-resize group-data-[state=collapsed][[data-side=right]_&]:cursor-w-resize",
        // Adjust rail position for offcanvas state
        "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full", // after:left-full means the hover line is at the far right edge of the rail
        // Removed hover:bg-sidebar - seems like the hover effect is just on the ::after element
        // Adjust rail position slightly more for offcanvas variants
        "group-data-[state=collapsed][[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "group-data-[state=collapsed][[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
})
SidebarRail.displayName = "SidebarRail"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  // Added data-sidebar="inset" for easier styling hooks
  return (
    <main
      ref={ref}
      data-sidebar="inset"
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        // Ensure the peer selector targets the correct
