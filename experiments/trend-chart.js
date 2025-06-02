// Trend Chart Component with Rolling Averages and Regression Line
// For use in Webflow/Slater environment

class TrendChart {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      hostname: 'example.com',
      timeRange: '3-week',
      visualization: 'both', // 'raw', 'rolling', 'both'
      showRegression: true,
      rollingWindow: 21, // days for 3-week average
      ...options
    };
    
    this.chart = null;
    this.rawData = [];
    this.processedData = {
      labels: [],
      raw: [],
      rolling: [],
      regression: []
    };
    
    this.init();
  }
  
  init() {
    this.createDOM();
    this.bindEvents();
    this.loadData();
  }
  
  createDOM() {
    // Create chart container structure
    this.container.innerHTML = `
      <div class="trend-chart-wrapper">
        <div class="chart-header">
          <h3 class="chart-title">Connection Index changes over time of <span class="hostname">${this.options.hostname}</span></h3>
          <button class="download-btn">Download</button>
        </div>
        
        <div class="chart-controls">
          <div class="control-group visualization-toggle">
            <label>Visualization:</label>
            <div class="toggle-buttons">
              <button class="toggle-btn" data-viz="raw">Raw Data</button>
              <button class="toggle-btn" data-viz="rolling">Rolling Average</button>
              <button class="toggle-btn active" data-viz="both">Both</button>
            </div>
          </div>
          
          <div class="control-group period-toggle">
            <label>Period:</label>
            <div class="toggle-buttons">
              <button class="toggle-btn active" data-period="3-week">3-Week</button>
              <button class="toggle-btn" data-period="monthly">Monthly</button>
            </div>
          </div>
          
          <div class="control-group regression-toggle">
            <label class="switch">
              <input type="checkbox" id="regression-toggle" checked>
              <span class="slider"></span>
            </label>
            <label for="regression-toggle">Show Regression Line</label>
          </div>
        </div>
        
        <div class="chart-container">
          <canvas id="trend-chart"></canvas>
        </div>
        
        <div class="chart-legend" id="chart-legend"></div>
        
        <div class="chart-footer">
          <div class="time-range-buttons">
            <button class="range-btn" data-range="7d">7D</button>
            <button class="range-btn active" data-range="1m">1M</button>
            <button class="range-btn" data-range="3m">3M</button>
            <button class="range-btn" data-range="6m">6M</button>
            <button class="range-btn" data-range="1y">1Y</button>
            <button class="range-btn" data-range="max">MAX</button>
          </div>
          <div class="chart-actions">
            <button class="action-btn">⚙ Change events</button>
          </div>
        </div>
      </div>
    `;
    
    // Add styles
    this.addStyles();
  }
  
  addStyles() {
    const styleId = 'trend-chart-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .trend-chart-wrapper {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .chart-title {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin: 0;
        }
        
        .hostname {
          color: #0066cc;
        }
        
        .download-btn {
          padding: 6px 12px;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .chart-controls {
          display: flex;
          gap: 30px;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid #eee;
        }
        
        .control-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .control-group label {
          font-size: 14px;
          color: #666;
        }
        
        .toggle-buttons {
          display: flex;
          gap: 5px;
        }
        
        .toggle-btn {
          padding: 6px 16px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .toggle-btn:hover {
          background: #f5f5f5;
        }
        
        .toggle-btn.active {
          background: #0066cc;
          color: white;
          border-color: #0066cc;
        }
        
        .regression-toggle {
          margin-left: auto;
        }
        
        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 22px;
        }
        
        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .3s;
          border-radius: 22px;
        }
        
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
        }
        
        input:checked + .slider {
          background-color: #2ecc71;
        }
        
        input:checked + .slider:before {
          transform: translateX(18px);
        }
        
        .chart-container {
          position: relative;
          height: 400px;
          margin: 20px 0;
        }
        
        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin: 20px 0;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
        }
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #666;
        }
        
        .legend-color {
          width: 20px;
          height: 3px;
          border-radius: 2px;
        }
        
        .legend-color.dashed {
          background-image: repeating-linear-gradient(
            to right,
            currentColor,
            currentColor 5px,
            transparent 5px,
            transparent 10px
          );
          background-size: 10px 100%;
          height: 2px;
        }
        
        .chart-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
        }
        
        .time-range-buttons {
          display: flex;
          gap: 5px;
        }
        
        .range-btn {
          padding: 6px 16px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .range-btn:hover {
          background: #f5f5f5;
        }
        
        .range-btn.active {
          background: #5856d6;
          color: white;
          border-color: #5856d6;
        }
        
        .action-btn {
          padding: 6px 16px;
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  bindEvents() {
    // Visualization toggle
    this.container.querySelectorAll('[data-viz]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.container.querySelectorAll('[data-viz]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.options.visualization = e.target.dataset.viz;
        this.updateChart();
      });
    });
    
    // Period toggle
    this.container.querySelectorAll('[data-period]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.container.querySelectorAll('[data-period]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.options.timeRange = e.target.dataset.period;
        this.options.rollingWindow = e.target.dataset.period === 'monthly' ? 30 : 21;
        this.processData();
        this.updateChart();
      });
    });
    
    // Regression toggle
    this.container.querySelector('#regression-toggle').addEventListener('change', (e) => {
      this.options.showRegression = e.target.checked;
      this.updateChart();
    });
    
    // Time range buttons
    this.container.querySelectorAll('[data-range]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.container.querySelectorAll('[data-range]').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        // In a real implementation, this would filter the data
        this.filterDataByRange(e.target.dataset.range);
      });
    });
  }
  
  loadData() {
    // Simulate loading data - in production, this would fetch from API
    this.generateSampleData();
    this.processData();
    this.createChart();
  }
  
  generateSampleData() {
    // Generate sample data similar to the screenshots
    const days = 60;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    this.rawData = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate realistic connection index values with some noise
      const baseValue = 30 + Math.sin(i / 10) * 20;
      const noise = (Math.random() - 0.5) * 30;
      const value = Math.max(0, Math.min(100, baseValue + noise));
      
      this.rawData.push({
        date: date,
        value: value
      });
    }
  }
  
  processData() {
    this.processedData.labels = this.rawData.map(d => this.formatDate(d.date));
    this.processedData.raw = this.rawData.map(d => d.value);
    
    // Calculate rolling average
    this.processedData.rolling = this.calculateRollingAverage(
      this.processedData.raw,
      this.options.rollingWindow
    );
    
    // Calculate regression line
    this.processedData.regression = this.calculateRegression(this.processedData.raw);
  }
  
  calculateRollingAverage(data, window) {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < window - 1) {
        result.push(null);
      } else {
        const validValues = data.slice(i - window + 1, i + 1).filter(v => v !== null && !isNaN(v));
        if (validValues.length > 0) {
          const sum = validValues.reduce((a, b) => a + b, 0);
          result.push(sum / validValues.length);
        } else {
          result.push(null);
        }
      }
    }
    return result;
  }
  
  calculateRegression(data) {
    // Simple linear regression - only use non-null values
    const validPoints = [];
    data.forEach((value, index) => {
      if (value !== null && !isNaN(value)) {
        validPoints.push({ x: index, y: value });
      }
    });
    
    if (validPoints.length < 2) {
      return data.map(() => null);
    }
    
    const n = validPoints.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    validPoints.forEach(point => {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumXX += point.x * point.x;
    });
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return data.map((_, i) => slope * i + intercept);
  }
  
  formatDate(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }
  
  createChart() {
    const ctx = this.container.querySelector('#trend-chart').getContext('2d');
    
    const datasets = [];
    
    // Raw data dataset
    if (this.options.visualization === 'raw' || this.options.visualization === 'both') {
      datasets.push({
        label: 'Daily Data',
        data: this.processedData.raw,
        borderColor: '#4285f4',
        backgroundColor: 'rgba(66, 133, 244, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
        fill: true,
        spanGaps: false
      });
    }
    
    // Rolling average dataset
    if (this.options.visualization === 'rolling' || this.options.visualization === 'both') {
      datasets.push({
        label: `${this.options.timeRange === 'monthly' ? '30' : '3-Week'} Rolling Avg`,
        data: this.processedData.rolling,
        borderColor: '#fbbc04',
        backgroundColor: 'transparent',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4,
        fill: false,
        spanGaps: false
      });
    }
    
    // Regression line dataset
    if (this.options.showRegression) {
      datasets.push({
        label: 'Trend Line',
        data: this.processedData.regression,
        borderColor: '#2ecc71',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
        fill: false,
        spanGaps: true
      });
    }
    
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.processedData.labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false // We'll use custom legend
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#ddd',
            borderWidth: 1,
            cornerRadius: 4,
            padding: 10,
            displayColors: true,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toFixed(1);
                }
                return label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxTicksLimit: 10,
              color: '#666'
            }
          },
          y: {
            beginAtZero: true,
            max: 100,
            grid: {
              color: '#f0f0f0',
              drawBorder: false
            },
            ticks: {
              stepSize: 25,
              color: '#666',
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
    
    // Initialize legend
    this.updateLegend();
  }
  
  updateChart() {
    if (!this.chart) return;
    
    const datasets = [];
    
    // Update datasets based on current options
    if (this.options.visualization === 'raw' || this.options.visualization === 'both') {
      datasets.push({
        label: 'Daily Data',
        data: this.processedData.raw,
        borderColor: '#4285f4',
        backgroundColor: 'rgba(66, 133, 244, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
        fill: true,
        spanGaps: false
      });
    }
    
    if (this.options.visualization === 'rolling' || this.options.visualization === 'both') {
      datasets.push({
        label: `${this.options.timeRange === 'monthly' ? '30' : '3-Week'} Rolling Avg`,
        data: this.processedData.rolling,
        borderColor: '#fbbc04',
        backgroundColor: 'transparent',
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4,
        fill: false,
        spanGaps: false
      });
    }
    
    if (this.options.showRegression) {
      datasets.push({
        label: 'Trend Line',
        data: this.processedData.regression,
        borderColor: '#2ecc71',
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
        fill: false,
        spanGaps: true
      });
    }
    
    this.chart.data.datasets = datasets;
    this.chart.update();
    
    // Update custom legend
    this.updateLegend();
  }
  
  updateLegend() {
    const legendContainer = this.container.querySelector('#chart-legend');
    if (!legendContainer) return;
    
    let legendHTML = '';
    
    if (this.options.visualization === 'raw' || this.options.visualization === 'both') {
      legendHTML += `
        <div class="legend-item">
          <div class="legend-color" style="background-color: #4285f4;"></div>
          <span>Daily Data</span>
        </div>
      `;
    }
    
    if (this.options.visualization === 'rolling' || this.options.visualization === 'both') {
      legendHTML += `
        <div class="legend-item">
          <div class="legend-color" style="background-color: #fbbc04;"></div>
          <span>${this.options.timeRange === 'monthly' ? '30-Day' : '3-Week'} Rolling Avg</span>
        </div>
      `;
    }
    
    if (this.options.showRegression) {
      legendHTML += `
        <div class="legend-item">
          <div class="legend-color dashed" style="color: #2ecc71;"></div>
          <span>Trend Line</span>
        </div>
      `;
    }
    
    legendContainer.innerHTML = legendHTML;
  }
  
  filterDataByRange(range) {
    // Implement time range filtering
    const now = new Date();
    let startDate = new Date();
    
    switch(range) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'max':
        startDate = new Date(this.rawData[0].date);
        break;
    }
    
    const filteredData = this.rawData.filter(d => d.date >= startDate);
    
    // Update processed data with filtered data
    this.processedData.labels = filteredData.map(d => this.formatDate(d.date));
    this.processedData.raw = filteredData.map(d => d.value);
    this.processedData.rolling = this.calculateRollingAverage(
      this.processedData.raw,
      this.options.rollingWindow
    );
    this.processedData.regression = this.calculateRegression(this.processedData.raw);
    
    // Update chart
    this.chart.data.labels = this.processedData.labels;
    this.updateChart();
  }
  
  // Public methods
  setHostname(hostname) {
    this.options.hostname = hostname;
    this.container.querySelector('.hostname').textContent = hostname;
  }
  
  setData(data) {
    this.rawData = data;
    this.processData();
    this.updateChart();
  }
  
  destroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}

// Initialize when DOM is ready (Webflow/Slater environment)
// Chart.js must be loaded before this script
if (typeof Chart !== 'undefined') {
  // Auto-initialize if element exists
  const chartElement = document.querySelector('[data-trend-chart]');
  if (chartElement) {
    const trendChart = new TrendChart(chartElement, {
      hostname: chartElement.dataset.hostname || 'example.com'
    });
    
    // Make instance available globally for Webflow interactions
    window.trendChart = trendChart;
  }
} else {
  console.error('Chart.js is required for TrendChart component');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrendChart;
} 