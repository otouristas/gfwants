import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCheckout } from "@/lib/fund-api";
import { trackBeginCheckout } from "@/lib/gtag";
import { BrandMark } from "@/components/fund-page";
import {
  MAX_BID_CENTS,
  MIN_BID_CENTS,
  QUICK_BIDS,
  formatMoney,
  type TierId,
} from "@/lib/fund";

export type ContributeDraft = {
  tier: TierId;
  amountCents: number;
  displayName: string;
  xHandle: string;
  message: string;
  productName: string;
  productUrl: string;
  productPitch: string;
  anonymous: boolean;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: ContributeDraft;
  onDraftChange: (next: ContributeDraft) => void;
  onSettled: () => void;
  claimRank?: number;
};

export function ContributeDialog({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onSettled,
  claimRank,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const euros = Math.round(draft.amountCents / 100);

  useEffect(() => {
    if (open) {
      setBusy(false);
      setAgreed(false);
    }
  }, [open]);

  function payload() {
    return {
      tier: draft.tier,
      amountCents: draft.amountCents,
      displayName: draft.displayName,
      xHandle: draft.xHandle,
      message: draft.message,
      productName: draft.productName,
      productUrl: draft.productUrl,
      productPitch: draft.productPitch,
      anonymous: draft.anonymous,
    };
  }

  function setEuros(value: number) {
    const next = Math.min(MAX_BID_CENTS / 100, Math.max(MIN_BID_CENTS / 100, Math.round(value)));
    onDraftChange({ ...draft, amountCents: next * 100 });
  }

  async function payStripe() {
    if (!agreed) {
      toast.error("Agree to the rules first. They are short.");
      return;
    }
    setBusy(true);
    try {
      trackBeginCheckout(draft.tier, draft.amountCents);
      const checkout = await createCheckout({ data: payload() });
      window.location.assign(checkout.url);
    } catch (err) {
      setBusy(false);
      toast.error(err instanceof Error ? err.message : "Card checkout failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {claimRank
              ? `Claim #${claimRank} for ${formatMoney(draft.amountCents)}`
              : `Bid ${formatMoney(draft.amountCents)}`}
          </DialogTitle>
          <DialogDescription>
            Any amount from €1 to €10,000. Highest payer sits at #1. Your website goes on the homepage.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Label>Your bid</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-lg font-medium">€</span>
            <Input
              type="number"
              min={1}
              max={10000}
              step={1}
              value={euros}
              onChange={(e) => setEuros(Number(e.target.value) || 1)}
              className="font-mono text-lg"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_BIDS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setEuros(n)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  euros === n ? "bg-fg text-bg" : "bg-subtle text-muted hover:text-fg"
                }`}
              >
                €{n.toLocaleString("en-US")}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.anonymous}
            onChange={(e) => onDraftChange({ ...draft, anonymous: e.target.checked })}
            className="size-4 accent-fg"
          />
          Stay anonymous
        </label>

        {!draft.anonymous ? (
          <Field label="Name on the board">
            <Input
              value={draft.displayName}
              autoComplete="off"
              placeholder="Your name or brand"
              onChange={(e) => onDraftChange({ ...draft, displayName: e.target.value })}
            />
          </Field>
        ) : null}

        <Field label="Website — this is how you get traffic">
          <div className="flex items-center gap-2">
            <BrandMark url={draft.productUrl} name={draft.productName || draft.displayName || "?"} />
            <Input
              value={draft.productUrl}
              autoComplete="off"
              inputMode="url"
              placeholder="https://yoursite.com"
              onChange={(e) => onDraftChange({ ...draft, productUrl: e.target.value })}
            />
          </div>
          <p className="text-xs text-faint">Favicon is pulled from that URL and lands on the homepage with you.</p>
        </Field>
        <Field label="One-line pitch">
          <Input
            value={draft.productPitch || draft.message}
            autoComplete="off"
            placeholder="Why a stranger should click you"
            onChange={(e) =>
              onDraftChange({ ...draft, productPitch: e.target.value, message: e.target.value })
            }
          />
        </Field>
        <Field label="Product name">
          <Input
            value={draft.productName}
            autoComplete="off"
            placeholder="Acme"
            onChange={(e) => onDraftChange({ ...draft, productName: e.target.value })}
          />
        </Field>

        <label className="flex items-start gap-2 text-sm leading-snug">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 size-4 accent-fg"
          />
          <span>
            I agree to the{" "}
            <Link
              to="/rules"
              className="underline decoration-border-strong underline-offset-2"
              onClick={() => onOpenChange(false)}
            >
              rules
            </Link>
            . Not a charity. No refunds. Rank is cash.
          </span>
        </label>

        <Button className="h-12 w-full" disabled={busy} onClick={() => void payStripe()}>
          {busy ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Opening card checkout
            </>
          ) : (
            `Pay ${formatMoney(draft.amountCents)} with card`
          )}
        </Button>
        <p className="text-center text-xs text-faint">
          Visa, Mastercard, Apple Pay. You land on the board when the charge succeeds.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </label>
  );
}
