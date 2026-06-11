import type { MeApp, MeAppsResponse } from "../types/app-switcher";

export const sampleMeApp: MeApp = {
  system_id: "gov-portal",
  system_name: "Governance Portal",
  system_code: "GOV-123456",
  frontend_url: "http://178.105.154.224:3001",
  role: "registrar",
  permissions: ["cases:review"],
};

export const sampleMeAppsResponse: MeAppsResponse = {
  success: true,
  message: "Available systems retrieved.",
  data: {
    apps: [sampleMeApp],
  },
  meta: {
    count: 1,
  },
};
