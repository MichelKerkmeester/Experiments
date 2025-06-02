# Sankey Chart Generator - Figma Plugin

A powerful Figma plugin for creating beautiful Sankey diagrams to visualize data flows, user journeys, budget allocations, and more.

## Features

- **Easy Data Input**: JSON-based flow data input with validation
- **Multiple Presets**: Pre-built templates for data flows, user journeys, and budget analysis
- **Color Schemes**: 4 beautiful color schemes (Modern, Corporate, Vibrant, Nature)
- **Customizable**: Adjust chart dimensions, node width, and spacing
- **Real-time Stats**: Live preview of node counts, flow counts, and total values
- **Professional Design**: Clean, minimal aesthetic matching modern design standards

## Installation

### Option 1: Install from Figma Community (Coming Soon)
1. Go to Figma Community
2. Search for "Sankey Chart Generator"
3. Click "Install" to add it to your plugins

### Option 2: Development Installation
1. Download or clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
4. In Figma, go to Plugins → Development → Import plugin from manifest
5. Select the `manifest.json` file from this project

## Usage

### Basic Usage
1. Open the plugin: Plugins → Sankey Chart Generator
2. Choose a preset or input your own data
3. Customize the chart settings (optional)
4. Click "Generate Sankey Chart"

### Data Format
Input your flow data as JSON with the following structure:
```json
[
  {"from": "Source A", "to": "Process 1", "value": 100},
  {"from": "Source B", "to": "Process 1", "value": 80},
  {"from": "Process 1", "to": "Output 1", "value": 120},
  {"from": "Process 1", "to": "Output 2", "value": 60}
]
```

Each flow object requires:
- `from`: Source node name (string)
- `to`: Target node name (string)  
- `value`: Flow value (positive number)

### Preset Examples

#### Data Flow Analysis
Perfect for visualizing data processing pipelines:
- Web Traffic → Data Processing → Analytics → Storage
- Shows how data moves through your system

#### User Journey Mapping
Track user paths through your product:
- Website → Landing Page → Product → Cart → Checkout → Purchase
- Identify drop-off points and conversion rates

#### Budget Flow Visualization
Understand how money flows through your organization:
- Revenue → Operations/Marketing/Development → Specific expenses
- Track budget allocation and spending

## Customization Options

### Chart Settings
- **Width**: 400-2000px (default: 800px)
- **Height**: 300-1200px (default: 500px)
- **Node Width**: 8-30px (default: 15px)
- **Node Spacing**: 4-20px (default: 8px)

### Color Schemes
- **Modern**: Blue, green, amber, purple, indigo palette
- **Corporate**: Professional grayscale tones
- **Vibrant**: Bright, energetic colors
- **Nature**: Green and earth tones

## Algorithm Details

The plugin uses a custom Sankey layout algorithm:

1. **Level Assignment**: Uses topological sorting to arrange nodes in columns
2. **Node Sizing**: Calculates node heights based on flow values
3. **Positioning**: Centers nodes vertically within each column
4. **Flow Generation**: Creates curved paths between connected nodes

## Best Practices

### Data Preparation
- Use descriptive node names
- Ensure flow values are meaningful and proportional
- Validate your data before generating the chart

### Visual Design
- Choose colors that match your brand or presentation style
- Adjust node spacing for optimal readability
- Consider chart dimensions based on your canvas size

### Performance
- For large datasets (50+ nodes), consider breaking into smaller charts
- Use the validation feature to check data integrity

## Troubleshooting

### Common Issues

**"Validation Error" Messages**
- Check that all flows have `from`, `to`, and `value` properties
- Ensure values are positive numbers
- Verify JSON syntax is correct

**Chart Appears Too Crowded**
- Increase chart width and height
- Adjust node spacing
- Consider using fewer nodes or breaking into multiple charts

**Colors Don't Match Expectations**
- Colors are assigned automatically based on node names
- Try different color schemes
- Consistent node names will have consistent colors

**Performance Issues**
- Large datasets may take a moment to generate
- Consider simplifying complex flows
- Use the "Clear Canvas" button to remove old charts

## Development

### Building from Source
```bash
# Install dependencies
npm install

# Build once
npm run build

# Watch for changes during development
npm run watch
```

### File Structure
```
├── manifest.json      # Plugin configuration
├── code.ts           # Main plugin logic
├── ui.html           # User interface
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript config
└── README.md         # This file
```

## Technical Specifications

- **Framework**: Figma Plugin API
- **Language**: TypeScript
- **UI**: HTML/CSS/JavaScript
- **Layout Algorithm**: Custom topological sort-based Sankey layout
- **Supported Formats**: JSON flow data

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

### Ideas for Future Enhancements
- Export to SVG/PNG
- Animation support
- Advanced styling options
- Integration with external data sources
- Collaborative editing features

## License

MIT License - see LICENSE file for details.

## Support

If you encounter any issues or have feature requests, please:
1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed description and sample data

---

**Made with ❤️ for the Figma community**

*Transform your data into beautiful visual stories with Sankey Chart Generator!* 