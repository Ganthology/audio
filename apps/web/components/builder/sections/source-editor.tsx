import type { Source } from "@web-kits/audio";
import { Select } from "../controls";
import type { BuilderAction } from "../state";
import styles from "../styles.module.css";

type SourceType =
  | "sine"
  | "triangle"
  | "square"
  | "sawtooth"
  | "noise"
  | "wavetable"
  | "sample"
  | "constant";

const SOURCE_TYPE_ITEMS: ReadonlyArray<{ value: SourceType; label: string }> = [
  { value: "sine", label: "sine" },
  { value: "triangle", label: "triangle" },
  { value: "square", label: "square" },
  { value: "sawtooth", label: "sawtooth" },
  { value: "noise", label: "noise" },
  { value: "wavetable", label: "wavetable" },
  { value: "sample", label: "sample" },
  { value: "constant", label: "constant" },
];

type NoiseColor = "white" | "pink" | "brown";

const NOISE_COLOR_ITEMS: ReadonlyArray<{ value: NoiseColor; label: string }> = [
  { value: "white", label: "white" },
  { value: "pink", label: "pink" },
  { value: "brown", label: "brown" },
];

const TOGGLE_ITEMS: ReadonlyArray<{ value: "true" | "false"; label: string }> =
  [
    { value: "false", label: "Off" },
    { value: "true", label: "On" },
  ];

type Props = {
  index: number;
  source: Source;
  dispatch: React.Dispatch<BuilderAction>;
};

export function SourceEditor({ index, source, dispatch }: Props) {
  const set = (next: Source) =>
    dispatch({ type: "set-source", index, source: next });

  const handleTypeChange = (newType: string) => {
    switch (newType) {
      case "sine":
      case "triangle":
      case "square":
      case "sawtooth":
        set({ type: newType, frequency: 440 });
        break;
      case "noise":
        set({ type: "noise", color: "white" });
        break;
      case "wavetable":
        set({ type: "wavetable", harmonics: [1, 0.5, 0.25], frequency: 440 });
        break;
      case "sample":
        set({ type: "sample", url: "" });
        break;
      case "constant":
        set({ type: "constant", offset: 1 });
        break;
    }
  };

  return (
    <div className={styles.section}>
      <span className={styles.sectionLabel}>Source</span>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Type</span>
        <Select
          ariaLabel="Source type"
          value={source.type}
          onValueChange={handleTypeChange}
          items={SOURCE_TYPE_ITEMS}
        />
      </div>

      {(source.type === "sine" ||
        source.type === "triangle" ||
        source.type === "square" ||
        source.type === "sawtooth") && (
        <OscillatorFields index={index} source={source} set={set} />
      )}

      {source.type === "noise" && (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Color</span>
          <Select
            ariaLabel="Noise color"
            value={source.color ?? "white"}
            onValueChange={(color) => set({ ...source, color })}
            items={NOISE_COLOR_ITEMS}
          />
        </div>
      )}

      {source.type === "wavetable" && (
        <>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Frequency</span>
            <input
              type="number"
              className={styles.fieldInput}
              value={
                typeof source.frequency === "number" ? source.frequency : 440
              }
              onChange={(e) =>
                set({ ...source, frequency: Number(e.target.value) })
              }
            />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Harmonics</span>
            <input
              type="text"
              className={styles.fieldInput}
              value={source.harmonics.join(", ")}
              onChange={(e) => {
                const harmonics = e.target.value
                  .split(",")
                  .map((s) => Number(s.trim()))
                  .filter((n) => !Number.isNaN(n));
                if (harmonics.length > 0) set({ ...source, harmonics });
              }}
            />
          </div>
        </>
      )}

      {source.type === "sample" && (
        <>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>URL</span>
            <input
              type="text"
              className={styles.fieldInput}
              value={source.url ?? ""}
              onChange={(e) => set({ ...source, url: e.target.value })}
              placeholder="/sounds/kick.wav"
            />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Rate</span>
            <input
              type="number"
              className={styles.fieldInput}
              value={source.playbackRate ?? 1}
              step={0.1}
              min={0.1}
              max={4}
              onChange={(e) =>
                set({ ...source, playbackRate: Number(e.target.value) })
              }
            />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Loop</span>
            <Select
              ariaLabel="Sample loop"
              value={source.loop ? "true" : "false"}
              onValueChange={(v) => set({ ...source, loop: v === "true" })}
              items={TOGGLE_ITEMS}
            />
          </div>
        </>
      )}

      {source.type === "constant" && (
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Offset</span>
          <input
            type="number"
            className={styles.fieldInput}
            value={source.offset ?? 1}
            step={0.1}
            onChange={(e) => set({ ...source, offset: Number(e.target.value) })}
          />
        </div>
      )}
    </div>
  );
}

