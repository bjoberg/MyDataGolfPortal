import { useState } from "react";
import {
  IntendedStartLine,
  Curve,
  Height,
  ActualStartLine,
  StrikeLocation,
  EndLocation,
} from "./types";
import { API_URL } from "./config";

function SegmentedButtonGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <div className="mb-6">
      <div className="font-medium mb-2 text-lg">{label}</div>

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`
              px-3 py-2 rounded-lg border text-sm
              ${
                value === opt
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-gray-300 text-gray-700"
              }
            `}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function EndLocationGrid({
  value,
  onChange,
}: {
  value: EndLocation | null;
  onChange: (v: EndLocation) => void;
}) {
  const layout: EndLocation[][] = [
    ["longLeft", "long", "longRight"],
    ["left", "target", "right"],
    ["shortLeft", "short", "shortRight"],
  ];

  return (
    <div className="mb-6">
      <div className="font-medium mb-2 text-lg">End Location</div>

      <div className="grid grid-cols-3 gap-2">
        {layout.flat().map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => onChange(loc)}
            className={`
              py-4 rounded-lg text-sm font-medium border
              ${
                value === loc
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
              }
            `}
          >
            {loc}
          </button>
        ))}
      </div>
    </div>
  );
}

function StrikeLocationGrid({
  value,
  onChange,
}: {
  value: StrikeLocation | null;
  onChange: (v: StrikeLocation) => void;
}) {
  // 3×3 face map layout
  const layout: StrikeLocation[][] = [
    ["highToe", "high", "highHeel"],
    ["toe", "center", "heel"],
    ["lowToe", "low", "lowHeel"],
  ];

  return (
    <div className="mb-6">
      <div className="font-medium mb-2 text-lg">Strike Location</div>

      <div className="grid grid-cols-3 gap-2">
        {layout.flat().map((loc) => (
          <button
            key={loc}
            type="button"
            onClick={() => onChange(loc)}
            className={`
              py-4 rounded-lg text-sm font-medium border
              ${
                value === loc
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
              }
            `}
          >
            {loc}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ShotForm() {
  // STATE
  const [club, setClub] = useState<string | null>(null);

  const [intended, setIntended] = useState<{
    startLine: IntendedStartLine | null;
    curve: Curve | null;
    height: Height | null;
  }>({
    startLine: "left", // <-- DEFAULT
    curve: "leftToRight", // <-- DEFAULT
    height: "medium", // <-- DEFAULT
  });

  const [actual, setActual] = useState<{
    startLine: ActualStartLine | null;
    curve: Curve | null;
    height: Height | null;
    strikeLocation: StrikeLocation | null;
    endLocation: EndLocation | null;
  }>({
    startLine: null,
    curve: null,
    height: null,
    strikeLocation: null,
    endLocation: null,
  });

  const [toast, setToast] = useState(false);
  const [errorToast, setErrorToast] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FORM COMPLETE CHECK
  const isFormComplete =
    club &&
    intended.startLine &&
    intended.curve &&
    intended.height &&
    actual.startLine &&
    actual.curve &&
    actual.height &&
    actual.strikeLocation &&
    actual.endLocation;

  // SUBMIT HANDLER
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🔒 Prevent double submit
    if (isSubmitting) return;
    if (!isFormComplete) return;

    setIsSubmitting(true);

    const payload = {
      timestamp: Date.now(),
      club,
      intendedShot: intended,
      actualShot: actual,
    };

    try {
      const res = await fetch(`${API_URL}/shots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = "";
        try {
          const data = await res.json();
          message = data?.message || JSON.stringify(data);
        } catch {
          message = await res.text();
        }

        const fullError = `Error ${res.status}: ${
          message || "Unknown server error"
        }`;

        setErrorDetails(fullError);
        setErrorToast(true);
        setTimeout(() => {
          setErrorToast(false);
          setErrorDetails(null);
        }, 5000);

        throw new Error(fullError);
      }

      // SUCCESS TOAST
      setToast(true);
      setTimeout(() => setToast(false), 5000);

      // RESET FORM
      setClub(null);
      setIntended({
        startLine: "left", // <-- DEFAULT RESET
        curve: "leftToRight", // <-- DEFAULT RESET
        height: "medium", // <-- DEFAULT RESET
      });
      setActual({
        startLine: null,
        curve: null,
        height: null,
        strikeLocation: null,
        endLocation: null,
      });
    } catch (err) {
      console.error("Failed to save:", err);

      if (!errorToast) {
        const networkErr = `Network error: ${
          err instanceof Error ? err.message : String(err)
        }`;

        setErrorDetails(networkErr);
        setErrorToast(true);
        setTimeout(() => {
          setErrorToast(false);
          setErrorDetails(null);
        }, 5000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 max-w-md mx-auto space-y-8 pb-28"
    >
      {/* SUCCESS Toast */}
      {toast && (
        <div className="fixed top-4 left-4 right-4  bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 text-center">
          Saved!
        </div>
      )}

      {/* ERROR Toast */}
      {errorToast && (
        <div className="fixed top-4 left-4 right-4  bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="font-semibold">Failed to save</div>
          {errorDetails && (
            <div className="text-sm opacity-90 mt-1 whitespace-pre-line">
              {errorDetails}
            </div>
          )}
        </div>
      )}

      {/* Club */}
      <h2 className="text-2xl font-bold mt-6 mb-2">Club</h2>
      <div className="mb-4">
        <div className="relative">
          <select
            className="
              w-full rounded-xl px-4 py-3 pr-10
              text-lg font-medium
              bg-white text-gray-900
              border-2 border-gray-300
              focus:border-blue-600 focus:ring-2 focus:ring-blue-300
              appearance-none shadow-sm
            "
            value={club ?? ""}
            onChange={(e) => setClub(e.target.value || null)}
          >
            <option value="">Select club...</option>

            <optgroup label="Woods & Hybrid">
              <option>Driver</option>
              <option>3 Hybrid</option>
            </optgroup>

            <optgroup label="Irons">
              <option>2 Iron</option>
              <option>4 Iron</option>
              <option>5 Iron</option>
              <option>6 Iron</option>
              <option>7 Iron</option>
              <option>8 Iron</option>
              <option>9 Iron</option>
            </optgroup>

            <optgroup label="Wedges">
              <option>PW</option>
              <option>GW (52°)</option>
              <option>SW (56°)</option>
              <option>LW (60°)</option>
            </optgroup>

            <optgroup label="Putter">
              <option>Putter</option>
            </optgroup>
          </select>

          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">
            ▼
          </div>
        </div>
      </div>

      {/* Intended Shot */}
      <h2 className="text-2xl font-bold mt-6 mb-2">Intended Shot</h2>

      <SegmentedButtonGroup
        label="Start Line"
        options={["left", "right", "straight"]}
        value={intended.startLine}
        onChange={(v) => setIntended({ ...intended, startLine: v })}
      />

      <SegmentedButtonGroup
        label="Curve"
        options={["none", "leftToRight", "rightToLeft"]}
        value={intended.curve}
        onChange={(v) => setIntended({ ...intended, curve: v })}
      />

      <SegmentedButtonGroup
        label="Height"
        options={["low", "medium", "high"]}
        value={intended.height}
        onChange={(v) => setIntended({ ...intended, height: v })}
      />

      {/* Actual Shot */}
      <h2 className="text-2xl font-bold mt-6 mb-2">Actual Shot</h2>

      <SegmentedButtonGroup
        label="Start Line"
        options={["farLeft", "left", "straight", "right", "farRight"]}
        value={actual.startLine}
        onChange={(v) => setActual({ ...actual, startLine: v })}
      />

      <SegmentedButtonGroup
        label="Curve"
        options={["none", "leftToRight", "rightToLeft"]}
        value={actual.curve}
        onChange={(v) => setActual({ ...actual, curve: v })}
      />

      <SegmentedButtonGroup
        label="Height"
        options={["low", "medium", "high"]}
        value={actual.height}
        onChange={(v) => setActual({ ...actual, height: v })}
      />

      <StrikeLocationGrid
        value={actual.strikeLocation}
        onChange={(v) => setActual({ ...actual, strikeLocation: v })}
      />

      <EndLocationGrid
        value={actual.endLocation}
        onChange={(v) => setActual({ ...actual, endLocation: v })}
      />

      {/* FIXED SUBMIT BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <button
          type="submit"
          disabled={!isFormComplete || isSubmitting}
          className={`
            w-full py-3 rounded-xl text-lg font-semibold transition-opacity
            ${
              !isFormComplete || isSubmitting
                ? "bg-gray-400 text-white opacity-60 pointer-events-none"
                : "bg-blue-600 text-white"
            }
          `}
        >
          {isSubmitting ? "Saving..." : "Save Shot"}
        </button>
      </div>
    </form>
  );
}
