"use client";
import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface QuantitySelectorProps {
  initialValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

export function QuantitySelector({
  initialValue = 0,
  min = 0,
  max = 999,
  onChange
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialValue);

  // Sync internal state when initialValue changes
  useEffect(() => {
    setQuantity(initialValue);
  }, [initialValue]);

  const handleIncrease = () => {
    if (quantity < max) {
      const newValue = quantity + 1;
      setQuantity(newValue);
      onChange?.(newValue);
    }
  };

  const handleDecrease = () => {
    if (quantity > min) {
      const newValue = quantity - 1;
      setQuantity(newValue);
      onChange?.(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty string temporarily for editing
    if (inputValue === '') {
      setQuantity(0);
      return;
    }
    
    const value = parseInt(inputValue, 10);
    if (!isNaN(value)) {
      if (value >= min && value <= max) {
        setQuantity(value);
        onChange?.(value);
      } else if (value < min) {
        setQuantity(min);
        onChange?.(min);
      } else if (value > max) {
        setQuantity(max);
        onChange?.(max);
      }
    }
  };

  const handleInputBlur = () => {
    // If quantity is 0 or less than min, reset to min value
    if (quantity < min) {
      setQuantity(min);
      onChange?.(min);
    }
  };

  return (
    <div className="flex h-10 md:h-12 items-center border border-gray-300 rounded-md">
      <button
        type="button"
        onClick={handleDecrease}
        disabled={quantity <= min}
        className="p-1 h-fit sm:p-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronDown className="w-4 h-4" />
      </button>
      
      <input
        type="number"
        value={quantity.toString().replace(/^0+/, '') || '0'}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        min={min}
        max={max}
        className="w-8 sm:w-12 text-center border-0 focus:outline-none focus:ring-0 bg-transparent"
      />
      
      <button
        type="button"
        onClick={handleIncrease}
        disabled={quantity >= max}
        className="p-1 sm:p-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronUp className="w-4 h-4" />
      </button>
    </div>
  );
}