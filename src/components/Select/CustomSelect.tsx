import React, { useEffect, useRef, useState } from "react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import "./select.css";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface Props {
  label: string;
  options: SelectOption[];
}

/** Enhances the sibling native select without taking ownership of its form. */
export function CustomSelect({ label, options }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [native, setNative] = useState<HTMLSelectElement | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const select = host.current?.closest("[data-website-select]")?.querySelector("select");
    if (!select) return;
    const sync = () => setValue(select.value);
    // Run after the browser's default form reset or a controller's reset handler.
    const reset = () => queueMicrotask(sync);
    sync();
    setNative(select);
    select.addEventListener("input", sync);
    select.addEventListener("change", sync);
    const form = select.form;
    form?.addEventListener("reset", reset);
    return () => {
      select.removeEventListener("input", sync);
      select.removeEventListener("change", sync);
      form?.removeEventListener("reset", reset);
    };
  }, []);

  useEffect(() => {
    if (!native) return;
    native.hidden = true;
    return () => { native.hidden = false; };
  }, [native]);

  const selectValue = (next: string) => {
    if (!native) return;
    native.value = next;
    setValue(next);
    native.dispatchEvent(new Event("input", { bubbles: true }));
    native.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const selected = options.find((option) => option.value === value);

  return <div ref={host} className="website-select-enhancement">
    {native && <Listbox value={value} onChange={selectValue} disabled={native.disabled}>
      <ListboxButton className="website-select-trigger" aria-label={`${label}: ${selected?.label ?? ""}`}>
        <span>{selected?.label}</span>
        <ChevronDown size={16} strokeWidth={1.7} className="website-select-chevron" aria-hidden="true" />
      </ListboxButton>
      <ListboxOptions anchor={{ to: "bottom start", gap: 6, padding: 12 }} modal={false} className="website-select-menu">
        {options.map((option) => <ListboxOption key={option.value} value={option.value} disabled={option.disabled} className="website-select-option">
          {({ selected }) => <>
            <span>{option.label}</span>
            <Check size={16} strokeWidth={2} className={selected ? "website-select-check" : "website-select-check invisible"} aria-hidden="true" />
          </>}
        </ListboxOption>)}
      </ListboxOptions>
    </Listbox>}
  </div>;
}
