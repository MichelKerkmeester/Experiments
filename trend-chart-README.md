# Trend Chart Component

An interactive trend chart component based on Dataprovider's Traffic charts, featuring rolling averages and regression lines.

## Features

- **Interactive Line Charts** with Chart.js
- **Rolling Averages** (3-week and monthly options)
- **Linear Regression** trend lines
- **Multiple Visualization Modes** (Raw Data, Rolling Average, or Both)
- **Time Range Filtering** (7D, 1M, 3M, 6M, 1Y, MAX)
- **Responsive Design** with modern UI
- **Webflow/Slater Compatible**

## Setup for Webflow/Slater

### 1. Add Chart.js to your Webflow project

In your Webflow project settings, add this to the Custom Code section (Head Code):

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

### 2. Upload the trend-chart.js to Slater

Copy the entire `trend-chart.js` file content to your Slater project.

### 3. Add a chart container in Webflow

Add an HTML Embed or Div Block with a custom attribute:

```html
<div data-trend-chart data-hostname="your-domain.com"></div>
```

## Usage Examples

### Basic Implementation

```html
<!-- Simple chart with data attribute -->
<div data-trend-chart data-hostname="slack.com"></div>
```

### Custom Implementation

```javascript
// Initialize with custom options
const chart = new TrendChart(document.getElementById('my-chart'), {
    hostname: 'example.com',
    timeRange: '3-week',        // '3-week' or 'monthly'
    visualization: 'both',      // 'raw', 'rolling', or 'both'
    showRegression: true,       // Show/hide regression line
    rollingWindow: 21          // Days for rolling average
});
```

### Setting Custom Data

```javascript
// Your data should be an array of objects with date and value
const data = [
    { date: new Date('2024-01-01'), value: 45.2 },
    { date: new Date('2024-01-02'), value: 48.7 },
    // ... more data points
];

chart.setData(data);
```

### Programmatic Control

```javascript
// Change hostname
chart.setHostname('new-domain.com');

// Toggle regression line
chart.options.showRegression = !chart.options.showRegression;
chart.updateChart();

// Change visualization mode
chart.options.visualization = 'rolling';
chart.updateChart();

// Destroy chart
chart.destroy();
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `hostname` | string | 'example.com' | The hostname to display in the chart title |
| `timeRange` | string | '3-week' | Time range for rolling average ('3-week' or 'monthly') |
| `visualization` | string | 'both' | Chart display mode ('raw', 'rolling', or 'both') |
| `showRegression` | boolean | true | Show/hide the regression trend line |
| `rollingWindow` | number | 21 | Number of days for rolling average calculation |

## Styling

The component includes built-in styles that match the Dataprovider design. You can customize the appearance by:

1. **Overriding CSS variables** (if needed)
2. **Wrapping in a custom container** with your own styles
3. **Modifying the chart colors** in the Chart.js configuration

### Custom Container Example

```html
<div class="my-custom-wrapper">
    <div id="traffic-chart"></div>
</div>

<style>
.my-custom-wrapper {
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
```

## API Methods

### `setData(data)`
Update the chart with new data.

### `setHostname(hostname)`
Change the displayed hostname.

### `updateChart()`
Refresh the chart with current settings.

### `filterDataByRange(range)`
Filter data by time range ('7d', '1m', '3m', '6m', '1y', 'max').

### `destroy()`
Clean up and destroy the chart instance.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- Chart.js v3.x or higher

## License

This component is designed for use within Webflow/Slater projects. 