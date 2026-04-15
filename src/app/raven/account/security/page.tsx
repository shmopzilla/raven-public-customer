"use client";

import { useState } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import {
  Banner,
  Button,
  Field,
  Input,
  Panel,
  SectionHeading,
} from "@/components/raven/ui";

export default function SecurityPage() {
  const { user } = useAuth();

  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSaving(true);
    setEmailError(null);
    setEmailSuccess(false);
    try {
      const res = await fetch("/api/account/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change-email", newEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error);
      } else {
        setEmailSuccess(true);
        setNewEmail("");
        setTimeout(() => setEmailSuccess(false), 3000);
      }
    } catch {
      setEmailError("Failed to update email");
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/account/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change-password",
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error);
      } else {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch {
      setPasswordError("Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Security"
        title="Email & password."
        description="Manage how you sign in to Raven."
      />

      <Panel className="p-6 sm:p-8">
        <h2 className="font-['PP_Editorial_New'] text-2xl text-white">
          Change email
        </h2>
        <p className="mt-1 font-['Archivo'] text-sm text-white/55">
          Current:{" "}
          <span className="break-all text-white">{user?.email || "—"}</span>
        </p>

        <form
          onSubmit={handleEmailChange}
          className="mt-5 max-w-lg space-y-4"
        >
          <Field label="New email" htmlFor="newEmail">
            <Input
              id="newEmail"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              placeholder="new@email.com"
            />
          </Field>
          {emailError && <Banner tone="error">{emailError}</Banner>}
          {emailSuccess && (
            <Banner tone="success">Email updated.</Banner>
          )}
          <Button type="submit" loading={emailSaving}>
            {emailSaving ? "Updating…" : "Update email"}
          </Button>
        </form>
      </Panel>

      <Panel className="p-6 sm:p-8">
        <h2 className="font-['PP_Editorial_New'] text-2xl text-white">
          Change password
        </h2>

        <form
          onSubmit={handlePasswordChange}
          className="mt-5 max-w-lg space-y-4"
        >
          <Field label="Current password" htmlFor="currentPassword">
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </Field>
          <Field label="New password" htmlFor="newPassword">
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              placeholder="Min 8 characters"
            />
          </Field>
          <Field label="Confirm new password" htmlFor="confirmPassword">
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </Field>
          {passwordError && <Banner tone="error">{passwordError}</Banner>}
          {passwordSuccess && (
            <Banner tone="success">Password updated.</Banner>
          )}
          <Button type="submit" loading={passwordSaving}>
            {passwordSaving ? "Updating…" : "Update password"}
          </Button>
        </form>
      </Panel>
    </div>
  );
}
