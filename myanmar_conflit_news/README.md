# Myanmar Conflict Dashboard

A comprehensive web dashboard for analyzing conflict events in Myanmar using ACLED (Armed Conflict Location & Event Data Project) data.

## Features

- 📊 **Real-time Statistics**: Key metrics including total events, fatalities, and population exposure
- 📈 **Interactive Charts**: Weekly trends visualization with bar charts and pie charts
- 🗺️ **Regional Analysis**: Breakdown of conflict events by administrative regions
- 🎯 **Event Type Distribution**: Visual representation of different conflict event types
- 🔍 **SEO Optimized**: Server-side rendering with comprehensive metadata
- 🎨 **Modern UI**: Beautiful, responsive design with dark mode support

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: PostgreSQL
- **Charts**: Recharts
- **Icons**: Lucide React

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database with ACLED data
- Database schema from `dbschemas/schema_acled.sql` and `dbschemas/acled_aggregated.sql`

## Installation

1. **Clone the repository** (or navigate to the project directory):
   ```bash
   cd myanmar_conflit_news
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env.local` and update with your database credentials:
   ```bash
   DATABASE_URL="postgresql://username:password@host:5432/database_name"
   NEXT_PUBLIC_BASE_URL="http://localhost:3000"
   ```

4. **Ensure your PostgreSQL database has the required tables**:
   - `acled_aggregated` (weekly aggregated data - up-to-date)
   - `acled_events` (detailed event data - 12 months lagged)
   - `acled_event_types` (helper table for dropdowns)
   - `acled_locations` (helper table for dropdowns)
   - `acled_interactions` (helper table for dropdowns)

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

Build the application for production:

```bash
npm run build
npm start
```

## Project Structure

```
myanmar_conflit_news/
├── app/
│   ├── layout.tsx          # Root layout with SEO metadata
│   ├── page.tsx            # Landing page
│   ├── globals.css         # Global styles
│   ├── sitemap.ts          # Auto-generated sitemap
│   └── robots.ts           # Auto-generated robots.txt
├── components/
│   ├── Hero.tsx            # Hero section
│   ├── StatCard.tsx        # Statistics card component
│   ├── WeeklyTrendsChart.tsx    # Weekly trends chart
│   ├── TopRegionsList.tsx       # Top regions list
│   ├── EventTypeDistribution.tsx # Event type pie chart
│   ├── AboutSection.tsx    # About ACLED section
│   └── Footer.tsx          # Footer component
├── lib/
│   ├── db.ts               # Database connection pool
│   ├── data.ts             # Data fetching functions
│   ├── types.ts            # TypeScript type definitions
│   └── utils.ts            # Utility functions
└── .env.local              # Environment variables
```

## Data Sources

All data is sourced from [ACLED (Armed Conflict Location & Event Data Project)](https://acleddata.com), a trusted organization that collects and analyzes conflict data worldwide.

### Data Tables

- **acled_aggregated**: Weekly aggregated data (up-to-date)
  - Used for: Statistics, trends, regional analysis
  - Updated: Weekly
  
- **acled_events**: Detailed event records (12 months lagged)
  - Used for: Historical analysis, detailed event information
  - Updated: Quarterly

## SEO Features

- ✅ Server-side rendering (SSR)
- ✅ Incremental Static Regeneration (ISR) - revalidates every hour
- ✅ Comprehensive metadata (title, description, keywords)
- ✅ Open Graph tags for social media
- ✅ Twitter Card support
- ✅ Auto-generated sitemap.xml
- ✅ Auto-generated robots.txt
- ✅ Semantic HTML structure
- ✅ Google Fonts optimization

## Performance Optimizations

- Connection pooling for database queries
- Parallel data fetching with Promise.all
- Responsive images and lazy loading
- Code splitting by route
- Optimized bundle size

## License

This project is for informational purposes only. All data is subject to ACLED's terms of use.

## Contributing

Contributions are welcome! Please ensure all changes maintain the SEO-friendly structure and follow the existing code style.

## Support

For issues or questions, please refer to the [ACLED Knowledge Base](https://acleddata.com/knowledge-base/) for data-related queries.
