"use client";

import { useEffect } from "react";

// Reveal collapsed report sections before navigating to a method or code line.
export default function ReportNavigation() {
  useEffect(() => {
    function reveal(hash: string, focus: boolean) {
      if (!hash) return false;
      let id: string;
      try { id = decodeURIComponent(hash.slice(1)); } catch { return false; }
      const target = document.getElementById(id);
      if (!target) return false;
      for (let element: HTMLElement | null = target; element; element = element.parentElement) {
        if (element instanceof HTMLDetailsElement) element.open = true;
      }
      requestAnimationFrame(() => {
        target.scrollIntoView({ block: "start" });
        if (focus) {
          const focusTarget = target instanceof HTMLDetailsElement
            ? target.querySelector("summary") : target;
          if (focusTarget instanceof HTMLElement) {
            if (!focusTarget.hasAttribute("tabindex") && focusTarget.tagName !== "SUMMARY") focusTarget.tabIndex = -1;
            focusTarget.focus({ preventScroll: true });
          }
        }
      });
      return true;
    }
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a") : null;
      const href = anchor?.getAttribute("href");
      if (!href?.startsWith("#") || anchor?.hasAttribute("download")) return;
      if (reveal(href, true)) {
        event.preventDefault();
        if (window.location.hash !== href) window.history.pushState(null, "", href);
      }
    }
    const onHashChange = () => reveal(window.location.hash, true);
    reveal(window.location.hash, false);
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);
  return null;
}
