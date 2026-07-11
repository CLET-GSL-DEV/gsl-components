import { useState } from "react";
import { ProfilePopover } from "@rfdtech/components";

export function ProfilePopoverLoadingExample() {
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

      <ProfilePopover
        fullName="Yaw Boateng"
        email="y.boateng@clet.gov.gh"
        loading={loading}
        loadingLabel="Loading profile..."
        onSignOut={() => console.log("Sign out")}
      />
    </div>
  );
}
