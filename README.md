# 今天吃什么 (What to Eat Today)

一个基于 AI 的智能菜谱推荐系统，帮助你解决"今天吃什么"的困扰。

## 功能特点

- 🤖 AI 智能推荐菜谱
- 🥘 支持中餐/西餐选择
- ⏰ 按烹饪时间筛选
- 🍜 个性化口味偏好
- 🍱 特殊需求标签（适合带饭/一锅完成/简单厨具）
- 📱 响应式设计，支持移动端

## 技术栈

- Node.js
- Express
- OpenAI API
- HTML/CSS/JavaScript

## 快速开始

1. 克隆项目
```bash
git clone [你的仓库地址]
cd [项目目录]
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
创建 `.env` 文件并添加：
```
OPENAI_API_KEY=你的API密钥
OPENAI_BASE_URL=你的代理网站
PORT=3000
```

4. 启动服务器
```bash
npm start
```

5. 访问网站
打开浏览器访问 `http://localhost:3000`

## 部署指南

### 1. 服务器环境准备
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要的软件
sudo apt install nginx nodejs npm -y

# 安装 PM2
sudo npm install -g pm2
```

### 2. 项目部署结构
```
/var/www/foodapp/
├── server/
│   ├── public/
│   ├── server.js
│   ├── package.json
│   └── .env
├── logs/
└── ecosystem.config.js
```

### 3. 环境变量配置
创建 `.env` 文件并配置：
```bash
OPENAI_API_KEY=你的OpenAI API密钥
OPENAI_BASE_URL=你的OpenAI Base URL
```

### 4. PM2 配置
创建 `ecosystem.config.js`：
```javascript
module.exports = {
  apps: [{
    name: "food-recommendation",
    script: "./server/server.js",
    instances: 2,
    exec_mode: "cluster",
    env_production: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}
```

### 5. Nginx 配置
```nginx
server {
    listen 80;
    server_name your_domain.com;// 替换为你的域名
    
    root /var/www/foodapp/server/public;
    index index.html;

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 6. SSL 配置 (Cloudflare)
1. 在 Cloudflare 添加域名
2. 配置 DNS 记录
3. 启用 SSL/TLS 加密（Flexible 模式）

### 7. 日志管理
```bash
# 安装 PM2 日志轮转模块
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size '10M'
pm2 set pm2-logrotate:retain 10
pm2 set pm2-logrotate:rotateInterval '0 0 * * *'
```

## 维护指南

### 常用命令
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs food-recommendation

# 重启应用
pm2 restart food-recommendation

# 更新代码后重启
git pull
npm install
pm2 restart food-recommendation

# 检查 Nginx 状态
sudo systemctl status nginx
```

### 日志位置
- PM2 日志: `/var/www/foodapp/logs/`
- Nginx 日志: `/var/log/nginx/`

### 日志清理策略
- PM2 日志: 10MB/文件，保留10个文件
- Nginx 日志: 每日轮转，保留14天
- 应用日志: 每日轮转，保留7天
- 自动清理: 每天凌晨3点执行

### 安全提示
- 确保环境变量文件 (.env) 权限正确设置
- 定期更新系统和依赖包
- 监控服务器资源使用情况
- 定期备份重要数据和配置文件

## 联系方式

📧 Email: ruanyiyi@gmail.com  
有帮助的话能请我喝杯咖啡嘛~☕️ 

<img src="public/1.jpg" width="150" alt="微信收款码">