# ✅ PHONE WRAPS - PRODUCTION DEPLOYMENT CHECKLIST

Print this checklist and check off items as you complete them.

---

## 📋 PHASE 1: PRE-DEPLOYMENT SETUP

### Environment Configuration
- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `NEXT_PUBLIC_BACKEND_URL` (production API URL)
- [ ] Set `NEXT_PUBLIC_RAZORPAY_KEY_ID` (production Razorpay key)
- [ ] Set `NEXT_PUBLIC_SITE_URL` (your domain)
- [ ] Set `NODE_ENV=production`
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] **Never commit `.env.local` to version control**

### Dependencies & Security
- [ ] Run `npm install` to ensure all dependencies
- [ ] Run `npm audit` to check vulnerabilities
- [ ] Fix critical and high vulnerabilities: `npm audit fix`
- [ ] Check for outdated packages: `npm outdated`
- [ ] Update if needed: `npm update`

### Code Quality
- [ ] Run `npm run lint` - should pass with no errors
- [ ] Run `npm run build` - should complete successfully
- [ ] Run `.\production-check.ps1` - all checks should pass
- [ ] Review any TypeScript errors
- [ ] Review any ESLint warnings

---

## 📋 PHASE 2: TESTING

### Local Testing
- [ ] Test build locally: `npm start`
- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Images load properly

### Authentication Testing
- [ ] Login with email/password works
- [ ] Login with email OTP works
- [ ] Login with phone OTP works
- [ ] Signup with email works
- [ ] Signup with phone works
- [ ] Logout works
- [ ] Password validation works
- [ ] Error messages are user-friendly

### E-commerce Flow Testing
- [ ] Browse products
- [ ] Search products
- [ ] Filter products
- [ ] View product details
- [ ] Add to cart
- [ ] Update cart quantities
- [ ] Remove from cart
- [ ] Apply coupon code
- [ ] Remove coupon
- [ ] Proceed to checkout

### Payment Testing
- [ ] Razorpay test mode works
- [ ] UPI payment flow (test)
- [ ] Card payment flow (test)
- [ ] Cash on Delivery works
- [ ] Payment success handling
- [ ] Payment failure handling
- [ ] Payment cancellation handling
- [ ] Order confirmation displays

### Order Management
- [ ] View orders page
- [ ] Orders display correctly
- [ ] Order details show properly
- [ ] Custom designs appear in orders

### Mobile Responsiveness
- [ ] Test on mobile device (iPhone/Android)
- [ ] Test on tablet
- [ ] All pages are mobile-friendly
- [ ] Touch interactions work
- [ ] Scroll behavior is smooth

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers

---

## 📋 PHASE 3: PERFORMANCE & SEO

### Performance Audit
- [ ] Run Lighthouse audit
- [ ] Performance score > 90
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 95

### Core Web Vitals
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Time to Interactive < 3.8s
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms

### SEO Verification
- [ ] View page source - meta tags present
- [ ] Title tags are descriptive
- [ ] Meta descriptions are present
- [ ] Open Graph tags present
- [ ] Twitter Card tags present
- [ ] Robots.txt accessible
- [ ] Sitemap.xml exists (if applicable)

### Image Optimization
- [ ] Images use Next.js Image component
- [ ] Images are properly sized
- [ ] Images load from CDN
- [ ] AVIF/WebP formats supported
- [ ] Lazy loading works

---

## 📋 PHASE 4: DEPLOYMENT

### Pre-Deployment
- [ ] All tests pass
- [ ] Build completes without errors
- [ ] Environment variables configured
- [ ] Database backup (backend)
- [ ] Deployment plan documented

### Deployment Process
- [ ] Deploy to staging first (if available)
- [ ] Test on staging environment
- [ ] Deploy to production

**For Vercel:**
```bash
- [ ] Install Vercel CLI: npm i -g vercel
- [ ] Run: vercel login
- [ ] Run: vercel --prod
- [ ] Wait for deployment to complete
```

**For Other Platforms:**
- [ ] Follow platform-specific instructions
- [ ] Set environment variables in platform
- [ ] Configure build settings
- [ ] Deploy

### Post-Deployment Verification
- [ ] Visit production URL
- [ ] Homepage loads
- [ ] SSL certificate is valid (HTTPS)
- [ ] All API calls work
- [ ] Payment gateway connects
- [ ] Test complete user journey
- [ ] Check browser console (no errors)
- [ ] Check Network tab (API calls succeed)

---

## 📋 PHASE 5: MONITORING & MAINTENANCE

### Monitoring Setup
- [ ] Set up Sentry (error tracking)
- [ ] Configure error alerts
- [ ] Set up analytics (Google Analytics/Plausible)
- [ ] Set up uptime monitoring
- [ ] Configure performance monitoring

### Security
- [ ] HTTPS enabled
- [ ] Security headers verified
- [ ] CSP configured (if needed)
- [ ] Rate limiting on backend
- [ ] API keys secured

### Backup & Recovery
- [ ] Database backup schedule (backend)
- [ ] Code repository backed up
- [ ] Deployment rollback plan documented

---

## 📋 PHASE 6: POST-LAUNCH

### Week 1
- [ ] Monitor error logs daily
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Fix critical issues immediately

### Month 1
- [ ] Run security audit
- [ ] Review analytics
- [ ] Optimize slow pages
- [ ] Update dependencies
- [ ] Document learnings

---

## 🚨 EMERGENCY PROCEDURES

### If Site Goes Down
1. [ ] Check hosting platform status
2. [ ] Check backend API status
3. [ ] Check DNS settings
4. [ ] Review recent changes
5. [ ] Rollback if necessary

### If Payments Fail
1. [ ] Check Razorpay dashboard
2. [ ] Verify API keys
3. [ ] Check backend logs
4. [ ] Test payment flow
5. [ ] Contact Razorpay support if needed

### If Critical Bug Found
1. [ ] Document the bug
2. [ ] Assess severity
3. [ ] Fix locally and test
4. [ ] Deploy fix quickly
5. [ ] Verify fix in production
6. [ ] Notify affected users

---

## 📊 SUCCESS CRITERIA

Your deployment is successful when:
- ✅ All checklist items are completed
- ✅ No critical errors in production
- ✅ Performance metrics meet targets
- ✅ Users can complete purchases
- ✅ Monitoring is active
- ✅ Team knows emergency procedures

---

## 📞 IMPORTANT CONTACTS

**Hosting Support:**
- Platform: ________________
- Support URL: ________________
- Emergency Email: ________________

**Payment Gateway:**
- Razorpay Support: support@razorpay.com
- Dashboard: https://dashboard.razorpay.com

**Team Contacts:**
- Backend Developer: ________________
- DevOps: ________________
- Product Owner: ________________

---

## 📝 DEPLOYMENT LOG

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version/Commit:** _______________  
**Environment:** Production  

**Issues Encountered:**
- ______________________________
- ______________________________
- ______________________________

**Resolution:**
- ______________________________
- ______________________________
- ______________________________

**Rollback Required:** Yes / No  
**Rollback Time:** _______________  

---

## ✅ FINAL SIGN-OFF

I confirm that:
- [ ] All checklist items are completed
- [ ] Application is fully tested
- [ ] Monitoring is set up
- [ ] Team is notified
- [ ] Documentation is updated

**Signed:** _______________  
**Date:** _______________  
**Time:** _______________

---

**🎉 READY FOR LAUNCH! 🚀**

Keep this checklist for future deployments and reference.
