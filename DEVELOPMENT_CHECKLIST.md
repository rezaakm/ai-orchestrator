# Development Checklist

Use this checklist when adding new features to the AI Orchestrator.

## ✅ Phase 1: Research Service (COMPLETED)

- [x] Project initialization and dependencies
- [x] TypeScript configuration with ES modules
- [x] Environment variables setup
- [x] Folder structure (clients, services, types)
- [x] Perplexity API client
- [x] Anthropic Claude API client
- [x] Research service with parallel calls
- [x] Intelligent caching (1-hour TTL)
- [x] Express server setup
- [x] Research endpoint (`POST /research`)
- [x] Cache management endpoints
- [x] Error handling and validation
- [x] Test scripts and documentation
- [x] Server running and tested

**Status**: ✅ READY FOR PRODUCTION (after adding API keys)

---

## ✅ Phase 2: Image Generation Service (COMPLETED via Krea)

- [x] Image generation provider: Krea.AI (Flux)
- [x] `src/clients/krea.client.ts` – generateImage, getJob, listJobs
- [x] `POST /image/generate` – create image job
- [x] `GET /image/job/:jobId` – poll job status
- [x] KREA_API_KEY in `.env.local`

**Status**: ✅ Implemented (Krea). Optional: add DALL-E/Stable Diffusion later.

---

## 📝 Phase 3: Content Generation Service

### Step 1: Expand Anthropic Client
- [ ] Add content generation methods
- [ ] Support different content types (blog, social, email)
- [ ] Add tone/style parameters
- [ ] Implement streaming (optional)

### Step 2: Create Content Service
- [ ] Create `src/services/content.service.ts`
- [ ] Add content templates
- [ ] Implement quality checks
- [ ] Add content caching

### Step 3: Add Endpoint
- [ ] Add `POST /content/generate` to `src/index.ts`
- [ ] Request validation
- [ ] Response formatting
- [ ] Error handling

### Step 4: Testing
- [ ] Test different content types
- [ ] Test with context/examples
- [ ] Validate output quality
- [ ] Update documentation

---

## ✅ Phase 3.5: Canva Template & Proposals (COMPLETED)

- [x] OAuth flow: `GET /auth/canva/authorize`, `GET /auth/canva/callback` (HTML token display)
- [x] CANVA_ACCESS_TOKEN, CANVA_REFRESH_TOKEN in `.env.local` (after one-time OAuth)
- [x] Canva client: createAutofillJob, getAutofillJob, token refresh
- [x] `POST /canva/create-proposal` – create design from brand template (autofill, poll until done)
- [x] `GET /canva/autofill-job/:jobId` – get autofill job status

**Status**: ✅ Implemented. Requires Canva Enterprise for brand templates.

---

## 📝 Phase 4: Finance Endpoints (N8n Integration)

### Step 1: N8n Setup
- [ ] Create N8n workflow
- [ ] Set up webhook endpoint
- [ ] Add webhook URL to `.env.local`
- [ ] Test N8n connection

### Step 2: Create Finance Client
- [ ] Create `src/clients/n8n.client.ts`
- [ ] Implement webhook caller
- [ ] Handle response parsing
- [ ] Add retry logic

### Step 3: Create Finance Service
- [ ] Create `src/services/finance.service.ts`
- [ ] Add financial data processing
- [ ] Implement analysis logic
- [ ] Add caching strategy

### Step 4: Add Endpoints
- [ ] Add `POST /finance/analyze`
- [ ] Add `POST /finance/report`
- [ ] Add other finance-specific endpoints
- [ ] Error handling

### Step 5: Testing
- [ ] Test N8n integration
- [ ] Test data flow
- [ ] Validate results
- [ ] Update documentation

---

## 🎯 Best Practices for Each New Feature

### Before Starting
1. [ ] Read existing code to understand patterns
2. [ ] Plan the API interface
3. [ ] List required dependencies
4. [ ] Update types in `src/types/index.ts`

### During Development
1. [ ] Follow existing code structure
2. [ ] Use TypeScript types everywhere
3. [ ] Add JSDoc comments to methods
4. [ ] Handle errors gracefully
5. [ ] Log important events
6. [ ] Consider caching strategy

### Testing
1. [ ] Test happy path
2. [ ] Test error cases
3. [ ] Test edge cases
4. [ ] Test with real API calls
5. [ ] Verify error messages are helpful

### Documentation
1. [ ] Update API_REFERENCE.md
2. [ ] Add examples to README.md
3. [ ] Update test scripts
4. [ ] Add usage examples
5. [ ] Document any gotchas

---

## 🔍 Code Quality Checklist

For every new feature:

### TypeScript
- [ ] No `any` types (use proper types or `unknown`)
- [ ] All function parameters typed
- [ ] All return types explicit
- [ ] Interfaces defined in `src/types/`

### Error Handling
- [ ] Try-catch blocks around API calls
- [ ] Meaningful error messages
- [ ] Proper HTTP status codes
- [ ] Logs for debugging

### Code Organization
- [ ] Client code in `src/clients/`
- [ ] Business logic in `src/services/`
- [ ] Types in `src/types/`
- [ ] Endpoints in `src/index.ts`

### Performance
- [ ] Use parallel calls when possible
- [ ] Implement caching where appropriate
- [ ] Set reasonable timeouts
- [ ] Avoid blocking operations

### Security
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Never expose API keys
- [ ] Use environment variables

---

## 🚀 Deployment Checklist (Future)

When ready to deploy:

- [ ] Remove console.logs or add proper logging
- [ ] Set up environment variables on server
- [ ] Configure CORS for production
- [ ] Add rate limiting
- [ ] Set up monitoring
- [ ] Configure SSL/HTTPS
- [ ] Add health checks
- [ ] Set up CI/CD pipeline
- [ ] Create backup strategy
- [ ] Document deployment process

---

## 📊 Current Status

**Completed**: Research Service with parallel API calls and caching
**Next**: Add your API keys and test the research endpoint
**Future**: Image generation, content generation, finance integration

---

## 💡 Tips for Success

1. **Test incrementally** - Don't build everything at once
2. **Keep it simple** - Start with basic functionality
3. **Follow patterns** - Use the research service as a template
4. **Document as you go** - Future you will thank you
5. **Commit often** - Small, focused commits are better
6. **Ask for help** - Use Cursor's AI when stuck

---

## 🎓 Learning Resources

- **Express.js**: https://expressjs.com/
- **TypeScript**: https://www.typescriptlang.org/
- **Anthropic API**: https://docs.anthropic.com/
- **Perplexity API**: https://docs.perplexity.ai/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

---

## 📝 Notes

Use this space for project-specific notes:

```
[Your notes here]
```
