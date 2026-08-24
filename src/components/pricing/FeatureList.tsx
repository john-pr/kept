import { Check } from "lucide-react";

export function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="mb-7 flex flex-col gap-3">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
          <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" strokeWidth={2.5} />
          {feature}
        </li>
      ))}
    </ul>
  );
}
