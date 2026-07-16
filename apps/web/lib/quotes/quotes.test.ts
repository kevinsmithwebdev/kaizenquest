import { describe, expect, it } from "vitest";

import { INSPIRATIONAL_QUOTES, pickRandomQuote } from "./quotes";

describe("pickRandomQuote", () => {
  it("returns a quote from the collection", () => {
    const quote = pickRandomQuote();

    expect(INSPIRATIONAL_QUOTES).toContainEqual(quote);
    expect(quote.quote.length).toBeGreaterThan(0);
    expect(quote.source.length).toBeGreaterThan(0);
  });
});
