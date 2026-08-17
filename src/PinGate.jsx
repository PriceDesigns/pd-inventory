import React, { useEffect, useState } from "react";

const FONT_LINK_ID = "pd-inventory-fonts";
function useFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

function CornerTag({ children, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute -top-px -left-px w-2 h-2 border-t border-l" style={{ borderColor: "#3d7ea6" }} />
      <span className="absolute -top-px -right-px w-2 h-2 border-t border-r" style={{ borderColor: "#3d7ea6" }} />
      <span className="absolute -bottom-px -left-px w-2 h-2 border-b border-l" style={{ borderColor: "#3d7ea6" }} />
      <span className="absolute -bottom-px -right-px w-2 h-2 border-b border-r" style={{ borderColor: "#3d7ea6" }} />
      {children}
    </div>
  );
}

// Drop-in gate — wraps the existing app, never touches its logic.
// Same pattern as Time Clock/PD-Hub: remembers this device via
// localStorage once unlocked, and auto-unlocks silently if opened from
// PD-Hub via a ?key= URL param carrying the same PIN.
export default function PinGate({ children, appName = "Shop Inventory", pin, storageKey }) {
  useFonts();
  const [unlocked, setUnlocked] = useState(false);
  const [checked, setChecked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved === "true") {
      setUnlocked(true);
      setChecked(true);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const keyParam = params.get("key");
    if (keyParam === pin) {
      window.localStorage.setItem(storageKey, "true");
      setUnlocked(true);
      setChecked(true);
      return;
    }
    setChecked(true);
  }, [storageKey, pin]);

  function handleDigit(d) {
    if (input.length >= pin.length) return;
    const next = input + d;
    setInput(next);
    if (next.length === pin.length) setTimeout(() => submit(next), 100);
  }
  function submit(code) {
    if (code === pin) {
      window.localStorage.setItem(storageKey, "true");
      setUnlocked(true);
      setError("");
    } else {
      setError("Incorrect PIN");
      setTimeout(() => { setInput(""); setError(""); }, 1000);
    }
  }
  function handleBackspace() {
    setInput((p) => p.slice(0, -1));
  }

  if (!checked) return null;
  if (unlocked) return children;

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4" style={{ backgroundColor: "#17181a" }}>
      <CornerTag className="w-full max-w-sm px-6 py-8">
        <div className="text-center mb-6">
          <div className="text-xs uppercase tracking-[0.2em] mb-1" style={{ color: "#8d9096", fontFamily: "Inter, sans-serif" }}>
            PRICE DESIGNS
          </div>
          <div className="text-2xl tracking-wide" style={{ fontFamily: "'Barlow Condensed', sans-serif", color: "#ece9e2", fontWeight: 700 }}>
            {appName}
          </div>
        </div>

        <div className="text-[11px] tracking-[0.15em] uppercase text-center mb-4" style={{ color: "#8d9096", fontFamily: "Inter, sans-serif" }}>
          Enter PIN to continue
        </div>

        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: pin.length }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{
                border: "1px solid #35373b",
                backgroundColor: i < input.length ? "#3d7ea6" : "transparent",
                borderColor: i < input.length ? "#3d7ea6" : "#35373b",
              }}
            />
          ))}
        </div>

        {error && (
          <div className="text-center text-xs mb-3" style={{ color: "#c0503a", fontFamily: "Inter, sans-serif" }}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 justify-items-center mb-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="w-16 h-12 text-lg"
              style={{ backgroundColor: "#1a1c1f", border: "1px solid #35373b", color: "#ece9e2", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}
            >
              {d}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleDigit("0")}
            className="w-16 h-12 text-lg"
            style={{ backgroundColor: "#1a1c1f", border: "1px solid #35373b", color: "#ece9e2", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-16 h-12 text-sm"
            style={{ backgroundColor: "#1a1c1f", border: "1px solid #35373b", color: "#8d9096", fontFamily: "'JetBrains Mono', monospace" }}
          >
            ⌫
          </button>
        </div>
      </CornerTag>
    </div>
  );
}
