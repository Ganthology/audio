"use client";

import type { AudioAnalyser } from "@web-kits/audio";
import {
  createMasterAnalyser,
  defineSound,
  ensureReady,
} from "@web-kits/audio";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { CopyButton } from "@/components/code-block/client";
import {
  ChevronIcon,
  PlayIcon,
  PlusIcon,
  SpeakerIcon,
} from "@/components/controls/icons";
import { CodePreview } from "./code-preview";
import { ActionButton, ToggleButton } from "./controls";
import { LayerPanel } from "./sections/layer-panel";
import { MasterEffectsPanel } from "./sections/master-effects-panel";
import {
  builderReducer,
  createInitialBuilderState,
  serializeToCode,
  toDefinition,
} from "./state";
import styles from "./styles.module.css";

export function SoundBuilder() {
  const [state, dispatch] = useReducer(
    builderReducer,
    undefined,
    createInitialBuilderState,
  );
  const [active, setActive] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyserRef = useRef<AudioAnalyser | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const waveformStarted = useRef(false);
  const startWaveformRef = useRef<() => void>(() => {});

  const definition = useMemo(() => toDefinition(state), [state]);
  const code = useMemo(() => serializeToCode(state), [state]);
  const definitionRef = useRef(definition);
  definitionRef.current = definition;

  const handlePlay = useCallback(async () => {
    await ensureReady();
    if (!analyserRef.current) {
      analyserRef.current = createMasterAnalyser({
        fftSize: 2048,
        smoothingTimeConstant: 0.45,
      });
    }
    if (!waveformStarted.current) {
      waveformStarted.current = true;
      startWaveformRef.current();
    }
    const play = defineSound(structuredClone(definitionRef.current));
    play();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActive(true);
    timeoutRef.current = setTimeout(() => setActive(false), 400);
  }, []);

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width * dpr;
    const h = rect.height * dpr;

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const data = analyser.getTimeDomainData();
    const len = data.length;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(128,128,128,0.06)";
    ctx.lineWidth = dpr;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    const cs = getComputedStyle(canvas);
    ctx.strokeStyle = cs.getPropertyValue("--ds-gray-8").trim() || "#999";
    ctx.lineWidth = 1.5 * dpr;
    ctx.lineJoin = "round";
    ctx.beginPath();

    const sliceW = w / len;
    for (let i = 0; i < len; i++) {
      const v = data[i] / 128.0;
      const y = (v * h) / 2;
      if (i === 0) ctx.moveTo(0, y);
      else ctx.lineTo(i * sliceW, y);
    }
    ctx.stroke();
    rafRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  const startWaveform = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(drawWaveform);
  }, [drawWaveform]);

  startWaveformRef.current = startWaveform;

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className={styles.builder}>
      <div className={styles.header}>
        <div className={styles.waveform}>
          <canvas ref={canvasRef} className={styles.canvas} />
        </div>
        <button
          type="button"
          className={styles.playBtn}
          data-active={active || undefined}
          onClick={handlePlay}
          aria-label="Play sound"
        >
          {active ? <SpeakerIcon size={12} /> : <PlayIcon size={12} />}
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.panels}>
          {state.layers.map((layer, i) => (
            <LayerPanel
              key={layer._id}
              index={i}
              layer={layer}
              canRemove={state.layers.length > 1}
              dispatch={dispatch}
            />
          ))}

          {(state.effects.length > 0 || state.layers.length > 1) && (
            <MasterEffectsPanel
              effects={state.effects}
              onAdd={() => dispatch({ type: "add-master-effect" })}
              onRemove={(i) =>
                dispatch({ type: "remove-master-effect", effectIndex: i })
              }
              onUpdate={(i, effect) =>
                dispatch({
                  type: "update-master-effect",
                  effectIndex: i,
                  effect,
                })
              }
            />
          )}

          <ActionButton
            className={styles.addBtn}
            onClick={() => dispatch({ type: "add-layer" })}
          >
            <PlusIcon size={12} /> Add layer
          </ActionButton>
        </div>

        <div className={styles.codeSection}>
          <div className={styles.codeToolbar}>
            <ToggleButton
              className={styles.codeToolbarToggle}
              open={codeOpen}
              onOpenChange={setCodeOpen}
              aria-controls="sound-builder-generated-code"
              id="sound-builder-code-toggle"
            >
              <ChevronIcon open={codeOpen} size={12} />
              <span className={styles.codeToolbarLabel}>
                Generated code
                <span className={styles.codeToolbarFile}>sound.ts</span>
              </span>
            </ToggleButton>
            <CopyButton text={code} />
          </div>
          {codeOpen ? (
            <section
              className={styles.codeExpand}
              id="sound-builder-generated-code"
              aria-labelledby="sound-builder-code-toggle"
            >
              <CodePreview code={code} />
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
