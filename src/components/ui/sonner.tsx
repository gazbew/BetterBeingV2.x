"use client"

import { Toaster as SonnerPrimitive } from "sonner"
import { useTheme } from "next-themes"
import { devLog } from "@/utils/logger"

type ToasterProps = React.ComponentProps<typeof SonnerPrimitive>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  devLog('Sonner Toaster: render start, theme=', theme);

  return (
    <SonnerPrimitive
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
