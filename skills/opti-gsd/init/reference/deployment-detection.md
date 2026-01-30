# Deployment Platform Detection

Procedures and tables for detecting the deployment platform during init.

## Check for Deployment Config Files

```bash
# Vercel
if [ -d ".vercel" ] || [ -f "vercel.json" ]; then
  echo "vercel"
  # Query CLI if available
  vercel --version 2>/dev/null && vercel inspect --json
fi

# Netlify
if [ -d ".netlify" ] || [ -f "netlify.toml" ]; then
  echo "netlify"
  netlify --version 2>/dev/null && netlify status --json
fi

# Railway
if [ -f "railway.json" ] || [ -d ".railway" ]; then
  echo "railway"
  railway --version 2>/dev/null && railway status
fi

# Fly.io
if [ -f "fly.toml" ]; then
  echo "flyio"
  fly version 2>/dev/null && fly status --json
fi

# Render
if [ -f "render.yaml" ]; then
  echo "render"
fi

# Docker/Container
if [ -f "Dockerfile" ] || [ -f "docker-compose.yml" ]; then
  echo "docker"
fi

# PM2/VPS
if [ -f "ecosystem.config.js" ] || [ -f "pm2.json" ]; then
  echo "pm2"
fi
```

## Detection Summary Table

| Config File/Dir | Platform |
|-----------------|----------|
| `.vercel/` or `vercel.json` | Vercel |
| `.netlify/` or `netlify.toml` | Netlify |
| `railway.json` or `.railway/` | Railway |
| `fly.toml` | Fly.io |
| `render.yaml` | Render |
| `Dockerfile` or `docker-compose.yml` | Docker |
| `ecosystem.config.js` or `pm2.json` | PM2/VPS |

## Fallback: Parse Documentation

If no config files are found, parse documentation:

- Read README.md for "deployment", "production", "hosting" sections
- Extract URLs matching: `https?://[^\s]+\.(vercel\.app|netlify\.app|railway\.app|fly\.dev|onrender\.com)`
- Look for domain names and environment references

## Store Result

Store detected deployment in config:

```json
{
  "deploy": {
    "target": "{detected_platform}",
    "detected_from": "{config_file | cli | documentation | unknown}",
    "production_url": "{if detected}",
    "preview_pattern": "{if detected}"
  }
}
```
