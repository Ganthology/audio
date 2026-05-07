import type { BiquadFilterType, Filter } from "@web-kits/audio";
import { useRef } from "react";
import { PlusIcon, TrashIcon } from "@/components/controls/icons";
import { ActionButton, Select } from "../controls";
import type { BuilderAction } from "../state";
import styles from "../styles.module.css";

const BIQUAD_TYPE_ITEMS: ReadonlyArray<{
  value: BiquadFilterType;
  label: string;
}> = [
  { value: "lowpass", label: "lowpass" },
  { value: "highpass", label: "highpass" },
  { value: "bandpass", label: "bandpass" },
  { value: "notch", label: "notch" },
  { value: "allpass", label: "allpass" },
  { value: "peaking", label: "peaking" },
  { value: "lowshelf", label: "lowshelf" },
  { value: "highshelf", label: "highshelf" },
];

type Props = {
  index: number;
  filters: Filter[];
  dispatch: React.Dispatch<BuilderAction>;
};

let nextFilterId = 0;

export function FilterEditor({ index, filters, dispatch }: Props) {
  const ids = useRef(new WeakMap<Filter, string>());

  function getKey(filter: Filter) {
    let id = ids.current.get(filter);
    if (!id) {
      id = `filter-${++nextFilterId}`;
      ids.current.set(filter, id);
    }
    return id;
  }

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Filters</span>
        <ActionButton
          className={styles.sectionAddBtn}
          onClick={() => dispatch({ type: "add-filter", index })}
        >
          <PlusIcon size={10} /> Add
        </ActionButton>
      </div>

      {filters.map((filter, fi) => (
        <FilterItem
          key={getKey(filter)}
          layerIndex={index}
          filterIndex={fi}
          filter={filter}
          dispatch={dispatch}
        />
      ))}
    </div>
  );
}

function FilterItem({
  layerIndex,
  filterIndex,
  filter,
  dispatch,
}: {
  layerIndex: number;
  filterIndex: number;
  filter: Filter;
  dispatch: React.Dispatch<BuilderAction>;
}) {
  if (filter.type === "iir") return null;

  const set = (next: Filter) =>
    dispatch({
      type: "update-filter",
      index: layerIndex,
      filterIndex,
      filter: next,
    });

  return (
    <div className={styles.inlineItem}>
      <div className={styles.inlineItemHeader}>
        <Select
          ariaLabel="Filter type"
          value={filter.type}
          onValueChange={(type) => set({ ...filter, type })}
          items={BIQUAD_TYPE_ITEMS}
        />
        <ActionButton
          intent="delete"
          className={styles.iconBtn}
          aria-label="Remove filter"
          onClick={() =>
            dispatch({ type: "remove-filter", index: layerIndex, filterIndex })
          }
        >
          <TrashIcon size={12} />
        </ActionButton>
      </div>
      <div className={styles.inlineItemFields}>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Frequency</span>
          <input
            type="number"
            className={styles.fieldInput}
            value={filter.frequency}
            min={20}
            max={20000}
            onChange={(e) =>
              set({ ...filter, frequency: Number(e.target.value) })
            }
          />
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Q</span>
          <input
            type="number"
            className={styles.fieldInput}
            value={filter.resonance ?? 1}
            min={0.1}
            max={30}
            step={0.1}
            onChange={(e) =>
              set({ ...filter, resonance: Number(e.target.value) })
            }
          />
        </div>
        {(filter.type === "peaking" ||
          filter.type === "lowshelf" ||
          filter.type === "highshelf") && (
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Gain</span>
            <input
              type="number"
              className={styles.fieldInput}
              value={filter.gain ?? 0}
              min={-24}
              max={24}
              step={0.5}
              onChange={(e) => set({ ...filter, gain: Number(e.target.value) })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
