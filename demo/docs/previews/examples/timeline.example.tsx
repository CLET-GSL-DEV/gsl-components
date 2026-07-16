import { Check } from "lucide-react";
import {
  Timeline,
  TimelineData,
  TimelineFooter,
  TimelineItem,
  TimelineTitle,
} from "@rfdtech/components";

const history = [
  {
    title: "Case reported",
    date: "12 Jun 2026",
    description: "HR Officer intake",
    mode: "success" as const,
  },
  {
    title: "Assigned to HR Manager",
    date: "13 Jun 2026",
    description: "You",
    mode: "success" as const,
  },
  {
    title: "Initial interview scheduled",
    date: "20 Jun 2026",
    description: "Complainant & respondent",
    mode: "success" as const,
  },
  {
    title: "Response overdue",
    date: "Since 3 Jul 2026",
    description: "You",
    mode: "warning" as const,
  },
];

export function TimelineExample() {
  return (
    <section className="clet-card" style={{ padding: "24px" }}>
      <h2
        className="clet-card__title"
        style={{
          margin: "0 0 24px",
          fontSize: "20px",
          fontWeight: 600,
          color: "var(--clet-text)",
        }}
      >
        Case History
      </h2>
      <Timeline>
        {history.map((item) => (
          <TimelineItem
            key={item.title}
            mode={item.mode}
            icon={
              item.mode === "warning" ? null : (
                <Check size={10} strokeWidth={3} />
              )
            }
          >
            <TimelineTitle>{item.title}</TimelineTitle>
            <TimelineData>{item.date}</TimelineData>
            <TimelineFooter>{item.description}</TimelineFooter>
          </TimelineItem>
        ))}
      </Timeline>
    </section>
  );
}
