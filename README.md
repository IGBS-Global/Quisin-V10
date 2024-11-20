# Quisin - Restaurant Management System

A modern, full-stack restaurant management system built with React, TypeScript, and Node.js.

## System Requirements

- Node.js 18.x or higher
- NPM 9.x or higher
- SQLite 3.x or higher
- Nginx (for reverse proxy)
- PM2 (for process management)

## Server Setup

1. Update and upgrade your system:
```bash
sudo apt update && sudo apt upgrade -y
```

2. Install Node.js and NPM:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

3. Install SQLite:
```bash
sudo apt install sqlite3 -y
```

4. Install Nginx:
```bash
sudo apt install nginx -y
```

5. Install PM2 globally:
```bash
sudo npm install -g pm2
```

## Application Deployment

1. Clone the repository:
```bash
git clone <your-repository-url>
cd quisin
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

4. Start the application with PM2:
```bash
# Start the backend server
pm2 start npm --name "quisin-api" -- start

# Serve the frontend build
pm2 serve dist 3001 --name "quisin-frontend"

# Save PM2 configuration
pm2 save
pm2 startup
```

## Nginx Configuration

1. Create a new Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/quisin
```

2. Add the following configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/quisin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Configuration (Recommended)

1. Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

2. Obtain SSL certificate:
```bash
sudo certbot --nginx -d your_domain.com
```

## Security Setup

1. Configure UFW firewall:
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

2. Set up fail2ban:
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Database Backup

1. Create a backup directory:
```bash
mkdir -p /path/to/backups
```

2. Create a backup script:
```bash
#!/bin/bash
BACKUP_DIR="/path/to/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
sqlite3 quisin.db ".backup '$BACKUP_DIR/quisin_$TIMESTAMP.db'"
```

3. Set up a daily cron job:
```bash
sudo crontab -e
# Add the following line:
0 0 * * * /path/to/backup-script.sh
```

## Monitoring

1. Monitor application logs:
```bash
# Backend logs
pm2 logs quisin-api

# Frontend logs
pm2 logs quisin-frontend
```

2. Monitor system resources:
```bash
pm2 monit
```

## Updating the Application

1. Pull the latest changes:
```bash
git pull origin main
```

2. Install dependencies and rebuild:
```bash
npm install
npm run build
```

3. Restart the services:
```bash
pm2 restart all
```

## Troubleshooting

1. Check application logs:
```bash
pm2 logs
```

2. Check Nginx logs:
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

3. Check database:
```bash
sqlite3 quisin.db
.tables
.schema menu_items
```

4. Verify services are running:
```bash
pm2 status
sudo systemctl status nginx
```

## Important Notes

1. Always backup the database before updates
2. Keep the system and dependencies updated
3. Monitor disk space regularly
4. Set up proper logging rotation
5. Implement regular security updates

## Support

For issues and support:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## License

MIT License

Copyright (c) 2024 Nitrogen Technologies and Tracom Services Limited

All rights reserved.

This software is provided under a proprietary license and may not be used, copied, modified, merged, or distributed without the express permission of the copyright holders. 

By obtaining a copy of this software, you agree to use it only for personal or internal business purposes, and you shall not distribute, sublicense, or sell copies of the software. Any modification, reverse engineering, or decompilation of the software is strictly prohibited.

This software is provided "as is," without warranty of any kind, either express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, or non-infringement. In no event shall the authors or copyright holders be liable for any claims, damages, or other liabilities, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use of the software.

For any commercial usage, distribution, or licensing inquiries, please contact Nitrogen Technologies or Tracom Services Limited via their contact information.
