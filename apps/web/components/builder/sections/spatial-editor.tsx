import type { Panner3D } from "@web-kits/audio";
import { ActionButton, Select } from "../controls";
import type { BuilderAction } from "../state";
import styles from "../styles.module.css";

type DistanceModel = NonNullable<Panner3D["distanceModel"]>;
type PanningModel = NonNullable<Panner3D["panningModel"]>;

const DISTANCE_MODEL_ITEMS: ReadonlyArray<{
  value: DistanceModel;
  label: string;
}> = [
  { value: "linear", label: "linear" },
  { value: "inverse", label: "inverse" },
  { value: "exponential", label: "exponential" },
];

const PANNING_MODEL_ITEMS: ReadonlyArray<{
  value: PanningModel;
  label: string;
}> = [
  { value: "equalpower", label: "equalpower" },
  { value: "HRTF", label: "HRTF" },
];

type Props = {
  index: number;
  panner: Panner3D | undefined;
  dispatch: React.Dispatch<BuilderAction>;
};

export function SpatialEditor({ index, panner, dispatch }: Props) {
  const enabled = !!panner;

  const set = (next: Panner3D | undefined) =>
    dispatch({ type: "set-panner", index, panner: next });

  const toggle = () => {
    if (enabled) {
      set(undefined);
    } else {
      set({ positionX: 0, positionY: 0, positionZ: 0 });
    }
  };

  const update = (patch: Partial<Panner3D>) => {
    if (!panner) return;
    set({ ...panner, ...patch });
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>Spatial (3D)</span>
        <ActionButton
          intent={enabled ? "delete" : "click"}
          className={styles.sectionAddBtn}
          onClick={toggle}
        >
          {enabled ? "Remove" : "Enable"}
        </ActionButton>
      </div>

      {panner && (
        <div className={styles.inlineItem}>
          <div className={styles.inlineItemFields}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>Position</span>
              <div className={styles.fieldRow}>
                {(["positionX", "positionY", "positionZ"] as const).map(
                  (axis) => (
                    <div key={axis} className={styles.fieldRowItem}>
                      <span className={styles.fieldRowLabel}>
                        {axis.slice(-1)}
                      </span>
                      <input
                        type="number"
                        className={styles.fieldInput}
                        value={panner[axis]}
                        step={0.5}
                        onChange={(e) =>
                          update({ [axis]: Number(e.target.value) })
                        }
                      />
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Panning</span>
              <Select
                ariaLabel="Panning model"
                value={panner.panningModel ?? "equalpower"}
                onValueChange={(panningModel) => update({ panningModel })}
                items={PANNING_MODEL_ITEMS}
              />
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Distance</span>
              <Select
                ariaLabel="Distance model"
                value={panner.distanceModel ?? "inverse"}
                onValueChange={(distanceModel) => update({ distanceModel })}
                items={DISTANCE_MODEL_ITEMS}
              />
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Ref dist</span>
              <input
                type="number"
                className={styles.fieldInput}
                value={panner.refDistance ?? 1}
                min={0}
                step={0.5}
                onChange={(e) =>
                  update({ refDistance: Number(e.target.value) })
                }
              />
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Max dist</span>
              <input
                type="number"
                className={styles.fieldInput}
                value={panner.maxDistance ?? 10000}
                min={0}
                onChange={(e) =>
                  update({ maxDistance: Number(e.target.value) })
                }
              />
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>Rolloff</span>
              <input
                type="number"
                className={styles.fieldInput}
                value={panner.rolloffFactor ?? 1}
                min={0}
                max={10}
                step={0.1}
                onChange={(e) =>
                  update({ rolloffFactor: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
