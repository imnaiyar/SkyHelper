# Planner Breakdown Dashboard

This feature provides a comprehensive breakdown of a user's Sky: Children of the Light planner data, displaying detailed statistics, currency usage, and item collection information through a web-based dashboard.

## Overview

The Planner Breakdown feature consists of:

1. **Backend API Endpoint** - Fetches and transforms planner data
2. **Frontend Dashboard** - Displays data with charts, filters, and export options
3. **Discord Bot Integration** - Link button to access the dashboard

## Features

### 📊 Statistics Overview

- **Progress Tracking**: View completion percentage for items, spirit nodes, winged lights, and IAPs
- **Current Currencies**: Display of candles, hearts, ascended candles, and gift passes
- **Visual Progress Bars**: Color-coded progress indicators for each category

### 💰 Currency Breakdown

- **Pie Chart**: Visual distribution of spent currencies
- **Bar Chart**: Comparative view of currency amounts
- **Category Filtering**: View spending by Total, Regular, Seasons, or Events
- **USD Tracking**: Total money spent on in-app purchases

### 📦 Item Lists

- **Comprehensive Display**: All unlocked items with their costs
- **Pagination**: Handles large datasets (20 items per page)
- **Sorting**: Sort by name or cost (ascending/descending)
- **Search**: Filter items by name, spirit, or shop
- **Item Details**:
  - Spirit tree nodes with associated spirit information
  - Shop items with quantity and shop name
  - IAPs with price in USD

### 📥 Export Functionality

- **CSV Export**: Download data for spreadsheet analysis
- **JSON Export**: Full data structure for programmatic use
- **Filtered Exports**: Export matches current category filter

### 🎨 Design

- **Responsive Layout**: Works on mobile, tablet, and desktop
- **Dark Theme**: Consistent with main website design
- **Loading States**: Smooth loading experience
- **Error Handling**: Clear error messages for issues

## API Endpoint

### `GET /users/:userId/planner/breakdown`

**Authentication**: Required (Bearer token)

**Authorization**: Users can only access their own data

**Response Structure**:

```json
{
  "user": {
    "id": "string",
    "username": "string",
    "avatar": "string"
  },
  "progress": {
    "items": { "total": 0, "unlocked": 0, "percentage": 0 },
    "nodes": { "total": 0, "unlocked": 0, "percentage": 0 },
    "wingedLights": { "total": 0, "unlocked": 0, "percentage": 0 },
    "iaps": { "total": 0, "bought": 0, "percentage": 0 }
  },
  "currencies": {
    "candles": 0,
    "hearts": 0,
    "ascendedCandles": 0,
    "giftPasses": 0,
    "eventCurrencies": {},
    "seasonCurrencies": {}
  },
  "breakdown": {
    "total": {
      /* aggregated costs */
    },
    "regular": {
      /* regular spirit costs */
    },
    "seasons": [
      /* array of season breakdowns */
    ],
    "events": [
      /* array of event breakdowns */
    ],
    "eventInstances": [
      /* array of event instance breakdowns */
    ]
  }
}
```

## Component Architecture

### Main Components

1. **page.tsx** - Entry point, handles data fetching and authentication
2. **PlannerBreakdownView.tsx** - Main container managing state and layout
3. **StatsOverview.tsx** - Progress statistics and current currencies
4. **CategoryTabs.tsx** - Category filter tabs
5. **CurrencyChart.tsx** - Visualization using Recharts
6. **FilterPanel.tsx** - Search input for filtering items
7. **ItemsList.tsx** - Paginated list with sorting
8. **ExportButtons.tsx** - CSV and JSON export functionality

### Type Definitions

All TypeScript types are defined in `types.ts` for type safety across components.

## Usage Flow

1. **Discord Bot**: User views their planner profile
2. **Bot Display**: Shows currency breakdown with "View Detailed Breakdown on Website" button
3. **Redirect**: User clicks button, opens dashboard in browser
4. **Authentication**: Checks if user is logged in
5. **Data Fetch**: API call to bot's backend for planner data
6. **Display**: Dashboard renders with all features
7. **Interaction**: User can filter, search, sort, and export data

## Dependencies

- **recharts**: Charts and data visualization
- **papaparse**: CSV parsing and export
- **Next.js**: Framework and routing
- **React**: UI library

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001  # Bot API URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Website URL
```

## Development

### Running Locally

1. Start the bot API server (default port 5001)
2. Start the Next.js dev server:
   ```bash
   cd apps/website
   pnpm dev
   ```
3. Navigate to `/dashboard/planner-breakdown`

### Building

```bash
pnpm build
```

## Future Enhancements

Potential improvements:

- [ ] Advanced filtering (by season, event, date range)
- [ ] Historical data tracking (spending over time)
- [ ] Comparison with other users (anonymized)
- [ ] Achievement tracking
- [ ] Recommendations based on current progress
- [ ] PDF export option
- [ ] Print-friendly view
- [ ] Shareable stats cards

## Notes

- Data is fetched in real-time from the bot's database
- Charts auto-adjust based on available currency types
- Only shows currencies that have been spent
- IAPs exclude gifted items from cost calculations
- Search is case-insensitive and searches name, spirit, and shop fields
- Pagination resets when changing filters or search terms

## Security

- Users can only access their own planner data
- Authentication required via Discord OAuth
- Authorization check in API endpoint
- No sensitive data exposed in URLs
- Rate limiting applied via bot API
