"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

function ToastRenderer() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map((item) => (
        <Toast key={item.id} open onOpenChange={(open) => !open && dismiss(item.id)}>
          <div className="grid gap-1">
            <ToastTitle>{item.title}</ToastTitle>
            {item.description ? <ToastDescription>{item.description}</ToastDescription> : null}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

export function Toaster() {
  return <ToastRenderer />;
}
