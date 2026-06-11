import { describe, expect, it } from "vitest";
import { isValidElement } from "react";
import {
  mapMeAppToAppItem,
  mapMeAppsToAppItems,
} from "./mapMeAppToAppItem";
import { sampleMeApp } from "../../../test/fixtures";

describe("mapMeAppToAppItem", () => {
  it("maps API fields to AppItem values", () => {
    const item = mapMeAppToAppItem(sampleMeApp);

    expect(item.id).toBe("gov-portal");
    expect(item.name).toBe("Governance Portal");
    expect(item.href).toBe("http://178.105.154.224:3001");
    expect(item.badge).toBe("registrar");
    expect(item.metadata).toEqual(sampleMeApp);
    expect(isValidElement(item.icon)).toBe(true);
  });

  it("marks apps without a frontend URL as disabled", () => {
    const item = mapMeAppToAppItem({
      ...sampleMeApp,
      frontend_url: "",
    });

    expect(item.href).toBeUndefined();
    expect(item.disabled).toBe(true);
  });
});

describe("mapMeAppsToAppItems", () => {
  it("maps every app in the response", () => {
    const items = mapMeAppsToAppItems([
      sampleMeApp,
      {
        ...sampleMeApp,
        system_id: "finance-hub",
        system_name: "Finance Hub",
      },
    ]);

    expect(items).toHaveLength(2);
    expect(items[1]?.id).toBe("finance-hub");
  });
});
