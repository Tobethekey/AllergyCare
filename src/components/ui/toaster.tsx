diff --git a/src/components/ui/toaster.tsx b/src/components/ui/toaster.tsx
index 171beb46d9c020c1be1ee9cb260b816d0bc2c1dd..fe7103d7051ff02d3456b4a45950475816cf1be0 100644
--- a/src/components/ui/toaster.tsx
+++ b/src/components/ui/toaster.tsx
@@ -1,28 +1,28 @@
 "use client"
 
-import { useToast } from "@/hooks/use-toast"
+import { useToast } from "@/components/ui/use-toast"
 import {
   Toast,
   ToastClose,
   ToastDescription,
   ToastProvider,
   ToastTitle,
   ToastViewport,
 } from "@/components/ui/toast"
 
 export function Toaster() {
   const { toasts } = useToast()
 
   return (
     <ToastProvider>
       {toasts.map(function ({ id, title, description, action, ...props }) {
         return (
           <Toast key={id} {...props}>
             <div className="grid gap-1">
               {title && <ToastTitle>{title}</ToastTitle>}
               {description && (
                 <ToastDescription>{description}</ToastDescription>
               )}
             </div>
             {action}
             <ToastClose />
