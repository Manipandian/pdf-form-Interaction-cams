# Deployment Guide

This guide covers deploying the AI PDF Form Interaction application to various platforms and environments.

## Prerequisites

Before deployment, ensure you have:

- Node.js 18+ installed locally
- Git repository with your code
- Azure AI Document Intelligence service configured
- Environment variables ready

## Environment Variables

All deployment platforms require these environment variables:

```env
# Required
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=your-32-character-key-here
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# Optional
NODE_ENV=production
```

## Vercel Deployment (Recommended)

Vercel provides the best experience for Next.js applications with automatic optimizations and global CDN.

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/pdf-form-interaction)

### Manual Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project directory**:
   ```bash
   vercel
   ```

4. **Configure environment variables**:
   - Go to your project dashboard on vercel.com
   - Navigate to Settings → Environment Variables
   - Add the required variables:
     - `AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT`
     - `AZURE_DOCUMENT_INTELLIGENCE_KEY`

5. **Redeploy**:
   ```bash
   vercel --prod
   ```

### Vercel Configuration

Create `vercel.json` for advanced configuration:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "app/api/analyze/route.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## Netlify Deployment

1. **Connect Repository**:
   - Go to netlify.com and sign in
   - Click "New site from Git"
   - Select your repository

2. **Build Settings**:
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Environment Variables**:
   - Go to Site settings → Environment variables
   - Add Azure credentials

4. **Deploy**:
   - Click "Deploy site"

### Netlify Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

## Docker Deployment

### Production Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ARG AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT
ARG AZURE_DOCUMENT_INTELLIGENCE_KEY
ENV AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=$AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT
ENV AZURE_DOCUMENT_INTELLIGENCE_KEY=$AZURE_DOCUMENT_INTELLIGENCE_KEY

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  pdf-form-app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=${AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT}
        - AZURE_DOCUMENT_INTELLIGENCE_KEY=${AZURE_DOCUMENT_INTELLIGENCE_KEY}
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=${AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT}
      - AZURE_DOCUMENT_INTELLIGENCE_KEY=${AZURE_DOCUMENT_INTELLIGENCE_KEY}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Build and Run

```bash
# Build image
docker build -t pdf-form-interaction .

# Run container
docker run -p 3000:3000 \
  -e AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT="your-endpoint" \
  -e AZURE_DOCUMENT_INTELLIGENCE_KEY="your-key" \
  pdf-form-interaction

# Or use docker-compose
docker-compose up -d
```

## AWS Deployment

### AWS Amplify

1. **Connect Repository**:
   - Go to AWS Amplify console
   - Click "New app" → "Host web app"
   - Connect your Git repository

2. **Build Settings**:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm ci
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

3. **Environment Variables**:
   - Go to App settings → Environment variables
   - Add Azure credentials

### AWS ECS (Elastic Container Service)

1. **Push to ECR**:
   ```bash
   # Build and tag image
   docker build -t pdf-form-interaction .
   docker tag pdf-form-interaction:latest 123456789012.dkr.ecr.us-west-2.amazonaws.com/pdf-form-interaction:latest
   
   # Push to ECR
   aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-west-2.amazonaws.com
   docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/pdf-form-interaction:latest
   ```

2. **Create ECS Task Definition**:
   ```json
   {
     "family": "pdf-form-interaction",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "256",
     "memory": "512",
     "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "pdf-form-app",
         "image": "123456789012.dkr.ecr.us-west-2.amazonaws.com/pdf-form-interaction:latest",
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "NODE_ENV",
             "value": "production"
           }
         ],
         "secrets": [
           {
             "name": "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT",
             "valueFrom": "arn:aws:ssm:us-west-2:123456789012:parameter/pdf-app/azure-endpoint"
           },
           {
             "name": "AZURE_DOCUMENT_INTELLIGENCE_KEY", 
             "valueFrom": "arn:aws:ssm:us-west-2:123456789012:parameter/pdf-app/azure-key"
           }
         ]
       }
     ]
   }
   ```

## Google Cloud Platform

### Cloud Run

1. **Build and Deploy**:
   ```bash
   # Build for Cloud Run
   gcloud builds submit --tag gcr.io/PROJECT-ID/pdf-form-interaction
   
   # Deploy to Cloud Run
   gcloud run deploy pdf-form-interaction \
     --image gcr.io/PROJECT-ID/pdf-form-interaction \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars NODE_ENV=production \
     --set-env-vars AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT="your-endpoint" \
     --set-env-vars AZURE_DOCUMENT_INTELLIGENCE_KEY="your-key"
   ```

### App Engine

Create `app.yaml`:

