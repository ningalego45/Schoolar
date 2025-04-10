from flask import Flask, send_from_directory, request, jsonify
import pandas as pd
from flask_cors import CORS
import os
import json
import bcrypt
import google.generativeai as genai
import requests

app = Flask(__name__, static_folder=os.path.join(os.getcwd(), 'frontend', 'dist'))
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:5173",  # Development
            "https://your-frontend-url.vercel.app"  # Production - Update this with your actual Vercel URL
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configure Gemini API
GOOGLE_API_KEY = "AIzaSyDlETgJoJRgjaJUPBJN7KPel6PKU7FZiIw"
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GOOGLE_API_KEY}"

USERS_FILE = "users.json"
CONTACT_FILE = "contact_data.json"

# Ensure the contact JSON file exists
if not os.path.exists(CONTACT_FILE):
    with open(CONTACT_FILE, "w") as f:
        json.dump([], f)

try:
    govt_scholarships = pd.read_csv("indian_scholarships.csv")
    print("Loaded indian_scholarships.csv with columns:", govt_scholarships.columns.tolist())
    international_scholarships = pd.read_csv("international_scholarships.csv")
except FileNotFoundError:
    print("Error: CSV files not found. Ensure they are in the correct directory.")
    govt_scholarships = pd.DataFrame()
    international_scholarships = pd.DataFrame()
except Exception as e:
    print("Error loading CSV files:", str(e))
    govt_scholarships = pd.DataFrame()
    international_scholarships = pd.DataFrame()

# Don't convert columns to lowercase to maintain original column names
# govt_scholarships.columns = govt_scholarships.columns.str.strip().str.lower()
# international_scholarships.columns = international_scholarships.columns.str.strip().str.lower()

@app.route('/')
def serve_react():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder, path)

