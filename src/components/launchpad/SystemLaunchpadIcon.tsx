import { LaunchpadIconTile } from "./LaunchpadIconTile";

export interface SystemLaunchpadIconProps {
  name: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function SystemLaunchpadIcon({ name }: SystemLaunchpadIconProps) {
  return (
    <LaunchpadIconTile name={name}>
      <span aria-hidden="true">{getInitials(name)}</span>
    </LaunchpadIconTile>
  );
}
