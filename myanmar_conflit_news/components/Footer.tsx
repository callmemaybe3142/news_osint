export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-gray-200 bg-white py-12 dark:border-gray-800 dark:bg-gray-900">
            <div className="container mx-auto px-4">
                <div className="grid gap-8 md:grid-cols-3">
                    {/* About */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                            Myanmar Conflict Dashboard
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Providing comprehensive analysis of conflict events in Myanmar based
                            on ACLED data.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                            Resources
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a
                                    href="https://acleddata.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                >
                                    ACLED Website
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://acleddata.com/knowledge-base/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                >
                                    ACLED Knowledge Base
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://acleddata.com/data-export-tool/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                >
                                    Data Export Tool
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Disclaimer */}
                    <div>
                        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                            Disclaimer
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            This dashboard is for informational purposes only. All data is
                            sourced from ACLED and is subject to their terms of use.
                        </p>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 border-t border-gray-200 pt-8 text-center dark:border-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        © {currentYear} Myanmar Conflict Dashboard. Data provided by{" "}
                        <a
                            href="https://acleddata.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                            ACLED
                        </a>
                        .
                    </p>
                </div>
            </div>
        </footer>
    );
}
