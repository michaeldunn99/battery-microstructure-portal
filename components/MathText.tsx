import React from "react";
import LatexFormula from "./LatexFormula";

/** Render explicitly delimited inline math while preserving ordinary prose. */
export default function MathText({ text }: { text: string }) {
  return <>{text.split(/(\\\([\s\S]*?\\\))/g).map((part, index) =>
    part.startsWith("\\(") && part.endsWith("\\)")
      ? <LatexFormula key={index} formula={part.slice(2, -2)} />
      : <React.Fragment key={index}>{part}</React.Fragment>
  )}</>;
}
