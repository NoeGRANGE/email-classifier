import PlanCard from "./plan-card";
import styles from "./available-plans-section.module.css";

type AvailablePlansSectionProps = {
  planCards: PlanCardData[];
  t: TranslateFn;
  onSelectPlan: (plan: PlanCardData) => void;
  pendingPlanId: string | null;
};

export default function AvailablePlansSection({
  planCards,
  t,
  onSelectPlan,
  pendingPlanId,
}: AvailablePlansSectionProps) {
  if (!planCards.length) {
    return null;
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {t("subscriptions.available_plans.title", "Available plans")}
        </h2>
        <p className={styles.sectionSubtitle}>
          {t(
            "subscriptions.available_plans.subtitle",
            "Choose the offer that matches your workload. Plans scale with mailboxes and collaboration needs."
          )}
        </p>
      </div>
      <div className={styles.planGrid}>
        {planCards.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            t={t}
            onSelectPlan={onSelectPlan}
            isPending={pendingPlanId === plan.id}
          />
        ))}
      </div>
    </section>
  );
}
