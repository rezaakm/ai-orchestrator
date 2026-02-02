# How to Push to GitHub (Workaround for Permission Issues)

Git is having permission issues with `.git/objects`. Here are alternative methods:

## Method 1: Upload via GitHub Web Interface

1. Go to: https://github.com/rezaakm/ai-orchestrator
2. Click **Add file** → **Upload files**
3. Drag and drop these folders/files:
   - `src/` folder
   - All `.md` files (README, API_REFERENCE, etc.)
   - `package.json`, `package-lock.json`
   - `tsconfig.json`
   - `.gitignore`, `.env.example`
   - `test-api.ps1`, `test-research.http`, `example-client.ts`
   - `backup-env.ps1`
4. Commit message: "Add AI orchestrator code"
5. Click **Commit changes**

**Do NOT upload:**
- `.env.local` (has your real API keys)
- `node_modules/` (will be installed via npm)
- `.git/` folder
- `dist/` folder

## Method 2: Use GitHub Desktop

1. Download: https://desktop.github.com/
2. Open GitHub Desktop
3. Add existing repository: `d:\MY AI PROJECTS\ai-orchestrator`
4. Commit all files
5. Push to origin

## Method 3: Fix Permissions and Try Again

Run PowerShell as Administrator:

```powershell
cd "d:\MY AI PROJECTS\ai-orchestrator"

# Remove .git completely
Remove-Item -Path .git -Recurse -Force

# Reinitialize
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/rezaakm/ai-orchestrator.git
git branch -M main
git push -u origin main --force
```

## After Files Are on GitHub

1. Clone in Cursor Web
2. Create `.env.local` with your API keys (use `backup-env.ps1` to copy)
3. Run: `npm install`
4. Run: `npm run dev`

Your repository: https://github.com/rezaakm/ai-orchestrator
