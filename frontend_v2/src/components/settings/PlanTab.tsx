import { Button } from "../tailgrids/core/button";
import { Xmark2x } from "@tailgrids/icons";

export function PlanTab({ onClose }: { onClose?: () => void }) {
  const resourceItems = [
    "Access to basic AI chat model",
    "Standard response speed",
    "Limited messages per day (e.g., 20–50)",
    "Text-only responses",
    "Basic writing & editing help",
    "Simple brainstorming support",
    "General Q&A assistance",
    "Limited chat history",
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      <div className="py-3 border-b flex justify-between items-center border-base-100 bg-background-50 z-10">
        <h3 className="text-xl font-medium text-title-50">Plan & Billings</h3>
        <Button
          variant="ghost"
          iconOnly
          size="xs"
          className="text-text-100 hover:text-title-50"
          onClick={onClose}
        >
          <Xmark2x className="size-6" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto py-6  space-y-6 pr-1">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between pb-5 border-b border-base-100">
          <div>
            <h4 className="text-base font-semibold text-title-50">Free Plan</h4>
            <p className="text-sm text-text-100">
              Try the core experience for free
            </p>
          </div>
          <Button
            variant="primary"
            className="bg-gray-900 text-sm  hover:bg-gray-950 text-white h-8 px-3"
          >
            Upgrade
          </Button>
        </div>

        <div className="bg-background-soft-50 rounded-lg p-5 border border-base-50">
          <h4 className="text-base font-medium text-title-50 mb-1">
            Free Plan
          </h4>
          <p className="text-sm text-text-100 mb-4 font-medium">
            Included features:
          </p>

          <ul className="space-y-2">
            {resourceItems.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm text-text-50"
              >
                <span className="mt-1.5 size-1.5 rounded-full bg-text-50 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
