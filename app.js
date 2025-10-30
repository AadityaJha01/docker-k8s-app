class WebApp {
    constructor() {
        this.requestCount = 0;
        this.startTime = Date.now();
        this.init();
    }

    init() {
        this.updateHostname();
        this.updateUptime();
        this.setupAutoRefresh();
        
        // Simulate initial metrics
        this.requestCount = Math.floor(Math.random() * 100) + 1;
        this.updateMetrics();
    }

    updateHostname() {
        // In a real scenario, this would come from the server
        const hostnames = ['webapp-pod-1', 'webapp-pod-2', 'webapp-pod-3'];
        const randomHost = hostnames[Math.floor(Math.random() * hostnames.length)];
        document.getElementById('hostname').textContent = randomHost;
    }

    updateUptime() {
        const uptime = Math.floor((Date.now() - this.startTime) / 1000);
        document.getElementById('uptime').textContent = uptime.toLocaleString();
    }

    updateMetrics() {
        document.getElementById('request-count').textContent = this.requestCount;
    }

    setupAutoRefresh() {
        // Update uptime every second
        setInterval(() => {
            this.updateUptime();
        }, 1000);

        // Refresh hostname every 30 seconds (simulating load balancing)
        setInterval(() => {
            this.updateHostname();
        }, 30000);
    }

    incrementCounter() {
        this.requestCount++;
        this.updateMetrics();
        
        // Show visual feedback
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '✅ Request Sent!';
        button.style.background = '#48bb78';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '#667eea';
        }, 1000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WebApp();
});

// Global function for the button click
function incrementCounter() {
    if (window.app) {
        window.app.incrementCounter();
    }
}