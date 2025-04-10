from flask import Flask, request, jsonify
import google.generativeai as genai
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Set up Gemini API
GEMINI_API_KEY = "AIzaSyDNdrSbcjnSshq5LSWEg4gU_67ieJBiJ0c"
genai.configure(api_key=GEMINI_API_KEY)

# Load CSV files into Pandas DataFrames
indian_scholarships = pd.read_csv("indian_scholarships.csv")
international_scholarships = pd.read_csv("international_scholarships_cleaned.csv")

# Function to search scholarships in CSV
def search_scholarships(query):
    query = query.lower()
    # Filter scholarships based on keyword match
    indian_results = indian_scholarships[
        indian_scholarships.apply(lambda row: row.astype(str).str.lower().str.contains(query).any(), axis=1)
    ]
    international_results = international_scholarships[
        international_scholarships.apply(lambda row: row.astype(str).str.lower().str.contains(query).any(), axis=1)
    ]

    # Convert results to JSON format
    return {
        "indian_scholarships": indian_results.to_dict(orient="records"),
        "international_scholarships": international_results.to_dict(orient="records"),
    }

# Generate AI response using Gemini
def generate_response(user_input):
    model = genai.GenerativeModel("gemini-pro")
    response = model.generate_content(user_input)
    return response.text

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    user_query = data.get("query", "")

    # Get AI-generated response
    ai_response = generate_response(user_query)

    # Search for scholarships based on query
    scholarships = search_scholarships(user_query)

    return jsonify({
        "ai_response": ai_response,
        "scholarships": scholarships
    })

if __name__ == "__main__":
    app.run(debug=True)
