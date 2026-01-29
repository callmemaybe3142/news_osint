"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Menu, X, Home, BarChart2, FileText, Info, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Event Data", href: "/event-data", icon: FileText },
    { name: "Aggregated Data", href: "/aggregate-data", icon: BarChart2 },
    { name: "About Data", href: "/about-data", icon: Info },
];

const externalLinks = [
    { name: "OSINT News", href: "https://news.d4a.site", icon: ExternalLink },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    return (
        <nav
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300",
                scrolled
                    ? "border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80 shadow-sm"
                    : "bg-transparent border-transparent"
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <span className="text-red-600 dark:text-red-500">Myanmar</span>
                        <span className="text-gray-900 transition-colors dark:text-white">
                            Conflict News
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center gap-6 md:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-red-600 dark:hover:text-red-400",
                                    pathname === item.href
                                        ? "text-red-600 dark:text-red-500 font-semibold"
                                        : !scrolled && pathname === "/"
                                            ? "text-gray-700 hover:text-red-600 dark:text-gray-200 dark:hover:text-white"
                                            : "text-gray-600 dark:text-gray-300"
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}

                        {/* External Links */}
                        {externalLinks.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                    "flex items-center gap-1 text-sm font-medium transition-colors hover:text-red-600 dark:hover:text-red-400",
                                    !scrolled && pathname === "/"
                                        ? "text-gray-700 hover:text-red-600 dark:text-gray-200 dark:hover:text-white"
                                        : "text-gray-600 dark:text-gray-300"
                                )}
                            >
                                {item.name}
                                <item.icon className="h-3 w-3" />
                            </a>
                        ))}

                        <div className="ml-4 border-l border-gray-200 pl-4 dark:border-gray-700">
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center gap-4 md:hidden">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={cn(
                                "rounded-md p-2 transition-colors",
                                !scrolled && pathname === "/"
                                    ? "text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-white/10"
                                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                            )}
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 md:hidden">
                    <div className="space-y-1 px-4 py-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                                    pathname === item.href
                                        ? "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        ))}
                        {externalLinks.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
