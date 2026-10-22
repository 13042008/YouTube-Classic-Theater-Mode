/**
 * Isolated-world helper: after flags restore classic structure, keep
 * comments/related in the expected columns if YouTube still moves them.
 */
(() => {
  "use strict";

  const WATCH = () =>
    location.pathname === "/watch" || location.pathname.startsWith("/watch");

  function flexy() {
    return document.querySelector("ytd-watch-flexy");
  }

  function isTheater(el) {
    return !!(el && el.hasAttribute("theater") && !el.hasAttribute("fullscreen"));
  }

  function ensureClassicDom() {
    if (!WATCH()) return;
    const root = flexy();
    if (!root) return;

    root.style.setProperty("--ytd-watch-flexy-fixed-side-menu-width", "0px");
    root.style.setProperty("--ytd-watch-flexy-fixed-panels-width", "0px");

    if (!isTheater(root)) return;

    if (root.hasAttribute("fixed-panels")) {
      root.removeAttribute("fixed-panels");
    }

    const below =
      root.querySelector("#below") ||
      root.querySelector("#primary-inner") ||
      root.querySelector("#primary");
    const secondaryInner =
      root.querySelector("#secondary-inner") || root.querySelector("#secondary");

    const comments =
      root.querySelector("ytd-comments#comments") ||
      root.querySelector("#comments") ||
      root.querySelector("ytd-comments");

    if (comments && below && !below.contains(comments)) {
      below.appendChild(comments);
    }

    const related =
      root.querySelector("ytd-watch-next-secondary-results-renderer") ||
      root.querySelector("#related");

    if (related && secondaryInner && !secondaryInner.contains(related)) {
      secondaryInner.appendChild(related);
    }
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      ensureClassicDom();
    });
  }

  const obs = new MutationObserver(schedule);

  function start() {
    schedule();
    obs.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["theater", "fixed-panels", "full-bleed-player"],
    });
  }

  document.addEventListener("yt-navigate-finish", schedule, true);
  document.addEventListener("yt-page-data-updated", schedule, true);

  if (document.documentElement) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
})();
