"use client";

import * as React from "react";
import LanguageSwitcher from "../language-switcher";
import { getBillingInfo, getBillingPlans } from "@/lib/api";

export default function SubscriptionScreen() {
  const [info, setInfo] = React.useState<BillingInfo | null>(null);
  const [plans, setPlans] = React.useState<PlanInfo[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    Promise.all([getBillingInfo(), getBillingPlans()])
      .then(([i, p]) => {
        if (!mounted) return;
        setInfo(i);
        setPlans(p);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || "Failed to load billing data");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h1>Subscription</h1>
        <LanguageSwitcher />
      </div>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}
      {!loading && !error && info && (
        <section style={{ marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Your subscription</h2>
          <div style={{ marginTop: 8, lineHeight: 1.6 }}>
            <div>
              <strong>Plan:</strong> {info.currentPlan ?? "none"}
            </div>
            <div>
              <strong>Status:</strong> {info.subscriptionStatus ?? "n/a"}
            </div>
            <div>
              <strong>Mailboxes:</strong> {info.mailboxUsed} /{" "}
              {info.mailboxLimit}
            </div>
            {info.currentPeriodEnd && (
              <div>
                <strong>Period ends:</strong>{" "}
                {new Date(info.currentPeriodEnd).toLocaleString()}
              </div>
            )}
          </div>
        </section>
      )}
      {!loading && !error && plans && (
        <section>
          <h2 style={{ margin: 0, fontSize: 18 }}>Available plans</h2>
          <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
            {plans.map((p) => (
              <div
                key={p.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 6,
                  padding: 12,
                  background: p.isCurrent ? "#f6ffed" : "#fff",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <div
                      style={{ fontWeight: 600, textTransform: "capitalize" }}
                    >
                      {p.plan}
                    </div>
                    <div style={{ opacity: 0.7 }}>
                      Mailboxes: {p.mailbox_limit}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {p.isCurrent ? (
                      <span style={{ color: "green" }}>Current</span>
                    ) : p.canSwitchTo ? (
                      <span>Upgradeable</span>
                    ) : (
                      <span style={{ color: "#999" }}>Over limit</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
