"use client";

import { useRouter } from "next/navigation";

interface Tab {
  key: string;
  label: string;
  badge: "blue" | "amber" | "green" | "purple" | "red";
}

interface ReadingListTabsProps {
  tabs: Tab[];
  counts: Record<string, number>;
  activeTab: string;
}

function ReadingListTabs({ tabs, counts, activeTab }: ReadingListTabsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => router.push(`/reading-list?tab=${tab.key}`)}
          className={`
            px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.05em]
            border-2 transition-colors duration-150 cursor-pointer
            ${
              activeTab === tab.key
                ? "bg-ink text-paper border-ink dark:bg-paper dark:text-ink dark:border-paper"
                : "bg-transparent text-ink border-ink hover:bg-ink hover:text-paper dark:text-paper dark:border-paper dark:hover:bg-paper dark:hover:text-ink"
            }
          `}
        >
          {tab.label}
          <span className="ml-1 opacity-60">{counts[tab.key] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

export { ReadingListTabs };
