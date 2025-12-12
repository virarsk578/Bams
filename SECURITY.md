# Security Guidelines

## API Key Protection

### DO:
- Use environment variables in production
- Implement backend proxy for API calls
- Rotate keys regularly
- Use API key restrictions in Google Cloud Console

### DO NOT:
- Commit API keys to version control
- Share keys publicly
- Use same key for development and production

## Environment Setup

### Development:
```bash
# Create .env.local (not tracked by git)
echo "GEMINI_API_KEY=your_key_here" > .env.local