```yaml
runtime: nodejs18

env_variables:
  NODE_ENV: production
  AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT: your-endpoint-here
  AZURE_DOCUMENT_INTELLIGENCE_KEY: your-key-here

automatic_scaling:
  min_instances: 0
  max_instances: 10
  target_cpu_utilization: 0.6

resources:
  cpu: 1
  memory_gb: 0.5
  disk_size_gb: 10
```

Deploy:
```bash
gcloud app deploy
```

## Azure Deployment

### Azure Static Web Apps

1. **GitHub Integration**:
   - Go to Azure Portal → Static Web Apps
   - Create new static web app
   - Connect to GitHub repository

2. **GitHub Actions Workflow** (auto-generated):
   ```yaml
   name: Azure Static Web Apps CI/CD
   
   on:
     push:
       branches:
         - main
     pull_request:
       types: [opened, synchronize, reopened, closed]
       branches:
         - main
   
   jobs:
     build_and_deploy_job:
       if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
       runs-on: ubuntu-latest
       name: Build and Deploy Job
       steps:
         - uses: actions/checkout@v2
           with:
             submodules: true
         - name: Build And Deploy
           id: builddeploy
           uses: Azure/static-web-apps-deploy@v1
           with:
             azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
             repo_token: ${{ secrets.GITHUB_TOKEN }}
             action: "upload"
             app_location: "/"
             api_location: ""
             output_location: ".next"
   ```

### Azure Container Instances

```bash
# Create resource group
az group create --name pdf-form-rg --location eastus

# Create container instance
az container create \
  --resource-group pdf-form-rg \
  --name pdf-form-app \
  --image your-registry/pdf-form-interaction:latest \
  --cpu 1 \
  --memory 1.5 \
  --registry-login-server your-registry.azurecr.io \
  --registry-username your-username \
  --registry-password your-password \
  --environment-variables \
    NODE_ENV=production \
    AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=your-endpoint \
  --secure-environment-variables \
    AZURE_DOCUMENT_INTELLIGENCE_KEY=your-key \
  --ports 3000
```

## SSL/HTTPS Configuration

### Let's Encrypt with Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring and Logging

### Health Check Endpoint

Create `app/api/health/route.ts`:

```typescript
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown'
  });
}
```

### Application Insights (Azure)

```typescript
// lib/telemetry.ts
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: process.env.NEXT_PUBLIC_APPINSIGHTS_INSTRUMENTATIONKEY
  }
});

appInsights.loadAppInsights();
export { appInsights };
```

### Logging Configuration

```typescript
// lib/logger.ts
const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta, timestamp: new Date().toISOString() }));
  },
  error: (message: string, error?: Error) => {
    console.error(JSON.stringify({ level: 'error', message, error: error?.message, stack: error?.stack, timestamp: new Date().toISOString() }));
  }
};

export default logger;
```

## Performance Optimization

### CDN Configuration

For static assets, configure CDN headers:

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};
```

### Database Integration (Future)

For persistent storage, consider:

```typescript
// lib/database.ts - Example with Prisma
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

export default prisma;
```

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Ensure environment variables are set

2. **API Errors**:
   - Verify Azure credentials are correct
   - Check endpoint URL format
   - Confirm API key permissions

3. **Memory Issues**:
   - Increase container memory allocation
   - Optimize PDF processing for large files
   - Implement request queuing

4. **Performance Issues**:
   - Enable compression in reverse proxy
   - Configure CDN for static assets
   - Implement caching strategies

### Debugging Commands

```bash
# Check container logs
docker logs pdf-form-interaction

# Test health endpoint
curl https://your-domain.com/api/health

# Verify environment variables
docker exec pdf-form-interaction env | grep AZURE

# Check disk space
docker exec pdf-form-interaction df -h
```

## Security Checklist

- [ ] HTTPS enabled with valid certificate
- [ ] Environment variables secured (not in code)
- [ ] API keys rotated regularly
- [ ] Security headers configured
- [ ] File upload validation enabled
- [ ] Rate limiting implemented
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies regularly updated
- [ ] Container runs as non-root user
- [ ] Network policies configured (if applicable)

## Backup and Recovery

### Environment Variables Backup

```bash
# Export environment variables
vercel env pull .env.backup

# Restore environment variables  
vercel env push .env.backup
```

### Application State

Since the application is stateless, recovery involves:
1. Redeploying from the latest Git commit
2. Restoring environment variables
3. Verifying Azure service connectivity

For persistent data (future enhancement):
- Database backups with point-in-time recovery
- File storage backups for uploaded documents
- Configuration management with version control