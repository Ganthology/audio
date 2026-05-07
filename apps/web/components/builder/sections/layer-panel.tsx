"use client";

import type { Filter, Layer, LFO } from "@web-kits/audio";
import { useState } from "react";
import { ChevronIcon, TrashIcon } from "@/components/controls/icons";
import { ActionButton, SliderField, ToggleButton } from "../controls";
import type { BuilderAction } from "../state";
import styles from "../styles.module.css";
import { EffectEditor } from "./effect-editor";
import { EnvelopeEditor } from "./envelope-editor";
import { FilterEditor } from "./filter-editor";
import { LFOEditor } from "./lfo-editor";
import { SourceEditor } from "./source-editor";
import { SpatialEditor } from "./spatial-editor";

type Props = {
  index: number;
  layer: Layer;
  canRemove: boolean;
  dispatch: React.Dispatch<BuilderAction>;
};

function filtersArray(layer: Layer): Filter[] {
  if (!layer.filter) return [];
  return Array.isArray(layer.filter) ? layer.filter : [layer.filter];
}

function lfosArray(layer: Layer): LFO[] {
  if (!layer.lfo) return [];
  return Array.isArray(layer.lfo) ? layer.lfo : [layer.lfo];
}

export function LayerPanel({ index, layer, canRemove, dispatch }: Props) {
  const [open, setOpen] = useState(true);

  const sourceLabel =
    layer.source.type === "noise"
      ? `noise (${layer.source.color ?? "white"})`
      : layer.source.type;

  return (
    <div className={styles.layerPanel}>
      <div className={styles.layerHeader}>
        <ToggleButton
          className={styles.layerHeaderToggle}
          aria-controls={`layer-body-${index}`}
          open={open}
          onOpenChange={setOpen}
        >
          <ChevronIcon open={open} />
          <span className={styles.layerTitle}>Layer {index + 1}</span>
          <span className={styles.layerBadge}>{sourceLabel}</span>
        </ToggleButton>
        <span className={styles.layerActions}>
          {canRemove && (
            <ActionButton
              intent="delete"
              className={styles.iconBtn}
              aria-label={`Remove layer ${index + 1}`}
              onClick={() => dispatch({ type: "remove-layer", index })}
            >
              <TrashIcon size={12} />
            </ActionButton>
          )}
        </span>
      </div>

      {open && (
        <div id={`layer-body-${index}`} className={styles.layerBody}>
          <SourceEditor
            index={index}
            source={layer.source}
            dispatch={dispatch}
          />

          <EnvelopeEditor
            index={index}
            envelope={layer.envelope}
            dispatch={dispatch}
          />

          <div className={styles.section}>
            <span className={styles.sectionLabel}>Mix</span>
            <SliderField
              label="Gain"
              value={layer.gain ?? 1}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(gain) =>
                dispatch({ type: "set-gain", index, gain })
              }
              displayValue={(layer.gain ?? 1).toFixed(2)}
            />
            <SliderField
              label="Pan"
              value={layer.pan ?? 0}
              min={-1}
              max={1}
              step={0.01}
              onValueChange={(pan) => dispatch({ type: "set-pan", index, pan })}
              displayValue={(layer.pan ?? 0).toFixed(2)}
            />
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Delay</span>
              <input
                type="number"
                className={styles.fieldInput}
                value={layer.delay ?? 0}
                min={0}
                max={5}
                step={0.01}
                onChange={(e) =>
                  dispatch({
                    type: "set-delay",
                    index,
                    delay: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <FilterEditor
            index={index}
            filters={filtersArray(layer)}
            dispatch={dispatch}
          />

          <EffectEditor
            effects={layer.effects ?? []}
            onAdd={() => dispatch({ type: "add-effect", index })}
            onRemove={(ei) =>
              dispatch({ type: "remove-effect", index, effectIndex: ei })
            }
            onUpdate={(ei, effect) =>
              dispatch({
                type: "update-effect",
                index,
                effectIndex: ei,
                effect,
              })
            }
          />

          <LFOEditor
            index={index}
            lfos={lfosArray(layer)}
            dispatch={dispatch}
          />

          <SpatialEditor
            index={index}
            panner={layer.panner}
            dispatch={dispatch}
          />
        </div>
      )}
    </div>
  );
}
