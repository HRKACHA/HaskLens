# HaskLens — Interactive Haskell Compiler & Optimization Observatory

A visual compiler explorer, AST inspector, type checker, and algebraic optimizer for Haskell functional programs.

## Project Structure

```
├── backend/          # FastAPI Python backend
│   ├── app/
│   │   ├── api/      # API routes
│   │   ├── compiler/ # Compiler pipeline (lexer, parser, optimizer, etc.)
│   │   └── main.py   # Entry point
│   └── requirements.txt
└── frontend/         # React + Vite frontend
    ├── src/
    └── package.json
```

## Local Development

**Backend** (terminal 1):
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

**Frontend** (terminal 2):
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Deployment

- **Backend**: Deployed on [Render](https://render.com) as a Web Service
- **Frontend**: Deployed on [Vercel](https://vercel.com) as a static site
