# Quick Setup Guide for Sankey Chart Figma Plugin

## ✅ Plugin Ready for Testing!

All files have been generated and the plugin is ready to be tested in Figma.

### Files Created:
- `manifest.json` - Plugin configuration
- `ui.html` - User interface
- `code.ts` - TypeScript source code
- `code.js` - Compiled JavaScript (ready for Figma)
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript configuration
- `README.md` - Documentation

### To Test in Figma:

1. **Open Figma Desktop App** (required for plugin development)

2. **Import the Plugin:**
   - Go to `Plugins` → `Development` → `Import plugin from manifest...`
   - Select the `manifest.json` file from this directory
   - Click "Save"

3. **Run the Plugin:**
   - Go to `Plugins` → `Development` → `Sankey Chart Generator`
   - The plugin interface will open on the right side

4. **Create Your First Chart:**
   - Click one of the preset buttons (Data Flow, User Journey, or Budget Flow)
   - Adjust settings if desired (width, height, colors)
   - Click "Generate Sankey Chart"
   - Watch as the chart appears on your Figma canvas!

### Features to Test:
- ✅ Preset data loading
- ✅ Custom JSON data input
- ✅ Color scheme switching
- ✅ Chart dimension adjustment
- ✅ Data validation
- ✅ Canvas clearing
- ✅ Real-time stats preview

### Development Commands:
```bash
# Watch for changes during development
npm run watch

# Build once
npm run build
```

### Next Steps:
- Test with your own data
- Try different color schemes
- Experiment with chart dimensions
- Check how it handles edge cases (empty data, large datasets)

### Troubleshooting:
- Make sure you're using Figma Desktop (not browser version)
- If changes don't appear, run `npm run build` again
- Check the Figma developer console for any errors

**Happy charting! 🎉** 