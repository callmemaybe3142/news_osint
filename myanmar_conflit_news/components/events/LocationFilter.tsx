"use client";

import { useEffect } from "react";
import { TypeaheadSelect } from "./TypeaheadSelect";

interface Location {
    admin1: string;
    admin2: string;
    admin3: string;
}

interface LocationFilterProps {
    locations: Location[];
    admin1: string;
    admin2: string;
    admin3: string;
    onAdmin1Change: (value: string) => void;
    onAdmin2Change: (value: string) => void;
    onAdmin3Change: (value: string) => void;
}

export function LocationFilter({
    locations,
    admin1,
    admin2,
    admin3,
    onAdmin1Change,
    onAdmin2Change,
    onAdmin3Change,
}: LocationFilterProps) {
    // Get unique admin1 values
    const admin1Options = Array.from(
        new Set((locations || []).map((loc) => loc.admin1).filter(Boolean))
    )
        .sort()
        .map((value) => ({ value, label: value }));

    // Get admin2 values filtered by admin1
    const admin2Options = Array.from(
        new Set(
            (locations || [])
                .filter((loc) => !admin1 || loc.admin1 === admin1)
                .map((loc) => loc.admin2)
                .filter(Boolean)
        )
    )
        .sort()
        .map((value) => ({ value, label: value }));

    // Get admin3 values filtered by admin1 and admin2
    const admin3Options = Array.from(
        new Set(
            (locations || [])
                .filter((loc) => {
                    if (admin1 && loc.admin1 !== admin1) return false;
                    if (admin2 && loc.admin2 !== admin2) return false;
                    return true;
                })
                .map((loc) => loc.admin3)
                .filter(Boolean)
        )
    )
        .sort()
        .map((value) => ({ value, label: value }));

    // Auto-fill parent levels when child is selected (backward filling)
    useEffect(() => {
        if (admin3 && !admin2) {
            // Find the admin2 for this admin3
            const location = locations.find((loc) => loc.admin3 === admin3);
            if (location && location.admin2) {
                onAdmin2Change(location.admin2);
            }
        }
    }, [admin3, admin2, locations, onAdmin2Change]);

    useEffect(() => {
        if (admin2 && !admin1) {
            // Find the admin1 for this admin2
            const location = locations.find((loc) => loc.admin2 === admin2);
            if (location && location.admin1) {
                onAdmin1Change(location.admin1);
            }
        }
    }, [admin2, admin1, locations, onAdmin1Change]);

    // Clear child levels when parent changes
    const handleAdmin1Change = (value: string | number | null) => {
        onAdmin1Change(value as string || "");
        if (!value) {
            onAdmin2Change("");
            onAdmin3Change("");
        } else if (admin2) {
            // Check if current admin2 is valid for new admin1
            const isValid = locations.some(
                (loc) => loc.admin1 === value && loc.admin2 === admin2
            );
            if (!isValid) {
                onAdmin2Change("");
                onAdmin3Change("");
            }
        }
    };

    const handleAdmin2Change = (value: string | number | null) => {
        onAdmin2Change(value as string || "");
        if (!value) {
            onAdmin3Change("");
        } else if (admin3) {
            // Check if current admin3 is valid for new admin2
            const isValid = locations.some(
                (loc) => loc.admin2 === value && loc.admin3 === admin3
            );
            if (!isValid) {
                onAdmin3Change("");
            }
        }
    };

    const handleAdmin3Change = (value: string | number | null) => {
        onAdmin3Change(value as string || "");
    };

    return (
        <div className="space-y-4">
            <TypeaheadSelect
                label="State / Region (Admin1)"
                options={admin1Options}
                value={admin1}
                onChange={handleAdmin1Change}
                placeholder="Select state/region..."
            />

            <TypeaheadSelect
                label="District (Admin2)"
                options={admin2Options}
                value={admin2}
                onChange={handleAdmin2Change}
                placeholder="Select district..."
                disabled={admin2Options.length === 0}
            />

            <TypeaheadSelect
                label="Township (Admin3)"
                options={admin3Options}
                value={admin3}
                onChange={handleAdmin3Change}
                placeholder="Select township..."
                disabled={admin3Options.length === 0}
            />
        </div>
    );
}
