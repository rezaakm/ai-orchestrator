# Manual Transfer to Cursor Web

Due to git permission issues, use this manual transfer method:

## Option 1: Direct Folder Access (Easiest)

If Cursor Web can access your local filesystem:

1. Open Cursor Web
2. Open folder: `d:\MY AI PROJECTS\ai-orchestrator`
3. Run: `npm install`
4. Copy your API keys:
   - Run: `.\backup-env.ps1` (copies `.env.local` to clipboard)
   - Or manually copy `.env.local` contents
5. Create `.env.local` in Cursor Web and paste
6. Run: `npm run dev`

## Option 2: GitHub (if you can bypass push protection)

Visit the GitHub URLs provided in the push error and click "Allow secret" for each one:
- https://github.com/rezaakm/ai-orchestrator/security/secret-scanning/unblock-secret/3989iCx6WsUDnxobILIGZhI6QKW
- https://github.com/rezaakm/ai-orchestrator/security/secret-scanning/unblock-secret/3989iE7vOBbs34iyUionzoLWQ6z
- https://github.com/rezaakm/ai-orchestrator/security/secret-scanning/unblock-secret/3989iDM4WcXnk9nL8VIm9tQscrQ

Then run:
```bash
cd "d:\MY AI PROJECTS\ai-orchestrator"
git push -u origin main --force
```

## Option 3: Zip and Upload

1. Zip the project folder (exclude `node_modules` and `.git`)
2. Upload to Cursor Web
3. Extract
4. Run `npm install`
5. Use `backup-env.ps1` to copy API keys, create `.env.local` in Cursor Web

## Option 4: Fresh Clone in Cursor Web

The repository https://github.com/rezaakm/ai-orchestrator already exists. You can:

1. Delete it on GitHub
2. Create a new one
3. Push from local (without TRANSFER_TO_CURSOR_WEB.md which had keys)
4. Clone in Cursor Web
5. Manually create `.env.local` with your keys

## Recommended: Option 1

Just open the folder `d:\MY AI PROJECTS\ai-orchestrator` directly in Cursor Web if it has filesystem access.
