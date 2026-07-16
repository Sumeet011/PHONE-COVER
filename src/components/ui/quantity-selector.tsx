"use client";
import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface QuantitySelectorProps {
  initialValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  compact?: boolean;
  label?: string;
  fullWidthUntilLg?: boolean;
  tone?: 'dark' | 'light';
}

export function QuantitySelector({
  initialValue = 0,
  min = 0,
  max = 999,
  onChange,
  disabled = false,
  compact = false,
  label,
  fullWidthUntilLg = false,
  tone = 'dark'
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialValue);
  const [inputValue, setInputValue] = useState(String(initialValue));

  // Sync internal state when initialValue changes
  useEffect(() => {
    setQuantity(initialValue);
    setInputValue(String(initialValue));
  }, [initialValue]);

  const handleIncrease = () => {
    if (disabled || quantity >= max) return;
    const newValue = quantity + 1;
    setQuantity(newValue);
    setInputValue(String(newValue));
    onChange?.(newValue);
  };

  const handleDecrease = () => {
    if (disabled || quantity <= min) return;
    const newValue = quantity - 1;
    setQuantity(newValue);
    setInputValue(String(newValue));
    onChange?.(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const inputValue = e.target.value;
    
    // Allow empty string temporarily for editing
    if (inputValue === '') {
      setInputValue('');
      return;
    }
    
    const value = parseInt(inputValue, 10);
    if (!isNaN(value)) {
      if (value >= min && value <= max) {
        setQuantity(value);
        setInputValue(String(value));
        onChange?.(value);
      } else if (value < min) {
        setQuantity(min);
        setInputValue(String(min));
        onChange?.(min);
      } else if (value > max) {
        setQuantity(max);
        setInputValue(String(max));
        onChange?.(max);
      }
    }
  };

  const handleInputBlur = () => {
    // Normalize empty or out-of-range values once editing ends.
    if (inputValue === '' || quantity < min) {
      setQuantity(min);
      setInputValue(String(min));
      onChange?.(min);
    }
  };

  const isLight = tone === 'light';
  const containerClasses = `flex ${compact ? 'h-8' : 'h-9'} ${fullWidthUntilLg ? 'w-full lg:w-auto' : 'w-full sm:w-auto'} items-center overflow-hidden rounded-md  ${isLight ? 'border-[#e5dacb] bg-[#faf7f2]' : 'border-gray-300 bg-[#111111]'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;


  const buttonClasses = `h-full flex items-center justify-center transition-colors px-3 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${isLight ? 'text-[#17120f] hover:bg-[#efe6da]' : 'text-white hover:bg-gray-800'}`;


  const inputClasses = `${compact ? 'w-2 text-sm' : label ? ' w-10 sm:min-w-[2rem]' : ' sm:w-4'} text-center border-0 focus:outline-none focus:ring-0 bg-transparent disabled:cursor-not-allowed shrink-0 ${isLight ? 'text-[#17120f]' : 'text-white'}`;

  if (label) {
    return (
      <div className={`${containerClasses} text-sm font-medium`}>
        <span className="truncate text-white pl-4  min-w-0">{label}</span>

        <button
          type="button"
          onClick={handleDecrease}
          disabled={disabled || quantity <= min}
          className={buttonClasses}
        >
          <ChevronDown className={compact ? "w-3 h-3" : "w-4 h-4"} />
        </button>

        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          min={min}
          max={max}
          disabled={disabled}
          className={inputClasses}
        />

        <button
          type="button"
          onClick={handleIncrease}
          disabled={disabled || quantity >= max}
          className={buttonClasses}
        >
          <ChevronUp className={compact ? "w-3 h-3" : "w-4 h-4"} />
        </button>
      </div>
    );
  }

  return (
    <div className={containerClasses}>

      <button
        type="button"
        onClick={handleDecrease}
        disabled={disabled || quantity <= min}
        className={buttonClasses}
      >
        <ChevronDown className={compact ? "w-3 h-3" : "w-4 h-4"} />
      </button>
      
      <input
        type="text"
        inputMode="numeric"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        min={min}
        max={max}
        disabled={disabled}
        className={inputClasses}
      />
      
      <button
        type="button"
        onClick={handleIncrease}
        disabled={disabled || quantity >= max}
        className={buttonClasses}
      >
        <ChevronUp className={compact ? "w-3 h-3" : "w-4 h-4"} />
      </button>
    </div>
  );
}