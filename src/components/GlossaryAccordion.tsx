import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion";
import type { ReactElement, FC } from "react";

export type GlossaryDefinition = {
  term: string;
  definition: string;
};

export interface GlossaryAccordionProps {
  definitions: Array<GlossaryDefinition>;
}

export default function GlossaryAccordion({
  definitions,
}: GlossaryAccordionProps): ReactElement<FC> {
  return (
    <Accordion>
      {definitions.map(
        (definition: GlossaryDefinition, index: number): ReactElement<FC> => (
          <AccordionItem
            key={`index-${index + 1}`}
            value={`item-${index + 1}`}
            className="opacity-0 animate-fade-in-accordion"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <AccordionTrigger>{definition.term}</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted leading-relaxed border-l-4 border-mango-green-light pl-4">
                {definition.definition}
              </p>
            </AccordionContent>
          </AccordionItem>
        ),
      )}
    </Accordion>
  );
}
