import { Button } from "../tailgrids/core/button";
import { Xmark2x } from "@tailgrids/icons";

export function ResourcesTab({ onClose }: { onClose?: () => void }) {
  const resourceItems = [
    {
      title: "Help Center",
      description: "Find answers and step-by-step guides.",
      buttonText: "Visit",
    },
    {
      title: "API Documentation",
      description: "Everything you need to integrate with our API.",
      buttonText: "Visit",
    },
    {
      title: "Blog",
      description: "Insights, updates, and product news.",
      buttonText: "Learn Now",
    },
    {
      title: "Product Updates",
      description: "Improvements, fixes, and new features.",
      buttonText: "Check it out",
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 ">
      <div className="py-3 border-b flex justify-between items-center border-base-100 bg-background-50 z-10">
        <h3 className="text-xl font-medium text-title-50">Resources</h3>
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

      <div className="flex-1 overflow-y-auto pt-6 pr-1">
        <ul className="space-y-4">
          {resourceItems.map((item, idx) => (
            <li
              key={idx}
              className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between py-2 border-b border-base-50/50 last:border-0"
            >
              <div>
                <p className="font-medium text-title-50 text-sm">
                  {item.title}
                </p>
                <p className="text-xs text-text-100">{item.description}</p>
              </div>
              <div>
                <Button
                  appearance="outline"
                  size="xs"
                  className="h-8 text-sm px-3"
                >
                  {item.buttonText}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