function OscillatorFields({
  index: _index,
  source,
  set,
}: {
  index: number;
  source: Extract<
    Source,
    { type: "sine" | "triangle" | "square" | "sawtooth" }
  >;
  set: (s: Source) => void;
}) {
  const isSweep = typeof source.frequency === "object";
  const freqVal =
    typeof source.frequency === "number"
      ? source.frequency
      : source.frequency.start;

  return (
    <>
      <div className={styles.field}>
        <span className={styles.fieldLabel}>Frequency</span>
        {isSweep ? (
          <div className={styles.fieldRow}>
            <div className={styles.fieldRowItem}>
              <span className={styles.fieldRowLabel}>start</span>
              <input
                type="number"
                className={styles.fieldInput}
                value={
                  (source.frequency as { start: number; end: number }).start
                }
                min={20}
                max={20000}
                onChange={(e) =>
                  set({
                    ...source,
                    frequency: {
                      ...(source.frequency as { start: number; end: number }),
                      start: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className={styles.fieldRowItem}>
              <span className={styles.fieldRowLabel}>end</span>
              <input
                type="number"
                className={styles.fieldInput}
                value={(source.frequency as { start: number; end: number }).end}
                min={20}
                max={20000}
                onChange={(e) =>
                  set({
                    ...source,
                    frequency: {
                      ...(source.frequency as { start: number; end: number }),
                      end: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        ) : (
          <input
            type="number"
            className={styles.fieldInput}
            value={freqVal}
            min={20}
            max={20000}
            onChange={(e) =>
              set({ ...source, frequency: Number(e.target.value) })
            }
          />
        )}
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Sweep</span>
        <Select
          ariaLabel="Sweep"
          value={isSweep ? "true" : "false"}
          onValueChange={(v) => {
            if (v === "true") {
              set({
                ...source,
                frequency: { start: freqVal, end: freqVal * 2 },
              });
            } else {
              set({ ...source, frequency: freqVal });
            }
          }}
          items={TOGGLE_ITEMS}
        />
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Detune</span>
        <input
          type="number"
          className={styles.fieldInput}
          value={source.detune ?? 0}
          step={1}
          onChange={(e) => set({ ...source, detune: Number(e.target.value) })}
        />
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>FM</span>
        <Select
          ariaLabel="FM"
          value={source.fm ? "true" : "false"}
          onValueChange={(v) => {
            if (v === "true") {
              set({ ...source, fm: { ratio: 3.5, depth: 200 } });
            } else {
              const { fm: _, ...rest } = source;
              set(rest as Source);
            }
          }}
          items={TOGGLE_ITEMS}
        />
      </div>

      {source.fm && (
        <div className={styles.field}>
          <span className={styles.fieldLabel} />
          <div className={styles.fieldRow}>
            <div className={styles.fieldRowItem}>
              <span className={styles.fieldRowLabel}>ratio</span>
              <input
                type="number"
                className={styles.fieldInput}
                value={source.fm.ratio}
                step={0.1}
                min={0.1}
                max={16}
                onChange={(e) => {
                  if (source.fm)
                    set({
                      ...source,
                      fm: { ...source.fm, ratio: Number(e.target.value) },
                    });
                }}
              />
            </div>
            <div className={styles.fieldRowItem}>
              <span className={styles.fieldRowLabel}>depth</span>
              <input
                type="number"
                className={styles.fieldInput}
                value={source.fm.depth}
                step={10}
                min={0}
                max={2000}
                onChange={(e) => {
                  if (source.fm)
                    set({
                      ...source,
                      fm: { ...source.fm, depth: Number(e.target.value) },
                    });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
