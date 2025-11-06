module.exports = {
  apps: [
    {
      name: "email-classifier",
      script: "dist/main.js",
      cwd: ".",
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      out_file: "./logs/out.log",
      error_file: "./logs/err.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      time: true,
    },
  ],
};
