"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";

export function ChangePasswordSection() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("changePassword");

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <KeyRound className="size-4" />
        {t("open")}
      </Button>
    );
  }

  return <ChangePasswordForm onSuccess={() => setIsOpen(false)} onCancel={() => setIsOpen(false)} />;
}