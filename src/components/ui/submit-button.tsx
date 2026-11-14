"use client";

import { type ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">;

/**
 * A form's submit button that shows the form is working.
 *
 * Server actions round-trip to the database and re-render the page, which can
 * take a second; without feedback a click looks ignored and gets repeated.
 * While the form's action is pending every SubmitButton in that form is
 * disabled (no double submits), and the one that was pressed gets
 * `data-pending`, which globals.css turns into a spinner. "The one pressed" is
 * the button whose name/value is in the submitted data; a button without a name
 * is the pressed one whenever its form is pending.
 *
 * Only forms with a function `action` report pending, so on a plain GET form
 * this is an ordinary button.
 */
export function SubmitButton({ disabled, name, value, ...props }: Props) {
  const { pending, data } = useFormStatus();
  const pressed =
    pending && (name === undefined || data?.get(name) === (value === undefined ? "" : String(value)));

  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={disabled || pending}
      aria-busy={pressed || undefined}
      data-pending={pressed ? "" : undefined}
      {...props}
    />
  );
}
