module.exports = {
  apps: [{
    name: 'scheme-saarthi-backend',
    script: './index.js',
    instances: 1,
    exec_mode: 'fork',
    
    // Auto-restart configuration
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    
    // Restart on file changes (disable in production)
    ignore_watch: ['node_modules', 'logs', '.git'],
    
    // Environment variables
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    
    // Error handling
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // Restart strategy
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Cron restart (daily at 3 AM to prevent memory leaks)
    cron_restart: '0 3 * * *',
    
    // Exponential backoff restart delay
    exp_backoff_restart_delay: 100
  }]
};
