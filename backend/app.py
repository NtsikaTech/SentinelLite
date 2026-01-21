"""
SentinelLite SIEM Backend
A Flask-based REST API for the SentinelLite SIEM Dashboard
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import uuid
import random
import hashlib
import secrets

app = Flask(__name__)
CORS(app, supports_credentials=True)

# ============================================
# In-Memory Data Store (Replace with DB in production)
# ============================================

# Users database
USERS = {
    "admin@sentinel.lite": {
        "id": "u-1",
        "name": "Jane Doe",
        "email": "admin@sentinel.lite",
        "password_hash": hashlib.sha256("sentinel2025".encode()).hexdigest(),
        "role": "admin",
        "avatar": "JD"
    },
    "analyst@sentinel.lite": {
        "id": "u-2",
        "name": "John Smith",
        "email": "analyst@sentinel.lite",
        "password_hash": hashlib.sha256("analyst2025".encode()).hexdigest(),
        "role": "analyst",
        "avatar": "JS"
    }
}

# Session tokens store
SESSIONS = {}

# Log sources and event types
LOG_SOURCES = ["SSH", "Web", "Auth", "System"]
EVENT_TYPES = [
    "Standard Web Request",
    "Failed Login Attempt",
    "User Privilege Escalation",
    "File Access",
    "Network Connection",
    "Process Started",
    "Configuration Change",
    "Authentication Success"
]

# Generate mock logs
def generate_logs(count=500):
    logs = []
    for i in range(count):
        source = LOG_SOURCES[i % 4]
        is_suspicious = i % 7 == 0
        event_type = "Failed Login Attempt" if i % 5 == 0 else (
            "User Privilege Escalation" if i % 8 == 0 else 
            random.choice(EVENT_TYPES)
        )
        
        log = {
            "id": f"log-{uuid.uuid4().hex[:8]}",
            "timestamp": (datetime.now() - timedelta(minutes=i * 15)).isoformat(),
            "source": source,
            "ipAddress": f"{100 + (i % 50)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}",
            "eventType": event_type,
            "status": "Suspicious" if is_suspicious else "Normal",
            "isReviewed": False,
            "raw": f"Mar 15 14:32:01 server sshd[123]: Failed password for invalid user admin from 192.168.1.{i} port 54321 ssh2" if i % 5 == 0 else f"185.12.3.{i} - - [15/Mar/2024:09:12:03 +0000] \"GET /api/v1/health HTTP/1.1\" 200 512"
        }
        logs.append(log)
    return logs

# Initialize logs store
LOGS = generate_logs()

# Alerts store
ALERTS = [
    {
        "id": "alt-1",
        "reason": "Multiple failed SSH login attempts detected",
        "timestamp": datetime.now().isoformat(),
        "ipAddress": "45.122.34.11",
        "severity": "Critical",
        "riskScore": 92,
        "ruleTriggered": "AUTH_BRUTE_FORCE",
        "rawLog": "Mar 15 10:22:15 host sshd[1522]: pam_unix(sshd:auth): authentication failure; logname= uid=0 euid=0 tty=ssh ruser= rhost=45.122.34.11",
        "status": "Open"
    },
    {
        "id": "alt-2",
        "reason": "Repeated web requests (404 burst) from single IP",
        "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(),
        "ipAddress": "185.12.3.99",
        "severity": "Medium",
        "riskScore": 65,
        "ruleTriggered": "WEB_RECONNAISSANCE",
        "rawLog": "185.12.3.99 - - [15/Mar/2024:09:12:03 +0000] \"GET /wp-admin/config.php HTTP/1.1\" 404 124",
        "status": "Open"
    },
    {
        "id": "alt-3",
        "reason": "Unexpected admin access during off-hours",
        "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
        "ipAddress": "10.0.0.5",
        "severity": "Low",
        "riskScore": 35,
        "ruleTriggered": "ANOMALY_TIME_ACCESS",
        "rawLog": "Mar 15 03:00:11 srv-01 auth: User root logged in from 10.0.0.5",
        "status": "Open"
    },
    {
        "id": "alt-4",
        "reason": "SQL injection attempt detected in web request",
        "timestamp": (datetime.now() - timedelta(hours=3)).isoformat(),
        "ipAddress": "203.45.67.89",
        "severity": "High",
        "riskScore": 85,
        "ruleTriggered": "WEB_SQL_INJECTION",
        "rawLog": "203.45.67.89 - - [15/Mar/2024:11:45:22 +0000] \"GET /search?q=1' OR '1'='1 HTTP/1.1\" 403 0",
        "status": "Open"
    },
    {
        "id": "alt-5",
        "reason": "Port scan detected from external IP",
        "timestamp": (datetime.now() - timedelta(hours=5)).isoformat(),
        "ipAddress": "178.62.100.45",
        "severity": "Medium",
        "riskScore": 58,
        "ruleTriggered": "NET_PORT_SCAN",
        "rawLog": "Jan 21 08:15:33 firewall kernel: [UFW BLOCK] IN=eth0 OUT= MAC=... SRC=178.62.100.45 DST=10.0.0.1 PROTO=TCP DPT=22",
        "status": "Open"
    }
]

# ============================================
# Authentication Routes
# ============================================

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user and return session token"""
    data = request.get_json()
    email = data.get('email', '').lower()
    password = data.get('password', '')
    
    user = USERS.get(email)
    if not user:
        return jsonify({"error": "Invalid security credentials provided."}), 401
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    if user['password_hash'] != password_hash:
        return jsonify({"error": "Invalid security credentials provided."}), 401
    
    # Generate session token
    token = secrets.token_hex(32)
    SESSIONS[token] = {
        "user_id": user['id'],
        "email": email,
        "created_at": datetime.now().isoformat()
    }
    
    # Return user data (without password)
    user_data = {k: v for k, v in user.items() if k != 'password_hash'}
    
    return jsonify({
        "user": user_data,
        "token": token
    })

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Invalidate session token"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if token in SESSIONS:
        del SESSIONS[token]
    return jsonify({"success": True})

