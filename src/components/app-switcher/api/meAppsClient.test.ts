import { describe, expect, it } from "vitest";
import {
  buildMeAppsUrl,
  createMeAppsRequestInit,
} from "./meAppsClient";

describe("buildMeAppsUrl", () => {
  it("builds an absolute apps URL from a base URL", () => {
    expect(buildMeAppsUrl("https://api.example.com")).toBe(
      "https://api.example.com/v1/me/apps",
    );
  });

  it("strips trailing slashes from the base URL", () => {
    expect(buildMeAppsUrl("https://api.example.com/")).toBe(
      "https://api.example.com/v1/me/apps",
    );
  });

  it("returns a relative URL when the base URL is empty", () => {
    expect(buildMeAppsUrl("")).toBe("/v1/me/apps");
  });
});

describe("createMeAppsRequestInit", () => {
  it("adds a bearer authorization header", () => {
    expect(createMeAppsRequestInit("secret-token")).toEqual({
      headers: {
        Authorization: "Bearer secret-token",
      },
    });
  });
});
