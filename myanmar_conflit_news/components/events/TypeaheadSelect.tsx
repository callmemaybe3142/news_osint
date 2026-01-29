"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

interface Option {
    value: string | number;
    label: string;
    sublabel?: string;
}

interface TypeaheadSelectProps {
    options: Option[];
    value: string | number | null;
    onChange: (value: string | number | null) => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
}

export function TypeaheadSelect({
    options,
    value,
    onChange,
    placeholder = "Select...",
    label,
    disabled = false,
}: TypeaheadSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter options based on search term
    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (option.sublabel && option.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Get selected option
    const selectedOption = options.find((opt) => opt.value === value);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === "Enter" || e.key === "ArrowDown") {
                setIsOpen(true);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
                break;
            case "Enter":
                e.preventDefault();
                if (filteredOptions[highlightedIndex]) {
                    onChange(filteredOptions[highlightedIndex].value);
                    setIsOpen(false);
                    setSearchTerm("");
                }
                break;
            case "Escape":
                setIsOpen(false);
                setSearchTerm("");
                break;
        }
    };

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm("");
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
        setSearchTerm("");
    };

    return (
        <div className="flex flex-col gap-1" ref={containerRef}>
            {label && (
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <div className="relative">
                <div
                    className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm dark:bg-gray-700 ${disabled
                            ? "cursor-not-allowed opacity-50 border-gray-300 dark:border-gray-600"
                            : "cursor-pointer border-gray-300 hover:border-red-500 dark:border-gray-600 dark:hover:border-red-500"
                        }`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        value={isOpen ? searchTerm : selectedOption?.label || ""}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            if (!isOpen) setIsOpen(true);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="flex-1 bg-transparent text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
                    />
                    <div className="flex items-center gap-1">
                        {value && !disabled && (
                            <button
                                onClick={handleClear}
                                className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </button>
                        )}
                        <ChevronDown
                            className={`h-4 w-4 text-gray-500 transition-transform dark:text-gray-400 ${isOpen ? "rotate-180" : ""
                                }`}
                        />
                    </div>
                </div>

                {/* Dropdown */}
                {isOpen && !disabled && (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                No options found
                            </div>
                        ) : (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`cursor-pointer px-3 py-2 text-sm ${index === highlightedIndex
                                            ? "bg-red-50 dark:bg-red-900/20"
                                            : "hover:bg-gray-50 dark:hover:bg-gray-600"
                                        } ${option.value === value
                                            ? "bg-red-100 font-semibold dark:bg-red-900/30"
                                            : ""
                                        }`}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                >
                                    <div className="text-gray-900 dark:text-white">
                                        {option.label}
                                    </div>
                                    {option.sublabel && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {option.sublabel}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
