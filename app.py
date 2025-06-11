from flask import Flask, request, jsonify, render_template
import gspread
from oauth2client.service_account import ServiceAccountCredentials
from flask_cors import CORS
import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Google Sheets setup
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)
client = gspread.authorize(creds)

# Global variables to store data
registered_students = []
verified_students = []
not_registered_students = []
recent_activities = []



@app.route('/fetch_sheet_data', methods=['POST'])
def fetch_sheet_data():
    global registered_students
    try:
        data = request.get_json()
        sheet_url = data.get('sheet_url')
        
        if not sheet_url:
            return jsonify({"success": False, "message": "Sheet URL is required"}), 400
        
        # Open the Google Sheet
        sheet = client.open_by_url(sheet_url)
        worksheet = sheet.get_worksheet(0)  # Get first worksheet
        
        # Get all records
        records = worksheet.get_all_records()
        
        # Clear previous data
        registered_students = records
        
        return jsonify({
            "success": True,
            "message": f"Successfully fetched {len(records)} records",
            "count": len(records)
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/verify_student', methods=['POST'])
def verify_student():
    global verified_students, not_registered_students, recent_activities
    try:
        data = request.get_json()
        roll_no = data.get('rollNo')
        
        if not roll_no:
            return jsonify({"success": False, "message": "Roll number is required"}), 400
        
        # Find student in registered list
        student = next((s for s in registered_students if s['rollNo'] == roll_no), None)
        
        # Create activity record
        activity = {
            "rollNo": roll_no,
            "name": student['name'] if student else "Unknown",
            "timestamp": datetime.datetime.now().strftime("%H:%M:%S"),
            "status": "verified" if student else "not_registered"
        }
        recent_activities.insert(0, activity)
        if len(recent_activities) > 5:
            recent_activities.pop()
        
        if student:
            # Add to verified if not already there
            if not any(s['rollNo'] == roll_no for s in verified_students):
                verified_students.append(student)
            response = {
                "success": True,
                "registered": True,
                "message": f"Welcome to the workshop, {student['name']}!",
                "student": student
            }
        else:
            # Add to not registered if not already there
            if not any(s['rollNo'] == roll_no for s in not_registered_students):
                not_registered_students.append({"rollNo": roll_no})
            response = {
                "success": True,
                "registered": False,
                "message": "You are not registered. Please register for the workshop.",
                "student": {"rollNo": roll_no}
            }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/get_stats', methods=['GET'])
def get_stats():
    return jsonify({
        "totalRegistered": len(registered_students),
        "verifiedToday": len(verified_students),
        "notRegistered": len(not_registered_students),
        "recentActivities": recent_activities[:5],
        "grantedList": verified_students,
        "notRegisteredList": not_registered_students
    })

@app.route('/receive_qr', methods=['POST'])
def receive_qr():
    try:
        data = request.get_json()
        roll_no = data.get('rollNo')
        ip_address = data.get('ipAddress')
        
        if not roll_no:
            return jsonify({"success": False, "message": "Roll number is required"}), 400
        
        # Log the scan
        print(f"QR code scanned from {ip_address}: {roll_no}")
        
        # Verify the student
        return verify_student()
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
        
@app.route('/clear_entries', methods=['POST'])
def clear_entries():
    global verified_students, not_registered_students, recent_activities
    try:
        verified_students = []
        not_registered_students = []
        recent_activities = []
        
        return jsonify({
            "success": True,
            "message": "All entries cleared successfully"
        })
        
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)