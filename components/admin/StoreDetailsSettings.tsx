"use client";

/**
 * "Settings → Store details" — the merchant's core business identity: name, description, how
 * shoppers reach them, and brand color. These used to have no single home in the editor (storeName
 * was only editable by clicking it in the live preview, which went away once the navbar dropped the
 * name text; aboutText/contactPhone/whatsappNumber/accentColor had no editor UI at all). Unlike the
 * per-field click-to-edit elsewhere, this is a real form: several related fields, reviewed together,
 * saved together in one PATCH — editing your phone number shouldn't require five separate round
 * trips the way five separate EditableText fields would.
 */
import { useState } from "react";
import type { StorefrontSiteDetails } from "@/lib/api";
import { ImageSetting } from "./SectionSidebar";

interface FormState {
  storeName: string;
  aboutText: string;
  contactPhone: string;
  whatsappNumber: string;
  accentColor: string;
}

function toForm(siteDetails: StorefrontSiteDetails): FormState {
  return {
    storeName: siteDetails.storeName,
    aboutText: siteDetails.aboutText ?? "",
    contactPhone: siteDetails.contactPhone ?? "",
    whatsappNumber: siteDetails.whatsappNumber ?? "",
    accentColor: siteDetails.accentColor || "#2563EB",
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-sf-ink-soft">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "w-full rounded-md border border-sf-line bg-white px-3 py-2 text-sm text-sf-ink outline-none focus:border-sf-ink-soft";

export function StoreDetailsSettings({
  companyCode,
  siteDetails,
  setSiteDetails,
  markDraft,
  onBack,
}: {
  companyCode: string;
  siteDetails: StorefrontSiteDetails;
  setSiteDetails: (next: StorefrontSiteDetails) => void;
  markDraft: () => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<FormState>(() => toForm(siteDetails));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const baseline = toForm(siteDetails);
  const dirty = (Object.keys(form) as Array<keyof FormState>).some((key) => form[key] !== baseline[key]);

  const update = (patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!form.storeName.trim()) {
      setError("Store name can't be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/storefront/${encodeURIComponent(companyCode)}/admin/draft`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Couldn't save your changes. Try again.");
      setSiteDetails({ ...siteDetails, ...form });
      markDraft();
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save your changes. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(toForm(siteDetails));
    setError(null);
    setSaved(false);
  };

  return (
    <div>
      <button
        className="flex w-full cursor-pointer items-center gap-1.5 border-b border-sf-line px-4 py-3 text-left text-sm font-medium text-sf-ink hover:bg-sf-bg"
        onClick={onBack}
        type="button"
      >
        <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
          <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Store details
      </button>

      <div className="space-y-4 px-4 py-4">
        <Field label="Store name">
          <input className={inputClass} onChange={(e) => update({ storeName: e.target.value })} value={form.storeName} />
        </Field>

        <Field label="Description">
          <textarea
            className={inputClass}
            onChange={(e) => update({ aboutText: e.target.value })}
            placeholder="What makes your store worth buying from"
            rows={4}
            value={form.aboutText}
          />
        </Field>

        <Field label="Contact number">
          <input
            className={inputClass}
            onChange={(e) => update({ contactPhone: e.target.value })}
            placeholder="e.g. 9876543210"
            type="tel"
            value={form.contactPhone}
          />
        </Field>

        <Field label="WhatsApp number">
          <input
            className={inputClass}
            onChange={(e) => update({ whatsappNumber: e.target.value })}
            placeholder="With country code, e.g. 919876543210"
            type="tel"
            value={form.whatsappNumber}
          />
        </Field>

        <Field label="Brand color">
          <div className="flex items-center gap-2">
            <input
              aria-label="Brand color"
              className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-sf-line bg-white p-1"
              onChange={(e) => update({ accentColor: e.target.value })}
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(form.accentColor) ? form.accentColor : "#2563EB"}
            />
            <input className={`${inputClass} flex-1`} onChange={(e) => update({ accentColor: e.target.value })} value={form.accentColor} />
          </div>
        </Field>

        <ImageSetting
          companyCode={companyCode}
          image={{ field: "logoUrl", label: "Logo", uploadPath: "upload-logo" }}
          markDraft={markDraft}
          setSiteDetails={setSiteDetails}
          siteDetails={siteDetails}
        />

        <div className="flex items-center gap-2 border-t border-sf-line pt-4">
          <button
            className="cursor-pointer rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            disabled={!dirty || saving}
            onClick={() => void handleSave()}
            type="button"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <button
            className="cursor-pointer rounded-full border border-sf-line px-4 py-1.5 text-xs font-semibold text-sf-ink disabled:opacity-50"
            disabled={!dirty || saving}
            onClick={handleCancel}
            type="button"
          >
            Reset
          </button>
        </div>
        {saved ? <p className="text-xs text-emerald-700">Saved to your draft — publish to make it live.</p> : null}
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    </div>
  );
}
