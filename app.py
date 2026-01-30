from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# health check
@app.route("/")
def home():
    return "Backend OK"

# chat endpoint (NO AI, dummy logic)
@app.route("/chat", methods=["POST"])
def chat():
    data = request.json

    decision = data.get("decision", "")
    context = data.get("context", "")

    if decision == "":
        return jsonify({"reply": "Please enter a decision."})

    reply = f"""
Earlier you asked about: "{decision}"

Considering your present situation:
{context}

Suggestion:
Think again based on your current priorities, time, and constraints.
"""

    return jsonify({"reply": reply})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
