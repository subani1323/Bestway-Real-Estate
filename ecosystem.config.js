module.exports = {
  apps: [
    {
      name: "bestway-real-estate-backend",
      script: "./backend/server.js",
      instances: 1, // Change to 1 since your backend serves both API and frontend
      exec_mode: "fork", // Change to fork for serving static files
      env: {
        NODE_ENV: "development",
        PORT: 5001,
        MONGO_URI:
          "mongodb+srv://Subani:Sheli_2313@realstatedb.muxkgby.mongodb.net/moncton?retryWrites=true&w=majority&appName=realstatedb",
        DOMAIN: "localhost:5001",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5001,
        MONGO_URI:
          "mongodb+srv://Subani:Sheli_2313@realstatedb.muxkgby.mongodb.net/moncton?retryWrites=true&w=majority&appName=realstatedb",
        DOMAIN: "savemax.brokeragelead.ca",
        API_DOMAIN: "api.brokeragelead.ca",
      },
      error_file: "../logs/backend-err.log",
      out_file: "../logs/backend-out.log",
      log_file: "../logs/backend-combined.log",
      time: true,
      max_memory_restart: "1G",
      node_args: "--max_old_space_size=4096",
      watch: false,
      ignore_watch: ["node_modules", "logs"],
    },
  ],

  deploy: {
    production: {
      user: "windows", // change to your server username
      host: ["107.161.34.44"], // change to your server IP
      ref: "origin/main", // or your main branch
      repo: "git@github.com:yourusername/bestway-real-estate.git", // change to your repo
      path: "/var/www/bestway-real-estate",
      "pre-deploy-local": "",
      "post-deploy":
        "npm run build && pm2 reload ecosystem.config.js --env production",
      "pre-setup": "",
      ssh_options: "StrictHostKeyChecking=no",
    },
  },
};
