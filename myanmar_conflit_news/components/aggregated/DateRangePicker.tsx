"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
}

export function DateRangePicker({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
}: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeInput, setActiveInput] = useState<"start" | "end">("start");
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return "Select month";
        const [year, month] = dateStr.split("-");
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
    };

    const handleMonthClick = (month: number) => {
        const dateStr = `${currentYear}-${String(month).padStart(2, "0")}-01`;

        if (activeInput === "start") {
            onStartDateChange(dateStr);
            setActiveInput("end");
        } else {
            onEndDateChange(dateStr);
            setIsOpen(false);
        }
    };

    const isMonthInRange = (month: number) => {
        if (!startDate || !endDate) return false;
        const checkDate = new Date(currentYear, month - 1);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return checkDate >= start && checkDate <= end;
    };

    const isMonthSelected = (month: number) => {
        const dateStr = `${currentYear}-${String(month).padStart(2, "0")}`;
        return startDate?.startsWith(dateStr) || endDate?.startsWith(dateStr);
    };


    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Generate year options from 2010 to current year + 1
    const currentYearActual = new Date().getFullYear();
    const years = Array.from({ length: currentYearActual - 2010 + 2 }, (_, i) => 2010 + i);

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Start Month
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            setIsOpen(!isOpen);
                            setActiveInput("start");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors hover:border-red-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-red-400"
                    >
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="flex-1 text-left">{formatDisplayDate(startDate)}</span>
                    </button>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        End Month
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            setIsOpen(!isOpen);
                            setActiveInput("end");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors hover:border-red-400 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-red-400"
                    >
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span className="flex-1 text-left">{formatDisplayDate(endDate)}</span>
                    </button>
                </div>
            </div>

            {isOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:w-auto sm:min-w-[320px]">
                    {/* Year Navigation */}
                    <div className="mb-4 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setCurrentYear(currentYear - 1)}
                            disabled={currentYear <= 2010}
                            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <select
                            value={currentYear}
                            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-semibold text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                            {years.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                        <button
                            type="button"
                            onClick={() => setCurrentYear(currentYear + 1)}
                            disabled={currentYear >= currentYearActual + 1}
                            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30 dark:text-gray-400 dark:hover:bg-gray-700"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Active Input Indicator */}
                    <div className="mb-3 flex gap-2 text-xs">
                        <span className={`rounded px-2 py-1 ${activeInput === "start" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                            {activeInput === "start" ? "Selecting Start" : "Start Selected"}
                        </span>
                        <span className={`rounded px-2 py-1 ${activeInput === "end" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                            {activeInput === "end" ? "Selecting End" : "End Selected"}
                        </span>
                    </div>

                    {/* Month Grid */}
                    <div className="grid grid-cols-3 gap-2">
                        {months.map((monthName, index) => {
                            const monthNum = index + 1;
                            const inRange = isMonthInRange(monthNum);
                            const selected = isMonthSelected(monthNum);

                            return (
                                <button
                                    key={monthName}
                                    type="button"
                                    onClick={() => handleMonthClick(monthNum)}
                                    className={`
                    rounded-lg px-3 py-2 text-sm font-medium transition-all
                    ${selected
                                            ? "bg-gradient-to-br from-red-600 to-orange-600 font-bold text-white shadow-md"
                                            : inRange
                                                ? "bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-300"
                                                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                                        }
                  `}
                                >
                                    {monthName}
                                </button>
                            );
                        })}
                    </div>


                </div>
            )}
        </div>
    );
}
