"use client";

import type { Effect } from "@web-kits/audio";
import { useRef, useState } from "react";
import { ChevronIcon, PlusIcon } from "@/components/controls/icons";
import { ActionButton, ToggleButton } from "../controls";
import styles from "../styles.module.css";
import { EffectItem } from "./effect-editor";

type Props = {
  effects: Effect[];
  onAdd: () => void;
  onRemove: (i: number) => void;
  onUpdate: (i: number, effect: Effect) => void;
};

let nextEffectId = 0;

export function MasterEffectsPanel({
  effects,
  onAdd,
  onRemove,
  onUpdate,
}: Props) {
  const [open, setOpen] = useState(true);
  const ids = useRef(new WeakMap<Effect, string>());

  function getKey(effect: Effect) {
    let id = ids.current.get(effect);
    if (!id) {
      id = `master-effect-${++nextEffectId}`;
      ids.current.set(effect, id);
    }
    return id;
  }

  return (
    <div className={styles.layerPanel}>
      <div className={styles.layerHeader}>
        <ToggleButton
          className={styles.layerHeaderToggle}
          aria-controls="master-effects-body"
          open={open}
          onOpenChange={setOpen}
        >
          <ChevronIcon open={open} />
          <span className={styles.layerTitle}>Master effects</span>
          <span className={styles.layerBadge}>
            {effects.length === 0
              ? "none"
              : `${effects.length} ${effects.length === 1 ? "effect" : "effects"}`}
          </span>
        </ToggleButton>
        <span className={styles.layerActions}>
          <ActionButton
            className={styles.sectionAddBtn}
            aria-label="Add master effect"
            onClick={onAdd}
          >
            <PlusIcon size={10} /> Add
          </ActionButton>
        </span>
      </div>

      {open && (
        <div id="master-effects-body" className={styles.layerBody}>
          {effects.length === 0 ? (
            <p className={styles.layerBodyEmpty}>
              No master effects. Add one to apply across all layers.
            </p>
          ) : (
            effects.map((effect, i) => (
              <EffectItem
                key={getKey(effect)}
                effect={effect}
                onRemove={() => onRemove(i)}
                onUpdate={(e) => onUpdate(i, e)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
