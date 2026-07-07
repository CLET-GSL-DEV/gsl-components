import { AlertTriangle, Check } from "lucide-react";
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
    status: "complete" as const,
  },
  {
    title: "Assigned to HR Manager",
    date: "13 Jun 2026",
    description: "You",
    status: "complete" as const,
  },
  {
    title: "Initial interview scheduled",
    date: "20 Jun 2026",
    description: "Complainant & respondent",
    status: "complete" as const,
  },
  {
    title: "Response overdue",
    date: "Since 3 Jul 2026",
    description: "You",
    status: "warning" as const,
  },
];

export function TimelineExample() {
  return (
    <section className="gsl-card" style={{ padding: "24px" }}>
      <h2
        className="gsl-card__title"
        style={{
          margin: "0 0 24px",
          fontSize: "20px",
          fontWeight: 600,
          color: "var(--gsl-text)",
        }}
      >
        Case History
      </h2>
      <Timeline>
        {history.map((item) => (
          <TimelineItem
            key={item.title}
            status={item.status}
            icon={
              item.status === "warning" ? null : (
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
