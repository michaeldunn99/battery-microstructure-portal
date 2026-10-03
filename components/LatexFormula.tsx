"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface LatexFormulaProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export default function LatexFormula({
  formula,
  displayMode = false,
  className = "",
}: LatexFormulaProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        displayMode,
        throwOnError: false,
      });
    } catch {
      return formula;
    }
  }, [formula, displayMode]);

  return (
    <span
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
