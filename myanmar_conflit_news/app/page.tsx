import {
  Activity,
  Skull,
  Users,
  MapPin,
  Flame,
  Calendar,
} from "lucide-react";
import { Hero } from "@/components/Hero";
import { StatCard } from "@/components/StatCard";
import { WeeklyTrendsChart } from "@/components/WeeklyTrendsChart";
import { TopRegionsList } from "@/components/TopRegionsList";
import { EventTypeDistribution } from "@/components/EventTypeDistribution";
import { AboutSection } from "@/components/AboutSection";
import { Footer } from "@/components/Footer";
import {
  getStatisticsSummary,
  getWeeklyTrends,
  getTopRegions,
  getEventTypeDistribution,
} from "@/lib/data";
import { formatWeek } from "@/lib/utils";

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Fetch all data in parallel
  const [stats, weeklyTrends, topRegions, eventTypes] = await Promise.all([
    getStatisticsSummary(),
    getWeeklyTrends(12),
    getTopRegions(10),
    getEventTypeDistribution(8),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <Hero />

      {/* Statistics Section */}
      <section id="statistics" className="py-20">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
              Key Statistics
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Comprehensive overview of conflict events in Myanmar
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mb-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Events"
              value={stats.totalEvents}
              icon={Activity}
              description="Cumulative conflict events recorded"
              iconColor="text-red-600"
            />
            <StatCard
              title="Total Fatalities"
              value={stats.totalFatalities}
              icon={Skull}
              description="Lives lost in conflict events"
              iconColor="text-orange-600"
            />
            <StatCard
              title="Cumulative Population Exposed"
              value={stats.totalPopulationExposed}
              icon={Users}
              description="People affected by conflict zones"
              iconColor="text-amber-600"
            />
            <StatCard
              title="Most Affected Region"
              value={stats.mostAffectedRegion.name}
              icon={MapPin}
              description={`${stats.mostAffectedRegion.events.toLocaleString()} events recorded`}
              iconColor="text-red-600"
            />
            <StatCard
              title="Most Common Event Type"
              value={stats.mostCommonEventType.type}
              icon={Flame}
              description={`${stats.mostCommonEventType.count.toLocaleString()} occurrences`}
              iconColor="text-orange-600"
            />
            <StatCard
              title="Latest Week"
              value={formatWeek(stats.recentWeekData.week)}
              icon={Calendar}
              description={`${stats.recentWeekData.events} events, ${stats.recentWeekData.fatalities} fatalities`}
              iconColor="text-amber-600"
            />
          </div>

          {/* Charts Section */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Weekly Trends */}
            <div className="lg:col-span-2">
              <WeeklyTrendsChart data={weeklyTrends} />
            </div>

            {/* Top Regions */}
            <TopRegionsList regions={topRegions} />

            {/* Event Type Distribution */}
            <EventTypeDistribution data={eventTypes} />
          </div>
        </div>
      </section>

      {/* About Section */}
      <AboutSection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
