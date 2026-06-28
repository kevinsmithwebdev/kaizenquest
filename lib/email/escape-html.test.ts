import { describe, expect, it } from "vitest";

import { escapeHtml } from "./escape-html";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml('Tom & "Friends" <test>')).toBe(
      "Tom &amp; &quot;Friends&quot; &lt;test&gt;",
    );
  });

  it("returns plain text unchanged", () => {
    expect(escapeHtml("Ada Lovelace")).toBe("Ada Lovelace");
  });
});
