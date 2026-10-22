/**
 * Runs in the page MAIN world at document_start.
 * Turns off October 2026 watch-page experiments (side rail + grid recommendations)
 * so Theater Mode can use the classic column layout again.
 */
(() => {
  "use strict";

  const FORCE_OFF = [
    "web_watch_eligible_to_switch_to_grid",
    "web_watch_enable_single_column_grid_view",
    "web_fixed_panel_watch_next_grid_swap",
    "web_live_chat_panel_watch_next_grid_swap",
    "web_watch_fixed_default_panels",
    "web_engagement_panel_show_description",
    "web_watch_move_summary_to_sd",
    "web_watch_hero_list",
    "web_watch_split_scroll",
    "web_side_rail_dismissible_panels",
    "web_side_rail_default_dismissed_panels",
    "web_watch_compact_comments",
    "kevlar_watch_hide_comments_while_panel_open",
    "kevlar_watch_cinematics",
    "enable_main_app_watch_redux",
    "disable_theater_mode",
  ];

  const FORCE_ON = ["kevlar_watch_flexy_theater_manager"];

  function patchFlags(flags) {
    if (!flags || typeof flags !== "object") return;
    for (const key of FORCE_OFF) {
      try {
        flags[key] = false;
      } catch (_) {
        /* ignore */
      }
    }
    for (const key of FORCE_ON) {
      try {
        flags[key] = true;
      } catch (_) {
        /* ignore */
      }
    }
  }

  function patchConfigObject(obj) {
    if (!obj || typeof obj !== "object") return;
    try {
      patchFlags(obj.EXPERIMENT_FLAGS);
    } catch (_) {
      /* ignore */
    }
  }

  function hookYtcfg(cfg) {
    if (!cfg || typeof cfg !== "object" || cfg.__ytctmHooked) return;

    try {
      Object.defineProperty(cfg, "__ytctmHooked", {
        value: true,
        configurable: false,
        enumerable: false,
      });
    } catch (_) {
      try {
        cfg.__ytctmHooked = true;
      } catch (_) {
        /* ignore */
      }
    }

    try {
      patchFlags(cfg.get?.("EXPERIMENT_FLAGS"));
    } catch (_) {
      /* ignore */
    }
    try {
      patchConfigObject(cfg.data_);
    } catch (_) {
      /* ignore */
    }

    if (typeof cfg.set === "function") {
      const originalSet = cfg.set;
      cfg.set = function (...args) {
        try {
          if (
            typeof args[0] === "string" &&
            args[0] === "EXPERIMENT_FLAGS" &&
            args[1] &&
            typeof args[1] === "object"
          ) {
            patchFlags(args[1]);
          }
          if (args[0] && typeof args[0] === "object") {
            patchConfigObject(args[0]);
          }
        } catch (_) {
          /* ignore */
        }

        const result = originalSet.apply(this, args);

        try {
          patchFlags(this.get?.("EXPERIMENT_FLAGS"));
        } catch (_) {
          /* ignore */
        }
        try {
          patchConfigObject(this.data_);
        } catch (_) {
          /* ignore */
        }
        return result;
      };
    }
  }

  let capturedYtcfg;
  try {
    const existing = window.ytcfg;
    if (existing) {
      capturedYtcfg = existing;
      hookYtcfg(existing);
    } else {
      Object.defineProperty(window, "ytcfg", {
        configurable: true,
        enumerable: true,
        get() {
          return capturedYtcfg;
        },
        set(value) {
          capturedYtcfg = value;
          try {
            hookYtcfg(value);
          } catch (_) {
            /* ignore */
          }
          try {
            Object.defineProperty(window, "ytcfg", {
              configurable: true,
              writable: true,
              enumerable: true,
              value,
            });
          } catch (_) {
            /* ignore */
          }
        },
      });
    }
  } catch (_) {
    /* ignore */
  }

  function patchEverything() {
    try {
      hookYtcfg(window.ytcfg);
    } catch (_) {
      /* ignore */
    }
    try {
      patchFlags(window.ytcfg?.get?.("EXPERIMENT_FLAGS"));
    } catch (_) {
      /* ignore */
    }
    try {
      patchConfigObject(window.ytcfg?.data_);
    } catch (_) {
      /* ignore */
    }
    try {
      patchFlags(window.yt?.config_?.EXPERIMENT_FLAGS);
    } catch (_) {
      /* ignore */
    }
  }

  const startupTimer = setInterval(patchEverything, 1);
  setTimeout(() => {
    clearInterval(startupTimer);
    patchEverything();
  }, 15000);

  document.addEventListener("yt-navigate-start", patchEverything, true);
  document.addEventListener("yt-navigate-finish", patchEverything, true);
})();
