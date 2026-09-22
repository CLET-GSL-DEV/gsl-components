import { useState } from "react";
import { Banner } from "@rfdtech/components";

export function BannerExample() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Banner
      variant="info"
      heading="A new version of the accreditation checklist is available for the current cycle."
      subtext="Review the changes before submitting your application."
      action={<a href="/docs/banner">View details</a>}
      onClose={() => setDismissed(true)}
    />
  );
}
