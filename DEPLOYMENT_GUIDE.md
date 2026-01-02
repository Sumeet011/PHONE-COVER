# Production Deployment Guide - Phone Wraps Frontend

## Quick Start

### 1. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your production values
# Required variables:
# - NEXT_PUBLIC_BACKEND_URL
# - NEXT_PUBLIC_RAZORPAY_KEY_ID
# - NEXT_PUBLIC_SITE_URL
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Production Check
```bash
# Windows PowerShell
.\production-check.ps1

# If script execution is disabled, run:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\production-check.ps1
```

### 4. Build & Test
```bash
# Build for production
npm run build

# Test production build locally
npm start

# Visit http://localhost:3000
```

### 5. Deploy

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Option B: Other Platforms
- **Netlify:** Connect GitHub repo, set build command to `npm run build`
- **Railway:** Connect repo, auto-detects Next.js
- **AWS/Azure:** Use Docker or native deployment
- **Custom VPS:** Use PM2 or similar process manager

---

## Environment Variables

Create `.env.local` with these variables:

```env
# Backend API
NEXT_PUBLIC_BACKEND_URL=https://your-backend-api.com

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx

# Site URL (for metadata)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Node Environment
NODE_ENV=production
```

⚠️ **IMPORTANT:** 
- Never commit `.env.local` or `.env` to version control
- Use platform-specific environment variable settings for deployment
- Rotate keys regularly

---

## Pre-Deployment Checklist

### Code Quality
- [ ] `npm run lint` passes without errors
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors
- [ ] No console.log statements (run production-check.ps1)

### Configuration
- [ ] `.env.local` configured with production values
- [ ] Backend URL is accessible from production
- [ ] Razorpay key is production key (not test)
- [ ] All environment variables are set

### Testing
- [ ] Login/Signup works
- [ ] Product browsing works
- [ ] Add to cart works
- [ ] Checkout flow complete
- [ ] Payment test (use Razorpay test mode first)
- [ ] Mobile responsive
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)

### Security
- [ ] HTTPS enabled
- [ ] Security headers configured (check next.config.ts)
- [ ] No sensitive data in client code
- [ ] `npm audit` shows no critical vulnerabilities

### Performance
- [ ] Run Lighthouse audit (target: 90+)
- [ ] Images optimized
- [ ] Page load < 3s
- [ ] First Contentful Paint < 1.8s

---

## Post-Deployment

### Monitoring Setup

1. **Error Tracking (Recommended: Sentry)**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

2. **Analytics (Recommended: Google Analytics or Plausible)**
```bash
# For GA4
npm install @next/third-parties
```

3. **Performance Monitoring**
- Vercel Analytics (built-in if using Vercel)
- Google PageSpeed Insights
- Web Vitals monitoring

### Health Checks

After deployment, verify:
1. ✅ Homepage loads correctly
2. ✅ All navigation links work
3. ✅ Products display properly
4. ✅ Images load from Cloudinary
5. ✅ Cart operations work
6. ✅ Checkout flow completes
7. ✅ Payment gateway connects
8. ✅ Orders are created successfully

---

## Maintenance

### Regular Tasks

**Weekly:**
- Check error logs
- Monitor performance metrics
- Review user feedback

**Monthly:**
- Run `npm audit` and fix vulnerabilities
- Update dependencies: `npm update`
- Review and optimize slow queries
- Check uptime statistics

**Quarterly:**
- Security audit
- Performance optimization review
- Dependencies major version updates
- Backup verification

---

## Troubleshooting

### Build Failures

**Error: TypeScript errors**
```bash
# Find and fix TypeScript errors
npm run build

# If urgent, temporarily disable (NOT RECOMMENDED):
# Set ignoreBuildErrors: true in next.config.ts
```

**Error: ESLint errors**
```bash
# Fix ESLint errors
npm run lint

# Auto-fix what's possible
npm run lint -- --fix
```

### Runtime Errors

**Error: API calls fail**
- Check NEXT_PUBLIC_BACKEND_URL is correct
- Verify backend is accessible
- Check CORS settings on backend
- Verify API endpoints are correct

**Error: Razorpay not loading**
- Check NEXT_PUBLIC_RAZORPAY_KEY_ID is set
- Verify key is correct (test vs live)
- Check Razorpay script loads (check Network tab)

**Error: Images not loading**
- Verify Cloudinary configuration
- Check image URLs are valid
- Verify remotePatterns in next.config.ts

---

## Performance Optimization

### If Lighthouse Score < 90

1. **Images**
   - Use Next.js Image component everywhere
   - Optimize image sizes
   - Use AVIF/WebP formats

2. **JavaScript**
   - Dynamic imports for heavy components
   - Code splitting
   - Remove unused dependencies

3. **CSS**
   - Remove unused CSS
   - Inline critical CSS
   - Use CSS modules

4. **Fonts**
   - Use next/font for font optimization
   - Preload critical fonts
   - Subset fonts if possible

---

## Rollback Procedure

If deployment causes issues:

### Vercel
```bash
# List recent deployments
vercel list

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Other Platforms
- Use platform's rollback feature
- Or redeploy previous git commit

---

## Support & Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [BundleAnalyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Monitoring
- [Sentry](https://sentry.io) - Error tracking
- [LogRocket](https://logrocket.com) - Session replay
- [Vercel Analytics](https://vercel.com/analytics) - Web vitals

---

## Emergency Contacts

**Critical Issues:**
1. Check application logs
2. Check backend status
3. Check payment gateway status
4. Contact hosting support if needed

**Maintenance Window:**
- Schedule during low-traffic hours
- Notify users via banner/email
- Have rollback plan ready

---

## Success! 🎉

If you've completed all the checks above, your application is ready for production!

**Remember:**
- Monitor your application regularly
- Keep dependencies updated
- Respond to user feedback
- Scale infrastructure as needed

**Good luck with your launch!** 🚀
