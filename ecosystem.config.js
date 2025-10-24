module.exports = {
  apps: [
    {
      name: 'arayanvar-web',
      script: 'npx',
      args: 'serve -s build -l 3001',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    }
  ]
}