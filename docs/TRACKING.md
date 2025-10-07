# In-Game Stats Tracking

The SkyHelper bot now includes comprehensive in-game statistics tracking functionality, allowing you to track your progress in Sky: Children of the Light.

## Features

### 🎯 Progress Tracking
- **Items**: Track unlocked items and cosmetics
- **Spirit Nodes**: Mark spirit tree nodes as completed
- **Winged Lights**: Keep track of collected winged lights across all realms
- **Resources**: Monitor your candles, hearts, ascended candles, and seasonal candles
- **Wing Buffs**: Track your wing buff count

### 📊 Statistics Display
View comprehensive statistics about your progress including:
- Collection progress percentages
- Spirit completion rates
- Resource counts
- Overall game progression

### 💾 Data Import/Export
- **Export**: Save your progress as a JSON file for backup
- **Import**: Restore your progress from a previous backup
- **Sky-planner.com Compatibility**: Export data in a format compatible with sky-planner.com website

## Commands

### `/planner home`
Opens the interactive planner interface where you can browse spirits, items, events, and more.

### `/planner stats`
Displays your current progress statistics including:
- Items unlocked
- Nodes completed
- Winged lights collected
- Spirits completed
- Current resources

### `/planner search <query>`
Search for and navigate directly to specific items, spirits, events, or other game content.

### `/planner data export`
Exports your current planner data as a JSON file. The file can be:
- Imported back to the bot later
- Used on sky-planner.com website

### `/planner data import`
Import planner data from a previously exported file or from sky-planner.com.

## Using the Planner

### Modifying Spirit Trees

1. Navigate to any spirit in the planner
2. View their spirit tree
3. Click the **Modify** button
4. Toggle individual nodes/items as acquired/unlocked
5. Click **Done** when finished

The tree will show:
- ✓ for unlocked items
- ○ for locked items
- Progress counter (e.g., "5/20 unlocked")

### Tracking Resources

Your resources (candles, hearts, etc.) can be updated through:
- The import/export functionality
- Manual updates (coming soon)

### Progress Statistics

The stats command shows:
- **Collection Progress**: Overall percentage of items, nodes, and WLs collected
- **Spirit Completion**: Number and percentage of spirits fully completed
- **Resources**: Current count of all resources

## Data Format

### Export Format

The exported JSON file contains:
```json
{
  "c": {
    "items": { "item-guid": { "unlock": true }, ... },
    "nodes": { "node-guid": { "unlock": true }, ... },
    "wingedLights": { "wl-guid": { "unlock": true }, ... },
    "candles": 100,
    "hearts": 50,
    "ascendedCandles": 20,
    "sc": 30
  },
  "unlockedItems": ["item-guid", ...],
  "unlockedNodes": ["node-guid", ...],
  "collectedWLs": ["wl-guid", ...],
  "candles": 100,
  "hearts": 50,
  "ascendedCandles": 20,
  "seasonalCandles": 30,
  "wingBuffs": 11,
  "exportedAt": "2024-01-01T00:00:00.000Z"
}
```

## Database Schema

User planner data is stored with the following structure:

- `_id`: User ID
- `unlockedItems`: Array of unlocked item GUIDs
- `unlockedNodes`: Array of unlocked spirit node GUIDs
- `collectedWLs`: Array of collected winged light GUIDs
- `candles`: Number
- `hearts`: Number
- `ascendedCandles`: Number
- `seasonalCandles`: Number
- `wingBuffs`: Number
- `updatedAt`: Timestamp of last update

## Future Enhancements

Planned features for future releases:
- Manual resource editing
- Heart trade tracking
- Calculator for event/season costs
- Enhanced import capabilities with file attachments
- Sync with sky-planner.com website preferences
- Realm and season progress inference from spirit completion

## Notes

- **Sky-planner.com Compatibility**: When exporting data to use on sky-planner.com, some website-specific preferences (filters, settings) may not be preserved
- **Discord Limits**: Spirit tree modification is limited to 25 nodes at a time due to Discord's button limits
- **Data Privacy**: Your planner data is stored securely and is only accessible to you
- **Backup**: Regular exports are recommended to backup your progress

## Support

For issues, questions, or feature requests related to the planner:
- Join our [Discord Support Server](https://discord.com/invite/2rjCRKZsBb)
- Open an issue on [GitHub](https://github.com/imnaiyar/SkyHelper/issues)
- Check the [Documentation](https://docs.skyhelper.xyz)
