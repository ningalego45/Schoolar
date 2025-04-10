from flask import Flask, send_from_directory, request, jsonify
import pandas as pd
from flask_cors import CORS
import os

# Initialize Flask app
app = Flask(__name__, static_folder=os.path.join(os.getcwd(), 'frontend', 'dist'))
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})


# Load datasets
try:
    govt_scholarships = pd.read_csv("indian_scholarships.csv")
    international_scholarships = pd.read_csv("international_scholarships.csv")
except FileNotFoundError:
    print("Error: CSV files not found. Ensure they are in the correct directory.")
    govt_scholarships = pd.DataFrame()
    international_scholarships = pd.DataFrame()

# Serve React frontend
@app.route('/')
def serve_react():
    return send_from_directory(app.static_folder, 'index.html')

# Serve static files (JS, CSS, images)
@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

# API endpoint for Indian scholarships
@app.route('/find_indian_scholarships', methods=['POST'])
def find_indian_scholarships():
    try:
        user_input = request.get_json()
        if not user_input:
            return jsonify({"error": "Invalid request data"}), 400

        filtered_df = govt_scholarships.copy()
        for key, value in user_input.items():
            if isinstance(value, bool):  
                filtered_df = filtered_df[filtered_df[key] == value]
            elif value:
                filtered_df = filtered_df[filtered_df[key].astype(str).str.lower() == str(value).lower()]

        result = filtered_df[filtered_df['India Outcome'] == 1]['Name'].tolist()
        return jsonify({'matching_scholarships': result})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/find_international_scholarships', methods=['POST'])
def find_international_scholarships():
    try:
        user_input = request.get_json()
        if not user_input:
            return jsonify({"error": "Invalid request data"}), 400

        filtered_df = international_scholarships.copy()

        # Ensure user_input keys match the DataFrame column names
        valid_columns = filtered_df.columns.str.lower()
        
        for key, value in user_input.items():
            key_lower = key.lower()
            if key_lower in valid_columns and value:
                filtered_df = filtered_df[filtered_df[key_lower].astype(str).str.contains(str(value), case=False, na=False)]

        if filtered_df.empty:
            return jsonify({'matching_scholarships': []})

        # Return results in expected format
        result = filtered_df.to_dict(orient='records')
        return jsonify({'matching_scholarships': result})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 
