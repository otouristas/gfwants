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
import { contribute, createCheckout } from "@/lib/fund-api";
import { STRIPE_CHARGE_CENTS } from "@/lib/stripe";
import {
  TIER_BY_ID,
  approvalScore,
  formatMoney,
  shareText,
  type TierId,
} from "@/lib/fund";

export type ContributeDraft = {
  tier: TierId;
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
};

export function ContributeDialog({ open, onOpenChange, draft, onDraftChange, onSettled }: Props) {
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"form" | "done">("form");
  const [agreed, setAgreed] = useState(false);
  const [paid, setPaid] = useState<{ amount: number; score: number } | null>(null);
  const tier = TIER_BY_ID[draft.tier];

  useEffect(() => {
    if (open) {
      setPhase("form");
      setBusy(false);
      setPaid(null);
      setAgreed(false);
    }
  }, [open]);

  function payload() {
    return {
      tier: draft.tier,
      displayName: draft.displayName,
      xHandle: draft.xHandle,
      message: draft.message,
      productName: draft.productName,
      productUrl: draft.productUrl,
      productPitch: draft.productPitch,
      anonymous: draft.anonymous,
    };
  }

  async function payStripe() {
    if (tier.requiresProduct && draft.productUrl.trim().length < 3) {
      toast.error("Sponsors put a URL on the wall. That is the product.");
      return;
    }
    if (!agreed) {
      toast.error("Agree to the rules first. They are short.");
      return;
    }
    setBusy(true);
    try {
      const result = await contribute({ data: payload() });
      setPaid({
        amount: result.contribution.amountCents,
        score: approvalScore(result.raisedCents),
      });
      onSettled();
      const checkout = await createCheckout({ data: payload() });
      window.location.assign(checkout.url);
    } catch (err) {
      setBusy(false);
      toast.error(err instanceof Error ? err.message : "Stripe failed");
    }
  }

  function share() {
    if (!paid) return;
    void navigator.clipboard.writeText(shareText(paid.amount, paid.score)).then(
      () => toast.success("Copied. Post it before she sees the domain."),
      () => toast.error("Could not copy"),
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto">
        {phase === "done" && paid ? (
          <>
            <DialogHeader>
              <DialogTitle>Sending you to Stripe</DialogTitle>
              <DialogDescription>
                {formatMoney(STRIPE_CHARGE_CENTS)} on card. Money goes to Touristas AI. We leave Monday.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={share}>Copy the brag</Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{tier.label}</DialogTitle>
              <DialogDescription>{tier.punch}</DialogDescription>
            </DialogHeader>

            <div className="flex items-end justify-between rounded-lg bg-subtle px-4 py-3 shadow-[var(--shadow-border)]">
              <div>
                <p className="text-xs tracking-wide text-muted uppercase">Stripe charges</p>
                <p className="font-mono text-2xl tabular">{formatMoney(STRIPE_CHARGE_CENTS)}</p>
              </div>
              <p className="max-w-[12rem] text-right text-xs text-muted">
                Live card checkout. Touristas AI. {tier.placement}
              </p>
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
              <div className="grid gap-3">
                <Field label="Name on the wall">
                  <Input
                    value={draft.displayName}
                    autoComplete="off"
                    placeholder="Your name or brand"
                    onChange={(e) => onDraftChange({ ...draft, displayName: e.target.value })}
                  />
                </Field>
                <Field label="X handle">
                  <Input
                    value={draft.xHandle}
                    autoComplete="off"
                    placeholder="@handle"
                    onChange={(e) => onDraftChange({ ...draft, xHandle: e.target.value })}
                  />
                </Field>
              </div>
            ) : null}

            <Field label="Message">
              <Input
                value={draft.message}
                autoComplete="off"
                placeholder="Stop buying AI tools."
                onChange={(e) => onDraftChange({ ...draft, message: e.target.value })}
              />
            </Field>

            {tier.requiresProduct || tier.dollars >= 25 ? (
              <div className="grid gap-3 rounded-lg bg-subtle p-3 shadow-[var(--shadow-border)]">
                <p className="text-xs font-medium tracking-wide text-muted uppercase">
                  {tier.requiresProduct ? "Your product, on this page" : "Optional product plug"}
                </p>
                <Field label="Product">
                  <Input
                    value={draft.productName}
                    autoComplete="off"
                    placeholder="Acme"
                    onChange={(e) => onDraftChange({ ...draft, productName: e.target.value })}
                  />
                </Field>
                <Field label="Website">
                  <Input
                    value={draft.productUrl}
                    autoComplete="off"
                    inputMode="url"
                    placeholder="https://yoursite.com"
                    onChange={(e) => onDraftChange({ ...draft, productUrl: e.target.value })}
                  />
                </Field>
                <Field label="One-line pitch">
                  <Input
                    value={draft.productPitch}
                    autoComplete="off"
                    placeholder="Why a stranger should click you"
                    onChange={(e) => onDraftChange({ ...draft, productPitch: e.target.value })}
                  />
                </Field>
              </div>
            ) : null}

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
                . Not a charity. No refunds. Card is Stripe. €100 lands in Touristas AI.
              </span>
            </label>

            <Button className="h-12 w-full" disabled={busy} onClick={() => void payStripe()}>
              {busy ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Opening Stripe
                </>
              ) : (
                `Pay ${formatMoney(STRIPE_CHARGE_CENTS)} with card`
              )}
            </Button>
            <p className="text-center text-xs text-faint">Visa, Mastercard, Apple Pay. Stripe. We leave Monday.</p>
          </>
        )}
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
