import { Database, Shield, TrendingUp, Globe } from "lucide-react";

export function AboutSection() {
    const features = [
        {
            icon: Database,
            title: "Comprehensive Data",
            description:
                "Access to detailed conflict event data from ACLED, covering battles, violence against civilians, protests, and strategic developments.",
        },
        {
            icon: TrendingUp,
            title: "Analytics",
            description:
                "12 month-lag for event data and real time for aggregated data according to the ACLED data rules.",
        },
        {
            icon: Shield,
            title: "Verified Sources",
            description:
                "All data is sourced from ACLED, a trusted organization that collects and analyzes conflict data from around the world.",
        },
        {
            icon: Globe,
            title: "Regional Insights",
            description:
                "Detailed breakdown by administrative regions, allowing for granular analysis of conflict patterns across Myanmar.",
        },
    ];

    return (
        <section id="about" className="bg-gray-50 py-20 dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-6xl">
                    {/* Section header */}
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
                            About This Dashboard
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-400">
                            This platform provides comprehensive analysis of conflict events in
                            Myanmar using data from the Armed Conflict Location & Event Data
                            Project (ACLED).
                        </p>
                    </div>

                    {/* Features grid */}
                    <div className="grid gap-8 md:grid-cols-2">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl dark:bg-gray-800"
                            >
                                <div className="mb-4 inline-flex rounded-xl bg-red-100 p-3 dark:bg-red-900/30">
                                    <feature.icon className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* ACLED info */}
                    <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-900 dark:bg-red-950/30">
                        <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                            What is ACLED?
                        </h3>
                        <p className="mb-4 text-gray-700 dark:text-gray-300">
                            The Armed Conflict Location & Event Data Project (ACLED) is a
                            disaggregated data collection, analysis, and crisis mapping project.
                            ACLED collects information on the dates, actors, locations, fatalities,
                            and types of all reported political violence and protest events around
                            the world.
                        </p>
                        <p className="mb-6 text-gray-700 dark:text-gray-300">
                            ACLED data is widely used by governments, international organizations,
                            NGOs, and researchers to understand conflict dynamics and inform
                            policy decisions.
                        </p>
                        <a
                            href="https://acleddata.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                            Learn more about ACLED
                            <svg
                                className="h-5 w-5"
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
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
