"use client";

import { NativeSelect, NativeSelectOption } from "@nestdrive/ui";
import { COUNTRIES, COUNTRY_CODES } from "@nestdrive/ui";

export function CountryInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <NativeSelect
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      {COUNTRY_CODES.map((code) => (
        <NativeSelectOption key={code} value={code}>
          {COUNTRIES[code]}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}
