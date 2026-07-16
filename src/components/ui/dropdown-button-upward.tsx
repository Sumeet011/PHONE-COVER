"use client"

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePathname } from "next/navigation"

// Inside your component


interface DropdownOption {
  value: string
  label: string
}



interface DropdownButtonProps {
  options: DropdownOption[]
  defaultOption?: string
  placeholder?: string
  onSelect?: (option: DropdownOption) => void
  className?: string
  buttonClassName?: string
  dropdownClassName?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  dropupMode?: boolean // Force dropdown to appear upwards
  disabled?: boolean
}

export function DropdownButton({
  options,
  defaultOption,
  placeholder = "Select an option",
  onSelect,
  className,
  buttonClassName,
  dropdownClassName,
  variant = 'outline',
  size = 'default',
  dropupMode = false,
  disabled = false
}: DropdownButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(
    defaultOption ? options.find(opt => opt.value === defaultOption) || null : null
  )
  const pathname = usePathname()
const isSpecificPage = pathname === "/specific" 
  const [dropdownPosition, setDropdownPosition] = useState<'up' | 'down'>('down')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Calculate dropdown position based on available space
  useEffect(() => {
    if (isOpen && buttonRef.current && !dropupMode) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const dropdownHeight = options.length * 40 + 16 // Approximate height
      
      const spaceBelow = viewportHeight - buttonRect.bottom
      const spaceAbove = buttonRect.top
      
      // Show dropdown upwards if there's more space above or not enough space below
      if (spaceAbove > spaceBelow && spaceBelow < dropdownHeight) {
        setDropdownPosition('up')
      } else {
        setDropdownPosition('down')
      }
    } else if (dropupMode) {
      setDropdownPosition('up')
    }
  }, [isOpen, options.length, dropupMode])

  const handleToggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const handleOptionSelect = (option: DropdownOption) => {
    setSelectedOption(option)
    setIsOpen(false)
    onSelect?.(option)
  }

  const getButtonVariantClasses = () => {

    const baseClasses = "inline-flex items-center justify-between gap-2 whitespace-nowrap rounded-md text-xs font-medium transition-all disabled:pointer-events-none disabled:opacity-50"
    
    const variantClasses = {
      default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
      outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
      secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
    }

    const sizeClasses = {
      sm: "h-6 px-2 text-[11px]",
      default: "h-8 md:h-9 px-3 py-1",
      lg: "h-13 px-5"
    }

    return cn(baseClasses, variantClasses[variant], sizeClasses[size])
  }

  const getDropdownClasses = () => {
    const baseClasses = "absolute w-full min-w-[150px] rounded-md border bg-popover p-1 shadow-md z-50 animate-in fade-in-0 zoom-in-95"
    
    if (dropdownPosition === 'up') {
      return cn(
        baseClasses,
        "bottom-full mb-1 data-[side=top]:slide-in-from-bottom-2",
        dropdownClassName
      )
    } else {
      return cn(
        baseClasses,
        "top-full mt-1 data-[side=bottom]:slide-in-from-top-2",
        dropdownClassName
      )
    }
  }

  return (
    
    <div className={cn("relative w-full text-left", className)} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        className={cn(
    getButtonVariantClasses(),
    "w-full min-w-full",
    buttonClassName
  )}
        onClick={handleToggleDropdown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {isOpen && (
        <div
          className={getDropdownClasses()}
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option.value}
              className={cn(
                "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                "transition-colors duration-150",
                selectedOption?.value === option.value && "bg-accent text-accent-foreground"
              )}
              onClick={() => handleOptionSelect(option)}
              role="option"
              aria-selected={selectedOption?.value === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Example usage component
export function DropdownButtonExample() {
  const [selectedValue, setSelectedValue] = useState<string>("")

  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
    { value: "option4", label: "Very Long Option Name" },
  ]

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Dropdown Button Examples</h3>
        
        <div className="flex flex-wrap gap-4">
          <DropdownButton
            options={options}
            placeholder="Choose an option"
            onSelect={(option) => setSelectedValue(option.value)}
            variant="outline"
          />
          
          <DropdownButton
            options={options}
            placeholder="Dropup Mode"
            variant="default"
            size="sm"
            dropupMode={true}
          />
          
          <DropdownButton
            options={options}
            defaultOption="option2"
            variant="secondary"
            size="lg"
          />
        </div>
        
        {selectedValue && (
          <p className="text-sm text-muted-foreground">
            Selected: {selectedValue}
          </p>
        )}
      </div>
    </div>
  )
}