import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { CustomSelect } from "./CustomSelect";

const options = [
  { value: "", label: "All types" },
  { value: "kpi", label: "KPIs" },
  { value: "goal", label: "Goals", disabled: true },
  { value: "project", label: "Projects" },
];

afterEach(cleanup);

function setup(value = "", disabled = false) {
  const input = vi.fn();
  render(<form onInput={input}>
    <div data-website-select>
      <select name="type" defaultValue={value} disabled={disabled} aria-label="Template type">
        {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
      </select>
      <CustomSelect label="Template type" options={options} />
    </div>
    <button type="reset">Reset</button>
  </form>);
  const native = document.querySelector("select");
  if (!native) throw new Error("Missing native select");
  return { native, input };
}

test("starts from the native value and submits the selected option exactly once", async () => {
  const { native, input } = setup("kpi");
  const trigger = await screen.findByRole("button", { name: "Template type: KPIs" });
  expect(native.hidden).toBe(true);
  fireEvent.click(trigger);
  fireEvent.click(await screen.findByRole("option", { name: "Projects" }));
  await screen.findByRole("button", { name: "Template type: Projects" });
  expect(native.value).toBe("project");
  expect(input).toHaveBeenCalledOnce();
  expect(Array.from(new FormData(native.form ?? undefined).entries())).toEqual([["type", "project"]]);
});

test("supports keyboard selection, skips disabled options, and closes on Escape", async () => {
  const { native } = setup("kpi");
  const trigger = await screen.findByRole("button", { name: "Template type: KPIs" });
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  const listbox = await screen.findByRole("listbox");
  await waitFor(() => expect(listbox.getAttribute("aria-activedescendant")).toBe(screen.getByRole("option", { name: "KPIs" }).id));
  fireEvent.keyDown(listbox, { key: "ArrowDown" });
  await waitFor(() => expect(listbox.getAttribute("aria-activedescendant")).toBe(screen.getByRole("option", { name: "Projects" }).id));
  fireEvent.keyDown(listbox, { key: "Enter" });
  await waitFor(() => expect(native.value).toBe("project"));
  fireEvent.click(trigger);
  fireEvent.keyDown(await screen.findByRole("listbox"), { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  expect(document.activeElement).toBe(trigger);
});

test("tracks URL restoration and native form resets", async () => {
  const { native } = setup();
  await screen.findByRole("button", { name: "Template type: All types" });
  act(() => {
    native.value = "project";
    native.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await screen.findByRole("button", { name: "Template type: Projects" });
  fireEvent.click(screen.getByRole("button", { name: "Reset" }));
  await screen.findByRole("button", { name: "Template type: All types" });
});

test("keeps a disabled select disabled", async () => {
  setup("", true);
  const trigger = await screen.findByRole("button", { name: "Template type: All types" });
  expect(trigger.hasAttribute("disabled")).toBe(true);
});
