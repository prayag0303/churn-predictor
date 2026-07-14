# Deployment Guide

## Prerequisites
- GitHub account
- Render account (free tier available)
- Vercel account (free tier available)
- Git installed locally
- Node.js and Python installed locally

---

## Step 1: Push to GitHub

### 1.1 Create a GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click **New** to create a new repository
3. Name it `churn-predictor` (or your preferred name)
4. **DO NOT** initialize with README (you already have one)
5. Click **Create repository**

### 1.2 Initialize Git and Push Code

```bash
# Navigate to project root
cd c:\Users\Prayag\OneDrive\Desktop\Churn\churn-predictor

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: churn predictor app"

# Add remote origin (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/churn-predictor.git

# Push to main branch
git branch -M main
git push -u origin main
```

### 1.3 Verify on GitHub
- Go to your repository on GitHub
- Confirm all files are there
- Check that `.env` files are NOT committed (only `.env.example` should be)

---

## Step 2: Deploy Backend on Render

### 2.1 Connect Render to GitHub

1. Go to [render.com](https://render.com) and sign up/sign in
2. Click **New +** → **Web Service**
3. Select **Deploy an existing repository** or search for your repository
4. Authorize GitHub and select `churn-predictor`
5. Fill in the configuration:
   - **Name**: `churn-predictor-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3.11`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (or paid for better performance)

### 2.2 Add Environment Variables

In Render dashboard for your service:
1. Go to **Environment** tab
2. Add these variables:
   ```
   PYTHON_VERSION = 3.11
   FRONTEND_URL = https://your-frontend.vercel.app
   ```

### 2.3 Deploy

1. Click **Create Web Service**
2. Wait for deployment to complete (3-5 minutes)
3. Once deployed, copy your API URL (format: `https://churn-predictor-api.onrender.com`)

### 2.4 Update CORS

If your Vercel frontend URL changes:
1. Edit `backend/main.py`
2. Update the `allow_origins` list with your Vercel domain
3. Commit and push: 
   ```bash
   git add backend/main.py
   git commit -m "Update CORS for production domains"
   git push
   ```
4. Render will auto-redeploy

---

## Step 3: Update Frontend Configuration

### 3.1 Create Environment Variables

1. Navigate to `frontend/` directory
2. Rename `.env.example` to `.env.local`:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
3. Update `.env.local` with your Render API URL:
   ```
   VITE_API_URL=https://churn-predictor-api.onrender.com
   ```

### 3.2 Update API Client

Ensure `frontend/src/api/client.js` uses the environment variable:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_URL,
});

export default client;
```

### 3.3 Commit Changes

```bash
# DO NOT commit .env.local - it's in .gitignore
# Only .env.example should be committed (it's the template)
git add frontend/.env.example
git commit -m "Add environment configuration template"
git push
```

**Note**: `.env.local` is in `.gitignore` and should ONLY exist on your local machine and in production/deployment environments (Vercel will use the environment variables set in their dashboard).

---

## Step 4: Deploy Frontend on Vercel

### 4.1 Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com) and sign up/sign in with GitHub
2. Click **Add New** → **Project**
3. Import your `churn-predictor` repository
4. Select the repository and click **Import**

### 4.2 Configure Build Settings

In the import dialog:
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4.3 Add Environment Variables

After import, in the Vercel dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://churn-predictor-api.onrender.com`
   - **Environments**: Check `Production`, `Preview`, and `Development`
3. Click **Save**

**Note**: Do NOT use the `vercel.json` approach for environment variables - set them directly in the Vercel dashboard instead.

### 4.4 Deploy

1. Click **Deploy**
2. Wait for deployment (2-3 minutes)
3. Once complete, you'll get a URL like: `https://churn-predictor.vercel.app`
4. Copy this URL

### 4.5 Update Backend CORS

1. Go back to your `backend/main.py`
2. Update the `allow_origins` with your final Vercel URL:
   ```python
   allow_origins=[
       "http://localhost:5173",
       "http://localhost:3000",
       "https://*.vercel.app",
       "https://your-actual-vercel-url.vercel.app",  # Add your exact Vercel URL
   ]
   ```
3. Commit and push - Render will auto-redeploy

---

## Step 5: Test Deployment

### 5.1 Test Backend
```bash
# Visit in browser
https://churn-predictor-api.onrender.com/
```

You should see:
```json
{
  "message": "Churn Predictor API is running",
  "version": "1.0"
}
```

### 5.2 Test Frontend
1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Navigate through pages
3. Test API calls (Customer list, predictions, etc.)
4. Check browser console for any CORS errors

### 5.3 Troubleshoot CORS Errors

If you see CORS errors in browser console:
1. Update `backend/main.py` `allow_origins` list
2. Commit and push
3. Render will auto-redeploy
4. Hard refresh your frontend (Ctrl+Shift+R)

---

## Step 6: Continuous Deployment

### Auto-Deploy Configuration

Both Render and Vercel are already configured for auto-deploy:

- **On Render**: Every push to `main` branch auto-deploys
- **On Vercel**: Every push to `main` branch auto-deploys

### To Deploy Changes

```bash
# Make changes to code
# Then:
git add .
git commit -m "Describe your changes"
git push origin main

# Services will automatically redeploy
```

---

## Useful Commands

### Local Development

```bash
# Start backend (from backend/ folder)
uvicorn main:app --reload

# Start frontend (from frontend/ folder)
npm run dev

# Build frontend
npm run build
```

### Git Workflow

```bash
# Check status
git status

# Add specific files
git add filename

# Add all changes
git add .

# Commit
git commit -m "message"

# Push to GitHub
git push origin main

# Pull latest
git pull origin main
```

### View Logs

- **Render**: Dashboard → Select service → Logs tab
- **Vercel**: Dashboard → Select project → Deployments tab → View logs

---

## Environment Variables Summary

### Backend (.env)
```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Frontend (.env.local)
```
VITE_API_URL=https://your-render-api.onrender.com
```

---

## Important Notes

1. **Free Tier Limitations**:
   - Render free tier spins down after 15 minutes of inactivity
   - First request after spin-down takes 30-60 seconds
   - Vercel free tier has generous limits

2. **Custom Domains** (Optional):
   - Render: Settings → Custom Domain
   - Vercel: Settings → Domains

3. **SSL Certificates**: Both services provide free SSL certificates

4. **Monitoring**:
   - Check Render dashboard for uptime and errors
   - Check Vercel dashboard for build logs and performance

---

## Support

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com/deployment/
- Vite Docs: https://vitejs.dev/guide/
