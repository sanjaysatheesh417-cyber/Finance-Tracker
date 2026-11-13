from fastapi import FastAPI

app = FastAPI(
    title="Finance Tracker",
)

@app.get("/health")
def health():
    return {"status":"ok"}