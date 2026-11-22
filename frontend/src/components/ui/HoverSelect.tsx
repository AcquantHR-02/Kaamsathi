"use client";

import { useRef, useState } from "react";
import { Select, type SelectProps } from "antd";

// AntD Select that also opens on hover (user wish for filter dropdowns). Click / keyboard / touch still
// work as usual. A short close delay lets the pointer travel from the box into the option list.

const CLOSE_DELAY_MS = 150;

export default function HoverSelect<V = string>(props: SelectProps<V>) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const keepOpen = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const closeSoon = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  return (
    <Select<V>
      {...props}
      open={open}
      onOpenChange={(next) => {
        clearTimeout(closeTimer.current);
        setOpen(next);
        props.onOpenChange?.(next);
      }}
      onMouseEnter={keepOpen}
      onMouseLeave={closeSoon}
      onChange={(value, option) => {
        setOpen(false);
        props.onChange?.(value, option);
      }}
      popupRender={(menu) => (
        <div onMouseEnter={keepOpen} onMouseLeave={closeSoon}>
          {props.popupRender ? props.popupRender(menu) : menu}
        </div>
      )}
    />
  );
}
