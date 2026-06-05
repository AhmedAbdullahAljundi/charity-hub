# Deployment Guide

## Quick Start

This frontend is ready to deploy to **Vercel**, **Netlify**, or any Node.js hosting platform.

## Vercel Deployment (Recommended)

### Prerequisites
- Vercel account (free at vercel.com)
- GitHub/GitLab/Bitbucket account
- This project pushed to a Git repository

### Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial CharityHub frontend"
git branch -M main
git remote add origin https://github.com/yourusername/charityhub-frontend.git
git push -u origin main
```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Select "Import Git Repository"
   - Choose your repository
   - Click Import

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add the following:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live!

## Production Checklist

- [ ] **Environment Variables**
  - [ ] `NEXT_PUBLIC_API_URL` points to production backend
  - [ ] No sensitive keys in environment variables
  - [ ] All required vars are set

- [ ] **Security**
  - [ ] HTTPS enabled
  - [ ] CORS configured on backend
  - [ ] Authentication tokens are HttpOnly cookies (recommended)
  - [ ] JWT expiration is set

- [ ] **Performance**
  - [ ] Images are optimized
  - [ ] Code splitting is working
  - [ ] API calls are cached appropriately
  - [ ] No console errors

- [ ] **Testing**
  - [ ] Login with each role works
  - [ ] Permissions are enforced
  - [ ] API errors are handled gracefully
  - [ ] Dark mode works
  - [ ] Mobile responsive

- [ ] **Monitoring**
  - [ ] Error tracking is enabled (Sentry, etc.)
  - [ ] Analytics are working
  - [ ] API performance is monitored

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Expose port
EXPOSE 3000

# Start
CMD ["pnpm", "start"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:3001
    depends_on:
      - backend

  backend:
    build: ../backend
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/charityhub
```

### Run with Docker

```bash
# Build image
docker build -t charityhub-frontend:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://api.example.com \
  charityhub-frontend:latest
```

## Environment Variables Reference

| Variable | Type | Required | Example |
|----------|------|----------|---------|
| `NEXT_PUBLIC_API_URL` | string | Yes | `https://api.charityhub.org` |
| `NEXT_PUBLIC_API_TIMEOUT` | string | No | `30000` |
| `NEXT_PUBLIC_ANALYTICS_ID` | string | No | `GA-123456` |

## Build Configuration

### Build Output
```
.next/
├── standalone/       # Optimized production build
├── static/          # Static files
└── public/          # Public assets
```

### Build Size
- **JavaScript:** ~150KB (gzipped)
- **Total:** ~300KB (all assets gzipped)

## Performance Optimization

### Already Configured
- ✅ Image optimization
- ✅ Code splitting
- ✅ Tree shaking
- ✅ CSS minification
- ✅ JavaScript minification

### Additional Optimizations
```typescript
// next.config.ts
const nextConfig = {
  compress: true,
  swcMinify: true,
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: false,
    domains: ['your-cdn.com'],
  },
}
```

## HTTPS/SSL

- **Vercel:** Automatic SSL
- **Netlify:** Automatic SSL
- **Self-hosted:** Use Let's Encrypt (free)

```bash
# Using Certbot (Let's Encrypt)
sudo certbot certonly --standalone -d yourdomain.com
```

## CDN Configuration

### Cloudflare

1. Add domain to Cloudflare
2. Update nameservers
3. Enable Page Rules:
   - Cache Level: Cache Everything
   - Browser Cache TTL: 1 hour
4. Enable HTTP/2 Push

### AWS CloudFront

1. Create distribution
2. Point to Vercel domain
3. Set cache behavior:
   - Default TTL: 86400 (1 day)
   - Max TTL: 31536000 (1 year)

## Monitoring & Logging

### Sentry (Error Tracking)

```typescript
// instrumentation.ts or app/layout.tsx
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### Application Performance Monitoring

```typescript
// Use Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

## Backup & Recovery

### Database Backups
- Backend team handles database backups
- Verify backup retention policy

### Code Backups
- Use Git with multiple remotes
- Store releases as GitHub releases

## Rollback Procedure

**If deployment fails:**

1. **Vercel Dashboard**
   - Go to Deployments
   - Click on previous stable version
   - Click "Redeploy"

2. **Manual Rollback**
```bash
git revert HEAD
git push origin main
# Vercel auto-redeploys
```

## Scaling

### Horizontal Scaling
- Vercel handles this automatically
- No configuration needed

### Database Connection Pooling
- Already configured in backend
- Frontend doesn't need changes

## Costs

### Vercel
- **Free:** 100GB bandwidth/month
- **Pro:** $20/month, unlimited bandwidth
- **Enterprise:** Custom pricing

## Support & Documentation

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Deployment Guides: https://vercel.com/guides

---

**Need help?** Check the INTEGRATION_GUIDE.md for more details on connecting to your backend!
