"use client"

import * as React from "react"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

type Direction = "left" | "right" | "top" | "bottom"

type ResponsiveDrawerProps = Omit<React.ComponentProps<typeof Drawer>, "direction"> & {
  /**
   * Drawer direction used on viewports below the mobile breakpoint.
   * Defaults to `"bottom"` so the drawer behaves like a native sheet on phones.
   */
  mobileDirection?: Extract<Direction, "bottom" | "top">
  /**
   * Drawer direction used on viewports at or above the mobile breakpoint.
   * Defaults to `"right"` for a sidebar-like experience on desktop.
   */
  desktopDirection?: Extract<Direction, "right" | "left">
}

export function RightDrawer({
  mobileDirection = "bottom",
  desktopDirection = "right",
  ...props
}: ResponsiveDrawerProps) {
  const isMobile = useIsMobile()
  const direction = isMobile ? mobileDirection : desktopDirection

  return <Drawer direction={direction} {...props} />
}

type RightDrawerContentProps = React.ComponentProps<typeof DrawerContent>

export const RightDrawerContent = React.forwardRef<
  React.ElementRef<typeof DrawerContent>,
  RightDrawerContentProps
>(function RightDrawerContent({ className, children, ...props }, ref) {
  return (
    <DrawerContent
      ref={ref}
      className={cn(
        "data-[vaul-drawer-direction=right]:h-full data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:max-w-md data-[vaul-drawer-direction=right]:sm:max-w-lg",
        "data-[vaul-drawer-direction=left]:h-full data-[vaul-drawer-direction=left]:w-full data-[vaul-drawer-direction=left]:max-w-md data-[vaul-drawer-direction=left]:sm:max-w-lg",
        "data-[vaul-drawer-direction=right]:!p-6 data-[vaul-drawer-direction=left]:!p-6",
        "data-[vaul-drawer-direction=bottom]:rounded-t-2xl data-[vaul-drawer-direction=bottom]:!p-6",
        "data-[vaul-drawer-direction=top]:rounded-b-2xl data-[vaul-drawer-direction=top]:!p-6",
        "sm:data-[vaul-drawer-direction=right]:!p-8 sm:data-[vaul-drawer-direction=left]:!p-8",
        "[&>div:first-child]:!mx-auto",
        className
      )}
      {...props}
    >
      {children}
    </DrawerContent>
  )
})

export {
  DrawerTrigger as RightDrawerTrigger,
  DrawerClose as RightDrawerClose,
  DrawerHeader as RightDrawerHeader,
  DrawerFooter as RightDrawerFooter,
  DrawerTitle as RightDrawerTitle,
  DrawerDescription as RightDrawerDescription,
}
