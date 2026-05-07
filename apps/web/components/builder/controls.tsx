"use client";

import {
  click as clickSound,
  collapse as collapseSound,
  _delete as deleteSound,
  expand as expandSound,
  select as selectSound,
  tap as tapSound,
} from "@audio/core";
import { Slider } from "@base-ui/react/slider";
import { useSound } from "@web-kits/audio/react";
import { Select as BaseUiSelect, type SelectProps } from "@web-kits/ui/select";
import { useCallback, useRef } from "react";
import styles from "./styles.module.css";

const SLIDER_TICK_THROTTLE_MS = 60;

/**
 * Select that plays sounds when opened and when the value changes.
 * Mirrors the @web-kits/ui Select API so callsites stay 1-line.
 */
export function Select<TValue extends string = string>(
  props: SelectProps<TValue>,
) {
  const playOpen = useSound(expandSound);
  const playChange = useSound(selectSound);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) playOpen();
      props.onOpenChange?.(open);
    },
    [playOpen, props.onOpenChange],
  );

  const handleValueChange = useCallback(
    (value: TValue) => {
      playChange();
      props.onValueChange(value);
    },
    [playChange, props.onValueChange],
  );

  return (
    <BaseUiSelect
      {...props}
      onOpenChange={handleOpenChange}
      onValueChange={handleValueChange}
    />
  );
}

type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (value: number) => void;
  displayValue: string;
};

/** Slider field with throttled tap sound on value change. */
export function SliderField({
  label,
  value,
  min,
  max,
  step,
  onValueChange,
  displayValue,
}: SliderFieldProps) {
  const playTap = useSound(tapSound);
  const lastTickRef = useRef(0);

  const handleValueChange = useCallback(
    (next: number | number[]) => {
      if (typeof next !== "number") return;
      const now = performance.now();
      if (now - lastTickRef.current > SLIDER_TICK_THROTTLE_MS) {
        lastTickRef.current = now;
        playTap();
      }
      onValueChange(next);
    },
    [onValueChange, playTap],
  );

  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <Slider.Root
        className={styles.sliderRoot}
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={handleValueChange}
      >
        <Slider.Control className={styles.sliderControl}>
          <Slider.Track className={styles.sliderTrack}>
            <Slider.Indicator className={styles.sliderIndicator} />
            <Slider.Thumb aria-label={label} className={styles.sliderThumb} />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
      <span className={styles.sliderValue}>{displayValue}</span>
    </div>
  );
}

type ActionButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  intent?: "click" | "delete";
};

/** Button that plays a click or delete sound on press. */
export function ActionButton({
  intent = "click",
  onClick,
  children,
  ...rest
}: ActionButtonProps) {
  const playClick = useSound(clickSound);
  const playDelete = useSound(deleteSound);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (intent === "delete") playDelete();
      else playClick();
      onClick?.(event);
    },
    [intent, onClick, playClick, playDelete],
  );

  return (
    <button type="button" onClick={handleClick} {...rest}>
      {children}
    </button>
  );
}

type ToggleButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> & {
  open: boolean;
  onOpenChange: (next: boolean) => void;
};

/** Toggle button that plays expand/collapse depending on next state. */
export function ToggleButton({
  open,
  onOpenChange,
  children,
  className,
  ...rest
}: ToggleButtonProps) {
  const playExpand = useSound(expandSound);
  const playCollapse = useSound(collapseSound);

  const handleClick = useCallback(() => {
    const next = !open;
    if (next) playExpand();
    else playCollapse();
    onOpenChange(next);
  }, [open, onOpenChange, playExpand, playCollapse]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-expanded={open}
      className={className}
      {...rest}
    >
      {children}
    </button>
  );
}
