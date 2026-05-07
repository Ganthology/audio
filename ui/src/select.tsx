"use client";

import { Select as BaseSelect } from "@base-ui/react/select";
import type { ReactNode } from "react";
import styles from "./select.module.css";

type SelectItem<TValue extends string = string> = {
  value: TValue;
  label?: ReactNode;
  disabled?: boolean;
};

type SelectProps<TValue extends string = string> = {
  items: ReadonlyArray<SelectItem<TValue>>;
  value: TValue;
  onValueChange: (value: TValue) => void;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  popupClassName?: string;
  ariaLabel?: string;
  renderValue?: (value: TValue) => ReactNode;
  modal?: boolean;
  name?: string;
};

function joinClass(...classes: Array<string | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function ChevronIcon() {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 1l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.5 6l2.5 2.5L9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Select<TValue extends string = string>({
  items,
  value,
  onValueChange,
  onOpenChange,
  placeholder,
  disabled,
  className,
  triggerClassName,
  popupClassName,
  ariaLabel,
  renderValue,
  modal = false,
  name,
}: SelectProps<TValue>) {
  return (
    <BaseSelect.Root
      value={value}
      onValueChange={(next) => onValueChange(next as TValue)}
      onOpenChange={onOpenChange}
      disabled={disabled}
      modal={modal}
      name={name}
    >
      <BaseSelect.Trigger
        aria-label={ariaLabel}
        className={joinClass(styles.trigger, className, triggerClassName)}
      >
        <span className={styles.value}>
          {renderValue ? (
            renderValue(value)
          ) : (
            <BaseSelect.Value placeholder={placeholder} />
          )}
        </span>
        <BaseSelect.Icon className={styles.icon}>
          <ChevronIcon />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner sideOffset={6} alignItemWithTrigger={false}>
          <BaseSelect.Popup className={joinClass(styles.popup, popupClassName)}>
            {items.map((item) => (
              <BaseSelect.Item
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                className={styles.item}
              >
                <BaseSelect.ItemText>
                  {item.label ?? item.value}
                </BaseSelect.ItemText>
                <BaseSelect.ItemIndicator className={styles.itemIndicator}>
                  <CheckIcon />
                </BaseSelect.ItemIndicator>
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

export { Select, type SelectItem, type SelectProps };
