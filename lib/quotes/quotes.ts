import quotesData from "./quotes.json";
import type { InspirationalQuote } from "./quotes.types";

const quotes = quotesData as InspirationalQuote[];

export const INSPIRATIONAL_QUOTES = quotes;

export function pickRandomQuote(): InspirationalQuote {
  const index = Math.floor(Math.random() * quotes.length);
  return quotes[index]!;
}
