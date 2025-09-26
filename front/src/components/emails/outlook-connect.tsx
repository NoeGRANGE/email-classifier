"use client";

import * as React from "react";
import { Loader2, MailPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/lib/api";
import { cn } from "@/lib/utils";
import styles from "./outlook-connect.module.css";
import { useTranslations } from "@/i18n/use-translations";

type OutlookConnectProps = {
  className?: string;
  setUpdate: () => void;
};

export default function OutlookConnect({
  className,
  setUpdate,
}: OutlookConnectProps) {
  const { t } = useTranslations("emails");
  const [isConnecting, setIsConnecting] = React.useState(false);
  const monitorRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (monitorRef.current != null) {
        window.clearInterval(monitorRef.current);
        monitorRef.current = null;
      }
    };
  }, []);

  const handleClick = React.useCallback(() => {
    if (!API_BASE) {
      console.error("Missing NEXT_PUBLIC_BACKEND_URL");
      return;
    }
    if (isConnecting) return;

    const authUrl = `${API_BASE}/auth/outlook`;
    setIsConnecting(true);

    try {
      const base = `${API_BASE}/auth/outlook`;
      const popupUrl = `${base}?flow=popup`;
      const redirectUrl = `${base}?flow=redirect`;

      const features =
        "popup=yes,width=520,height=720,menubar=no,toolbar=no,location=no,status=no";
      const popup = window.open("", "outlook-connect", features);

      if (!popup) {
        window.location.href = redirectUrl;
        return;
      }

      try {
        popup.opener = null;
      } catch {}
      popup.location.href = popupUrl;
      popup.focus();

      monitorRef.current = window.setInterval(() => {
        if (popup.closed) {
          if (monitorRef.current != null) {
            window.clearInterval(monitorRef.current);
            monitorRef.current = null;
          }
          setIsConnecting(false);
          setUpdate();
          console.log("Outlook auth window closed");
        }
      }, 800);
    } catch (error) {
      console.error("Failed to open Outlook auth window", error);
      window.location.href = authUrl; // dernier recours
    }
  }, [isConnecting]);

  return (
    <div className={cn(styles.root, className)}>
      <Button
        onClick={handleClick}
        disabled={isConnecting}
        startIcon={
          isConnecting ? <Loader2 className="animate-spin" /> : <MailPlus />
        }
      >
        {isConnecting
          ? t("connect.ctaBusy", "Connecting...")
          : t("connect.cta", "Connect Outlook email")}
      </Button>
    </div>
  );
}