@app.route('/submit_contact', methods=['POST'])
def submit_contact():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid request data"}), 400

        with open(CONTACT_FILE, "r") as f:
            existing_data = json.load(f)

        existing_data.append(data)

        with open(CONTACT_FILE, "w") as f:
            json.dump(existing_data, f, indent=4)

        return jsonify({"message": "Form submitted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/find_indian_scholarships', methods=['POST'])
def find_indian_scholarships():
    try:
        user_input = request.get_json()
        print("Received user input:", user_input)  # Debug print
        
        if not user_input:
            return jsonify({"error": "Invalid request data"}), 400

        if govt_scholarships.empty:
            return jsonify({"error": "Scholarship database not available"}), 500

        filtered_df = govt_scholarships.copy()
        print("Initial dataframe shape:", filtered_df.shape)  # Debug print
        
        # Map user input to exact CSV column names
        criteria_mapping = {
            "education": "Education Qualification",
            "gender": "Gender",
            "community": "Community",
            "religion": "Religion",
            "isExServiceman": "Exservice-men",
            "hasDisability": "Disability",
            "hasSportsAchievements": "Sports",
            "annualPercentage": "Annual-Percentage",
            "income": "Income"
        }

        # Custom value converters
        def get_annual_percentage_category(percentage):
            try:
                return float(percentage)
            except (TypeError, ValueError):
                return None

        def get_income_category(income):
            try:
                return float(income)
            except (TypeError, ValueError):
                return None

        # Debug print the unique values in the dataset
        print("Unique values in Annual-Percentage:", govt_scholarships["Annual-Percentage"].unique())
        print("Unique values in Income:", govt_scholarships["Income"].unique())

        for key, column in criteria_mapping.items():
            if key in user_input:
                value = user_input[key]
                print(f"Processing {key} with value {value}")  # Debug print
                
                if value in [None, "", "null", "undefined"]:
                    continue
                
                if key == "annualPercentage":
                    value = get_annual_percentage_category(value)
                    if value is None:
                        continue
                    # Filter for percentage less than or equal to user input
                    # If user has 95%, they qualify for scholarships requiring 90% or 85% as well
                    print(f"Filtering by {column} <= {value}")
                    filtered_df = filtered_df[filtered_df[column].astype(float) <= float(value)]
                    print(f"Dataframe shape after filtering by {column}:", filtered_df.shape)
                    continue
                
                if key == "income":
                    value = get_income_category(value)
                    if value is None:
                        continue
                    # Filter for income greater than or equal to user input
                    # If user has income of 1.5L, they qualify for scholarships allowing 1.5L or higher
                    print(f"Filtering by {column} >= {value}")
                    filtered_df = filtered_df[filtered_df[column].astype(float) >= float(value)]
                    print(f"Dataframe shape after filtering by {column}:", filtered_df.shape)
                    continue
                
                if column in ["Exservice-men", "Disability", "Sports"]:
                    value = "Yes" if value else "No"
                
                try:
                    print(f"Filtering by {column} = {value}")  # Debug print
                    print(f"Available values in {column}:", filtered_df[column].unique())  # Debug print
                    
                    # Apply case-insensitive matching for all fields
                    filtered_df = filtered_df[
                        filtered_df[column].astype(str).str.strip().str.lower() 
                        == str(value).strip().lower()
                    ]
                    
                    print(f"Dataframe shape after filtering by {column}:", filtered_df.shape)  # Debug print
                except Exception as e:
                    print(f"Error filtering by {column}: {str(e)}")
                    continue

        if filtered_df.empty:
            print("No matching scholarships found")  # Debug print
            return jsonify({'matching_scholarships': []})

        # Get matching scholarships
        result_df = filtered_df
        if 'Outcome' in filtered_df.columns:
            result_df = filtered_df[filtered_df['Outcome'] == 1]
        
        # Convert to list of dictionaries with proper formatting
        scholarships = []
        for _, row in result_df.iterrows():
            try:
                # Create a more detailed description
                description_parts = []
                if row['Education Qualification']: description_parts.append(f"Education: {row['Education Qualification']}")
                if row['Gender']: description_parts.append(f"Gender: {row['Gender']}")
                if row.get('Community'): description_parts.append(f"Community: {row['Community']}")
                if row.get('Religion'): description_parts.append(f"Religion: {row['Religion']}")
                if row.get('Annual-Percentage'): description_parts.append(f"Annual Percentage: {row['Annual-Percentage']}")
                if row.get('Income'): description_parts.append(f"Income: {row['Income']}")
                if row.get('Exservice-men') == 'Yes': description_parts.append("Ex-Serviceman")
                if row.get('Disability') == 'Yes': description_parts.append("Person with Disability")
                if row.get('Sports') == 'Yes': description_parts.append("Sports Achievement")

                # Add eligibility criteria section
                eligibility_criteria = []
                if row.get('Annual-Percentage'):
                    percentage = float(row['Annual-Percentage'])
                    eligibility_criteria.append(f"Minimum percentage required: {percentage}%")
                
                if row.get('Income'):
                    income = float(row['Income'])
                    eligibility_criteria.append(f"Minimum family income required: {income} Lakhs")

                if eligibility_criteria:
                    description_parts.append("Eligibility Requirements: " + ", ".join(eligibility_criteria))

                scholarship = {
                    'scholarship_name': row['Name'],
                    'description': ", ".join(description_parts),
                    'location': 'India',
                    'deadline': 'Contact institution',
                    'amount': 'Variable',
                    'application_link': '#',
                    'requirements': {
                        'percentage': float(row.get('Annual-Percentage', 0)),
                        'income': float(row.get('Income', 0))
                    }
                }
                scholarships.append(scholarship)
            except Exception as e:
                print(f"Error processing row: {str(e)}")
                continue

        print(f"Found {len(scholarships)} matching scholarships")  # Debug print
        return jsonify({'matching_scholarships': scholarships})

    except Exception as e:
        import traceback
        print(f"Error in find_indian_scholarships: {str(e)}")
        print("Traceback:", traceback.format_exc())
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/find_international_scholarships', methods=['POST'])
def find_international_scholarships():
    try:
        user_input = request.get_json()
        print("Received user input:", user_input)  # Debug print
        
        if not user_input:
            return jsonify({"error": "Invalid request data"}), 400

        if international_scholarships.empty:
            return jsonify({"error": "Scholarship database not available"}), 500

        filtered_df = international_scholarships.copy()
        print("Initial dataframe shape:", filtered_df.shape)  # Debug print

        # Filter by year if provided
        if user_input.get('year'):
            try:
                year_value = str(user_input['year'])
                # The Years column contains string representations of lists
                # We need to check if the selected year is in each row's list
                filtered_df = filtered_df[filtered_df['Years'].apply(
                    lambda x: year_value in str(x)
                )]
                print(f"After filtering by year: {filtered_df.shape}")  # Debug print
            except Exception as e:
                print(f"Error filtering by year: {str(e)}")

        if filtered_df.empty:
            print("No matching scholarships found")  # Debug print
            return jsonify({'matching_scholarships': []})

        # Convert to list of dictionaries with proper formatting
        scholarships = []
        for _, row in filtered_df.iterrows():
            try:
                scholarship = {
                    'name': row['Scholarship Name'],
                    'description': row.get('Description', 'No description available'),
                    'deadline': row.get('Deadline', 'Contact institution'),
                    'amount': row.get('Amount', 'Variable'),
                    'location': row.get('Location', 'International'),
                    'application_link': row.get('Link', '#')
                }
                scholarships.append(scholarship)
            except Exception as e:
                print(f"Error processing row: {str(e)}")
                continue

        print(f"Found {len(scholarships)} matching scholarships")  # Debug print
        return jsonify({'matching_scholarships': scholarships})

    except Exception as e:
        import traceback
        print(f"Error in find_international_scholarships: {str(e)}")
        print("Traceback:", traceback.format_exc())
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

def filter_by_year(df, year_input):
    """
    Filter scholarships based on the student's academic year.
    
    Args:
        df: DataFrame containing scholarships data
        year_input: The user's academic year (e.g., 'College freshman')
    
    Returns:
        Filtered DataFrame with matching scholarships
    """
    if not year_input or not isinstance(year_input, str):
        return df
        
    year_input = year_input.lower()
    
    # Handle special cases
    if year_input == 'no restrictions':
        return df[df['Year'].str.lower().str.contains('no restrictions', na=False)]
    
    # Create a mask for rows that contain the year_input or 'No Restrictions'
    mask = df['Year'].str.lower().str.contains(year_input, na=False) | \
           df['Year'].str.lower().str.contains('no restrictions', na=False)
    
    return df[mask]

def get_users():
    if not os.path.exists(USERS_FILE):
        return []
    with open(USERS_FILE, "r") as file:
        return json.load(file)

def save_users(users):
    with open(USERS_FILE, "w") as file:
        json.dump(users, file, indent=2)

@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    users = get_users()

    if any(user["email"] == email for user in users):
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    users.append({"name": name, "email": email, "password": hashed_password})
    save_users(users)

    return jsonify({"message": "User registered successfully"}), 201

@app.route("/signin", methods=["POST"])
def signin():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    users = get_users()
    user = next((user for user in users if user["email"] == email), None)

    if not user:
        return jsonify({"message": "User not found"}), 400

    if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({"message": "Invalid password"}), 400

    return jsonify({"message": "Login successful", "user": {"name": user["name"], "email": user["email"]}}), 200

# Function to get AI response
def get_ai_response(user_query, context=""):
    try:
        prompt = f"""
        You are a helpful scholarship assistant. You can help users with:
        1. Finding suitable scholarships based on their criteria
        2. Explaining scholarship requirements
        3. Providing guidance on application processes
        4. Answering general questions about scholarships and education
        5. Offering tips for successful scholarship applications
        
        Please provide concise, accurate, and helpful responses. If you don't have specific information about a particular scholarship, you can provide general guidance or suggest where to find more information.
        
        Context: {context}
        User Query: {user_query}
        """
        
        # Prepare the request data
        data = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        
        # Make the API request
        headers = {
            'Content-Type': 'application/json'
        }
        
        response = requests.post(
            GEMINI_API_URL,
            headers=headers,
            json=data
        )
        
        # Check if the request was successful
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                if 'content' in result['candidates'][0]:
                    parts = result['candidates'][0]['content'].get('parts', [])
                    if parts:
                        return parts[0].get('text', 'No response generated')
            return "I apologize, but I couldn't generate a response. Please try rephrasing your question."
        else:
            print(f"Error from Gemini API: {response.status_code} - {response.text}")
            return "I apologize, but I'm having trouble processing your request right now. Please try again later."
            
    except Exception as e:
        print(f"Error in get_ai_response: {str(e)}")
        return "I encountered an error while processing your request. Please try again."

@app.route('/ask_assistant', methods=['POST'])
def ask_assistant():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Invalid request data"}), 400

        user_message = data['message']
        response = get_ai_response(user_message)
        
        return jsonify({
            "response": response,
            "status": "success"
        })

    except Exception as e:
        print(f"Error in ask_assistant: {str(e)}")
        return jsonify({
            "error": "An error occurred while processing your request",
            "status": "error"
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)