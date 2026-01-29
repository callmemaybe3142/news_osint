import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import { Home } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const revalidate = 3600;

export default async function AboutDataPage() {
    // Read the markdown file
    const filePath = path.join(process.cwd(), "content", "about-data.md");
    const markdownContent = await fs.readFile(filePath, "utf-8");

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">


            {/* Content */}
            <div className="container mx-auto px-4 py-8 mt-16">
                <article className="prose prose-lg prose-gray mx-auto max-w-4xl dark:prose-invert">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            h1: ({ ...props }) => (
                                <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white" {...props} />
                            ),
                            h2: ({ ...props }) => (
                                <h2 className="mb-4 mt-8 text-3xl font-bold text-gray-900 dark:text-white" {...props} />
                            ),
                            h3: ({ ...props }) => (
                                <h3 className="mb-3 mt-6 text-2xl font-semibold text-gray-900 dark:text-white" {...props} />
                            ),
                            p: ({ ...props }) => (
                                <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300" {...props} />
                            ),
                            ul: ({ ...props }) => (
                                <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300" {...props} />
                            ),
                            ol: ({ ...props }) => (
                                <ol className="mb-4 ml-6 list-decimal space-y-2 text-gray-700 dark:text-gray-300" {...props} />
                            ),
                            li: ({ ...props }) => (
                                <li className="leading-relaxed" {...props} />
                            ),
                            strong: ({ ...props }) => (
                                <strong className="font-semibold text-gray-900 dark:text-white" {...props} />
                            ),
                            code: ({ ...props }) => (
                                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm text-red-600 dark:bg-gray-800 dark:text-red-400" {...props} />
                            ),
                            blockquote: ({ ...props }) => (
                                <blockquote className="border-l-4 border-red-500 pl-4 italic text-gray-700 dark:text-gray-300" {...props} />
                            ),
                            hr: ({ ...props }) => (
                                <hr className="my-8 border-gray-300 dark:border-gray-700" {...props} />
                            ),
                            a: ({ ...props }) => (
                                <a className="text-red-600 underline hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" {...props} />
                            ),
                            table: ({ ...props }) => (
                                <div className="my-6 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-300 border border-gray-300 dark:divide-gray-700 dark:border-gray-700" {...props} />
                                </div>
                            ),
                            thead: ({ ...props }) => (
                                <thead className="bg-gray-100 dark:bg-gray-800" {...props} />
                            ),
                            tbody: ({ ...props }) => (
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900" {...props} />
                            ),
                            tr: ({ ...props }) => (
                                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50" {...props} />
                            ),
                            th: ({ ...props }) => (
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white" {...props} />
                            ),
                            td: ({ ...props }) => (
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300" {...props} />
                            ),
                        }}
                    >
                        {markdownContent}
                    </ReactMarkdown>
                </article>

                {/* Back to Home Button */}
                <div className="mx-auto mt-12 max-w-4xl">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700"
                    >
                        <Home className="h-5 w-5" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
