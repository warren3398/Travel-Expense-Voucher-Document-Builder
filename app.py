from flask import Flask, request, jsonify, send_from_directory
from pathlib import Path
import re

app = Flask(__name__, static_folder=".", static_url_path="")

@app.get("/")
def home():
    return send_from_directory(".", "OPEN_TEV_WEBSITE.html")

@app.post("/api/to")
def read_to():
    f = request.files.get("file")
    if not f:
        return jsonify({"error":"No file uploaded"}), 400
    # Server endpoint scaffold. The production OCR engine is plugged in here.
    name = f.filename or ""
    m = re.search(r"(20\d{2}-\d{2}-\d{4,6})", name)
    return jsonify({
        "toNumber": m.group(1) if m else "",
        "message": "Backend upload endpoint is working. OCR engine integration is the next server component."
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
