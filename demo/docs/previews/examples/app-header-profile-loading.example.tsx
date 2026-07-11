import { useState } from "react";
import { AppHeaderProfile } from "@rfdtech/components";

const user = {
  name: "Kwame Asante",
  role: "Admin",
  initials: "KA",
  email: "kwame@gsl.edu.gh",
};

export function AppHeaderProfileLoadingExample() {
  const [loading, setLoading] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <button
        type="button"
        className="gsl-profile-menu__item"
        style={{ alignSelf: "flex-start" }}
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 1500);
        }}
      >
        <span>Simulate loading</span>
      </button>

      <div
        style={{
          display: "inline-flex",
          padding: 8,
          borderRadius: "var(--gsl-radius-2xl)",
          background: "var(--gsl-surface-subtle)",
        }}
      >
        <AppHeaderProfile
          user={user}
          loading={loading}
          loadingLabel="Loading profile..."
          onSignOut={() => console.log("Sign out")}
        />
      </div>
    </div>
  );
}