@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    """Get current authenticated user"""
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    session = SESSIONS.get(token)
    
    if not session:
        return jsonify({"error": "Unauthorized"}), 401
    
    user = USERS.get(session['email'])
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user_data = {k: v for k, v in user.items() if k != 'password_hash'}
    return jsonify(user_data)

# ============================================
# Dashboard Stats Routes
# ============================================

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get dashboard statistics"""
    suspicious_count = sum(1 for log in LOGS if log['status'] == 'Suspicious')
    failed_logins = sum(1 for log in LOGS if 'Failed Login' in log['eventType'])
    unique_ips = len(set(log['ipAddress'] for log in LOGS))
    
    # Generate trend data (last 24 hours)
    trend_data = [
        {"time": "00:00", "count": random.randint(300, 500)},
        {"time": "04:00", "count": random.randint(200, 400)},
        {"time": "08:00", "count": random.randint(800, 1000)},
        {"time": "12:00", "count": random.randint(1100, 1300)},
        {"time": "16:00", "count": random.randint(1400, 1600)},
        {"time": "20:00", "count": random.randint(700, 900)},
        {"time": "23:59", "count": random.randint(400, 600)},
    ]
    
    return jsonify({
        "totalLogs": len(LOGS),
        "suspiciousEvents": suspicious_count,
        "failedLogins": failed_logins,
        "uniqueIps": unique_ips,
        "trendData": trend_data
    })

# ============================================
# Logs Routes
# ============================================

@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Get paginated logs with optional filtering"""
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 20))
    source = request.args.get('source', None)
    status = request.args.get('status', None)
    search = request.args.get('search', '').lower()
    
    filtered_logs = LOGS
    
    # Apply filters
    if source and source != 'ALL':
        filtered_logs = [log for log in filtered_logs if log['source'] == source]
    
    if status and status != 'ALL':
        filtered_logs = [log for log in filtered_logs if log['status'] == status]
    
    if search:
        filtered_logs = [log for log in filtered_logs if 
            search in log['ipAddress'].lower() or 
            search in log['eventType'].lower() or
            search in (log.get('raw', '') or '').lower()
        ]
    
    # Paginate
    total = len(filtered_logs)
    start = (page - 1) * limit
    end = start + limit
    paginated_logs = filtered_logs[start:end]
    
    return jsonify({
        "data": paginated_logs,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    })

@app.route('/api/logs/<log_id>', methods=['PATCH'])
def update_log(log_id):
    """Update log entry (mark as reviewed, change status, etc.)"""
    data = request.get_json()
    
    for log in LOGS:
        if log['id'] == log_id:
            log.update(data)
            return jsonify({"success": True, "log": log})
    
    return jsonify({"error": "Log not found"}), 404

# ============================================
# Alerts Routes
# ============================================

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get all security alerts"""
    severity = request.args.get('severity', None)
    status = request.args.get('status', None)
    
    filtered_alerts = ALERTS
    
    if severity and severity != 'all':
        filtered_alerts = [a for a in filtered_alerts if a['severity'].lower() == severity.lower()]
    
    if status and status != 'all':
        filtered_alerts = [a for a in filtered_alerts if a['status'].lower() == status.lower()]
    
    return jsonify(filtered_alerts)

@app.route('/api/alerts/<alert_id>', methods=['PATCH'])
def update_alert(alert_id):
    """Update alert status"""
    data = request.get_json()
    new_status = data.get('status')
    
    for alert in ALERTS:
        if alert['id'] == alert_id:
            if new_status:
                alert['status'] = new_status
            return jsonify({"success": True, "alert": alert})
    
    return jsonify({"error": "Alert not found"}), 404

@app.route('/api/alerts', methods=['POST'])
def create_alert():
    """Create a new security alert"""
    data = request.get_json()
    
    alert = {
        "id": f"alt-{uuid.uuid4().hex[:6]}",
        "reason": data.get('reason', 'Unspecified threat'),
        "timestamp": datetime.now().isoformat(),
        "ipAddress": data.get('ipAddress', '0.0.0.0'),
        "severity": data.get('severity', 'Medium'),
        "riskScore": data.get('riskScore', 50),
        "ruleTriggered": data.get('ruleTriggered', 'MANUAL_ENTRY'),
        "rawLog": data.get('rawLog', ''),
        "status": "Open"
    }
    
    ALERTS.insert(0, alert)
    return jsonify(alert), 201

# ============================================
# Health Check
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """API health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "services": {
            "database": "operational",
            "log_forwarder": "running",
            "ids_ruleset": "v2.4.1",
            "network_sentry": "listening"
        }
    })

# ============================================
# Run Server
# ============================================

if __name__ == '__main__':
    print("""
    ╔═══════════════════════════════════════════════════════╗
    ║           SentinelLite SIEM Backend v1.0.0            ║
    ║                                                       ║
    ║  API Server running at: http://localhost:5000         ║
    ║  Health check: http://localhost:5000/api/health       ║
    ╚═══════════════════════════════════════════════════════╝
    """)
    app.run(host='0.0.0.0', port=5000, debug=True)

