import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-orange-50 py-5 text-gray-900 dark:from-red-950 dark:via-gray-900 dark:to-black dark:text-white">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            </div>

            {/* Gradient orbs */}
            <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-red-600 opacity-20 blur-3xl dark:opacity-20" />
            <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-orange-600 opacity-20 blur-3xl dark:opacity-20" />

            <div className="container relative mx-auto px-4 pt-16">
                <div className="mx-auto max-w-4xl text-center">
                    {/* Alert badge */}
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 backdrop-blur-sm">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-300">
                            Myanmar Conflict Events
                        </span>
                    </div>

                    {/* Main heading */}
                    <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-6xl lg:text-7xl">
                        Myanmar Conflict
                        <span className="block bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent dark:from-red-400 dark:to-orange-400">
                            Data Dashboard
                        </span>
                    </h1>

                    {/* Description */}
                    <p className="mb-8 text-lg text-gray-600 dark:text-gray-300 md:text-xl">
                        Comprehensive analysis of conflict events in Myanmar based on ACLED
                        (Armed Conflict Location & Event Data Project) data. Track events,
                        fatalities, and regional impacts. Event data are 12 month-lag and
                        aggregated data are 1 week lag.
                    </p>

                    {/* CTA Buttons */}
                    {/* Navigation Cards */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Aggregated Data Card */}
                        <Link
                            href="/aggregate-data"
                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white/60 p-6 backdrop-blur-sm transition-all hover:border-red-500/50 hover:bg-red-50 hover:shadow-xl hover:shadow-red-600/20 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                        >
                            <div className="mb-4 inline-flex rounded-lg bg-red-100 p-3 dark:bg-red-600">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-6 w-6 text-red-600 dark:text-white"
                                >
                                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                                    <path d="M22 12A10 10 0 0 0 12 2v10z" />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                                Aggregated Data
                            </h3>
                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                                ACLED aggregated data with 1 week-lag. Counts of events and fatalities grouped by week, state/region, event type and sub-event types.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-semibold text-red-600 transition-colors group-hover:text-red-500 dark:text-red-400 dark:group-hover:text-red-300">
                                Explore Data
                                <svg
                                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </div>
                        </Link>

                        {/* Event Data Card */}
                        <Link
                            href="/event-data"
                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white/60 p-6 backdrop-blur-sm transition-all hover:border-orange-500/50 hover:bg-orange-50 hover:shadow-xl hover:shadow-orange-600/20 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                        >
                            <div className="mb-4 inline-flex rounded-lg bg-orange-100 p-3 dark:bg-orange-600">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-6 w-6 text-orange-600 dark:text-white"
                                >
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                                Event Data
                            </h3>
                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                                ACLED detailed events with 1 year lag. Includes news, actors, events, sub-events, sources, locations and interactions.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 transition-colors group-hover:text-orange-500 dark:text-orange-400 dark:group-hover:text-orange-300">
                                View Events
                                <svg
                                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </div>
                        </Link>

                        {/* About Data Card */}
                        <Link
                            href="/about-data"
                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white/60 p-6 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:bg-blue-50 hover:shadow-xl hover:shadow-blue-600/20 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                        >
                            <div className="mb-4 inline-flex rounded-lg bg-blue-100 p-3 dark:bg-blue-600">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-6 w-6 text-blue-600 dark:text-white"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 16v-4" />
                                    <path d="M12 8h.01" />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                                About Data
                            </h3>
                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                                Learn about the data sources, methodology, and how to interpret the information presented in this dashboard.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors group-hover:text-blue-500 dark:text-blue-400 dark:group-hover:text-blue-300">
                                Learn More
                                <svg
                                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                                    />
                                </svg>
                            </div>
                        </Link>

                        {/* OSINT News Card */}
                        <a
                            href="https://news.d4a.site"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white/60 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:bg-purple-50 hover:shadow-xl hover:shadow-purple-600/20 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                        >
                            <div className="mb-4 inline-flex rounded-lg bg-purple-100 p-3 dark:bg-purple-600">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-6 w-6 text-purple-600 dark:text-white"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" x2="22" y1="12" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                                OSINT News
                            </h3>
                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                                Telegram scraping from various sources since January 2021. Full-text search for news and open source intelligence related to Myanmar conflict.
                            </p>
                            <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 transition-colors group-hover:text-purple-500 dark:text-purple-400 dark:group-hover:text-purple-300">
                                Visit Site
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                    />
                                </svg>
                            </div>
                        </a>
                    </div>

                    {/* Data source badge */}
                    <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
                        <p>
                            Data Source:{" "}
                            <a
                                href="https://acleddata.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300"
                            >
                                ACLED
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
