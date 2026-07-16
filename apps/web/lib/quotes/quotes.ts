import quotesData from "./quotes.json";
import type { InspirationalQuote } from "./quotes.types";

const quotes = quotesData as InspirationalQuote[];

export const INSPIRATIONAL_QUOTES = quotes;

const randomIndex = (length: number): number => {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0]! % length;
};

export function pickRandomQuote(): InspirationalQuote {
  const index = randomIndex(quotes.length);
  return quotes[index]!;
}
