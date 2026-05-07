import type { LFO, LFOTarget } from "@web-kits/audio";
import { useRef } from "react";
import { PlusIcon, TrashIcon } from "@/components/controls/icons";
import { ActionButton, Select } from "../controls";
import type { BuilderAction } from "../state";
import styles from "../styles.module.css";

type Waveform = LFO["type"];

const WAVEFORM_ITEMS: ReadonlyArray<{ value: Waveform; label: string }> = [
  { value: "sine", label: "sine" },
  { value: "triangle", label: "triangle" },
  { value: "square", label: "square" },
  { value: "sawtooth", label: "sawtooth" },
];

const LFO_TARGET_ITEMS: ReadonlyArray<{ value: LFOTarget; label: string }> = [
  { value: "frequency", label: "frequency" },
  { value: "detune", label: "detune" },
  { value: "gain", label: "gain" },
  { value: "pan", label: "pan" },
  { value: "filter.frequency", label: "filter.frequency" },
  { value: "filter.detune", label: "filter.detune" },
  { value: "filter.Q", label: "filter.Q" },
  { value: "filter.gain", label: "filter.gain" },
  { value: "playbackRate", label: "playbackRate" },
];

type Props = {
  index: number;
  lfos: LFO[];
  dispatch: React.Dispatch<BuilderAction>;
};

let nextLfoId = 0;

export function LFOEditor({ index, lfos, dispatch }: Props) {
  const ids = useRef(new WeakMap<LFO, string>());

  function getKey(lfo: LFO) {
    let id = ids.current.get(lfo);
    if (!id) {
      id = `lfo-${++nextLfoId}`;
      ids.current.set(lfo, id);
    }
    return id;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>LFO</span>
        <ActionButton
          className={styles.sectionAddBtn}
          onClick={() => dispatch({ type: "add-lfo", index })}
        >
          <PlusIcon size={10} /> Add
        </ActionButton>
      </div>

      {lfos.map((lfo, li) => (
        <LFOItem
          key={getKey(lfo)}
          layerIndex={index}
          lfoIndex={li}
          lfo={lfo}
          dispatch={dispatch}
        />
      ))}
    </div>
  );
}

function LFOItem({
  layerIndex,
  lfoIndex,
  lfo,
  dispatch,
}: {
  layerIndex: number;
  lfoIndex: number;
  lfo: LFO;
  dispatch: React.Dispatch<BuilderAction>;
}) {
  const set = (next: LFO) =>
    dispatch({ type: "update-lfo", index: layerIndex, lfoIndex, lfo: next });

  return (
    <div className={styles.inlineItem}>
      <div className={styles.inlineItemHeader}>
        <Select
          ariaLabel="LFO waveform"
          value={lfo.type}
          onValueChange={(type) => set({ ...lfo, type })}
          items={WAVEFORM_ITEMS}
        />
        <ActionButton
          intent="delete"
          className={styles.iconBtn}
          aria-label="Remove LFO"
          onClick={() =>
            dispatch({ type: "remove-lfo", index: layerIndex, lfoIndex })
          }
        >
          <TrashIcon size={12} />
        </ActionButton>
      </div>
      <div className={styles.inlineItemFields}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Target</span>
          <Select
            ariaLabel="LFO target"
            value={lfo.target}
            onValueChange={(target) => set({ ...lfo, target })}
            items={LFO_TARGET_ITEMS}
          />
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Frequency</span>
          <input
            type="number"
            className={styles.fieldInput}
            value={lfo.frequency}
            min={0.1}
            max={30}
            step={0.1}
            onChange={(e) => set({ ...lfo, frequency: Number(e.target.value) })}
          />
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Depth</span>
          <input
            type="number"
            className={styles.fieldInput}
            value={lfo.depth}
            min={0}
            max={5000}
            step={1}
            onChange={(e) => set({ ...lfo, depth: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
}
