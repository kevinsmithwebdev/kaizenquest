import { Quote } from "lucide-react";

import type { InspirationalQuote } from "@/lib/quotes";

type QuoteCardProps = InspirationalQuote;

export function QuoteCard({ quote, source }: QuoteCardProps) {
  return (
    <figure className="bg-success-subtle flex gap-3 rounded-xl p-4">
      <Quote
        className="text-success mt-0.5 size-5 shrink-0 -scale-x-100 fill-current"
        strokeWidth={0}
        aria-hidden
      />
      <div className="min-w-0">
        <blockquote className="text-foreground text-sm leading-relaxed">
          {quote}
        </blockquote>
        <figcaption className="text-success mt-2 text-sm italic">
          — {source}
        </figcaption>
      </div>
    </figure>
  );
}
