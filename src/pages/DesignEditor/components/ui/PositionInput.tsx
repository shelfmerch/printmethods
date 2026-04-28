import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PositionInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

/**
 * Reusable numeric input for element positioning (0-100%).
 * Allows free text entry without cursor-jumping while typing.
 */
export const PositionInput: React.FC<PositionInputProps> = ({ label, value, onChange }) => {
  const [localValue, setLocalValue] = useState(value.toFixed(2));
  const [isFocused, setIsFocused] = useState(false);

  // Update local value when external value changes, but NOT while user is typing
  useEffect(() => {
    if (!isFocused) {
      const formattedValue = value.toFixed(2);
      if (parseFloat(localValue) !== value) {
        setLocalValue(formattedValue);
      }
    }
  }, [value, isFocused]);

  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{label}</Label>
      <div className="relative group">
        <Input
          type="text"
          inputMode="decimal"
          value={localValue}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            const val = parseFloat(localValue) || 0;
            onChange(val);
            setLocalValue(val.toFixed(2));
          }}
          onChange={(e) => {
            const newVal = e.target.value;
            setLocalValue(newVal);

            const numVal = parseFloat(newVal);
            if (!isNaN(numVal)) {
              onChange(numVal);
            }
          }}
          className="h-10 pr-8 font-medium transition-all group-hover:border-primary/40 focus:border-primary ring-0 focus-visible:ring-1 focus-visible:ring-primary/20"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground/60 select-none">
          %
        </div>
      </div>
    </div>
  );
};
