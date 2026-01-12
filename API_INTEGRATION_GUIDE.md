# HR System API Integration Guide

This guide will help you integrate with the HR System API to automatically fill employee information in your application forms.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [OAuth 2.0 Setup](#oauth-20-setup)
4. [Getting Started](#getting-started)
5. [API Endpoints](#api-endpoints)
6. [Integration Examples](#integration-examples)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

The HR System API provides secure access to employee records, departments, and faculties. It uses OAuth 2.0 for authentication and is designed to support form auto-filling functionality.

**Key Features:**
- Secure OAuth 2.0 authentication
- Employee data retrieval by employee ID
- Department and faculty information
- Role-based access control
- Rate limiting (60 requests/minute)

## Prerequisites

Before integrating, ensure you have:

1. **OAuth Client Credentials** from the HR System administrator:
   - Client ID
   - Client Secret
   - Redirect URI (must be registered)

2. **HR System Base URL** (e.g., `https://hr-system.example.com`)

3. **Understanding of OAuth 2.0 Authorization Code Flow**

## OAuth 2.0 Setup

### Step 1: Register Your Application

Contact the HR System administrator to register your application. You'll need to provide:

- Application name
- Redirect URI(s) where users will be sent after authentication
- Required scopes: `openid profile email`

### Step 2: OAuth Flow Overview

The integration follows the standard OAuth 2.0 Authorization Code flow:

```
1. User clicks "Login with HR System" in your app
2. Redirect user to HR System authorization endpoint
3. User authenticates and authorizes your app
4. HR System redirects back with authorization code
5. Exchange authorization code for access token
6. Use access token to call API endpoints
```

## Getting Started

### Step 1: Redirect User to Authorization

When a user needs to authenticate, redirect them to the HR System authorization endpoint:

```javascript
// Configuration
const HR_SYSTEM_URL = 'https://hr-system.example.com';
const CLIENT_ID = 'your-client-id';
const REDIRECT_URI = 'https://your-app.com/oauth/callback';
const SCOPE = 'openid profile email';

// Build authorization URL
const authUrl = `${HR_SYSTEM_URL}/oauth/authorize?` +
  `client_id=${encodeURIComponent(CLIENT_ID)}&` +
  `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
  `response_type=code&` +
  `scope=${encodeURIComponent(SCOPE)}&` +
  `state=${generateRandomState()}`;

// Redirect user
window.location.href = authUrl;
```

**Important:** Always generate and store a random `state` parameter for CSRF protection.

### Step 2: Handle OAuth Callback

After user authorization, HR System redirects to your callback URL with an authorization code:

```javascript
// In your callback handler (e.g., /oauth/callback)
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const state = urlParams.get('state');

// Verify state matches what you sent
if (state !== storedState) {
  throw new Error('Invalid state parameter');
}

// Exchange code for access token
const tokenResponse = await fetch(`${HR_SYSTEM_URL}/oauth/token`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    code: code,
  }),
});

const tokenData = await tokenResponse.json();
const accessToken = tokenData.access_token;
const employeeId = tokenData.employee_id; // From token claims
```

### Step 3: Get User Info (Optional)

You can also get user information from the OAuth userinfo endpoint:

```javascript
const userInfoResponse = await fetch(`${HR_SYSTEM_URL}/oauth/userinfo`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
  },
});

const userInfo = await userInfoResponse.json();
// userInfo contains: sub, name, email, employee_id, etc.
```

## API Endpoints

### Base URL

All API endpoints are prefixed with `/api`:

```
https://hr-system.example.com/api/...
```

### Authentication

All API requests require the OAuth access token in the Authorization header:

```
Authorization: Bearer {access_token}
```

### 1. Get Current Employee

Get the employee record for the authenticated user.

**Endpoint:** `GET /api/employees/me`

**Example Request:**
```javascript
const response = await fetch(`${HR_SYSTEM_URL}/api/employees/me`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
  },
});

const employee = await response.json();
```

**Example Response:**
```json
{
  "id": "EMP001",
  "name": {
    "surname": "Doe",
    "first_name": "John",
    "middle_name": "Michael",
    "name_extension": "",
    "full_name": "John Michael Doe"
  },
  "contact": {
    "email": "john.doe@example.com",
    "mobile": "+639123456789",
    "telephone": "02-1234-5678"
  },
  "employment": {
    "status": "active",
    "employment_status": "Regular",
    "employee_type": "Teaching",
    "date_hired": "2020-01-15",
    "date_regularized": "2021-01-15"
  },
  "department": {
    "id": 1,
    "code": "CS",
    "name": "Computer Science",
    "type": "academic",
    "faculty_id": 1
  },
  "position": {
    "id": 5,
    "code": "PROF",
    "name": "Professor"
  },
  "personal": {
    "birth_date": "1985-05-15",
    "gender": "Male",
    "civil_status": "Married"
  },
  "address": {
    "present": {
      "house_no": "123",
      "street": "Main Street",
      "subdivision": "Green Valley",
      "barangay": "Barangay 1",
      "city": "Manila",
      "province": "Metro Manila",
      "zip_code": "1000"
    },
    "permanent": {
      "house_no": "456",
      "street": "Oak Avenue",
      "subdivision": "Sunset Hills",
      "barangay": "Barangay 2",
      "city": "Quezon City",
      "province": "Metro Manila",
      "zip_code": "1100"
    }
  },
  "government_ids": {
    "gsis": "123456789",
    "sss": "987654321",
    "tin": "123-456-789-000",
    "pagibig": "123456789012"
  },
  "special_categories": {
    "pwd": false,
    "senior_citizen": false,
    "indigenous_people": false
  }
}
```

### 2. Get Employee by ID

Get a specific employee record by employee ID.

**Endpoint:** `GET /api/employees/{employee_id}`

**Example Request:**
```javascript
const employeeId = 'EMP001'; // From OAuth token or user input

const response = await fetch(`${HR_SYSTEM_URL}/api/employees/${employeeId}`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
  },
});

const employee = await response.json();
```

**Note:** Access is restricted based on user permissions. Users can only access employees they have permission to view.

### 3. List Departments

Get all available departments/offices.

**Endpoint:** `GET /api/departments`

**Query Parameters:**
- `type` (optional): Filter by type (`academic` or `administrative`)

**Example Request:**
```javascript
// Get all departments
const response = await fetch(`${HR_SYSTEM_URL}/api/departments`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
  },
});

// Get only academic departments
const academicResponse = await fetch(
  `${HR_SYSTEM_URL}/api/departments?type=academic`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  }
);
```

**Example Response:**
```json
{
  "data": [
    {
      "id": 1,
      "code": "CS",
      "name": "Computer Science",
      "type": "academic",
      "description": "Computer Science Department",
      "faculty": {
        "id": 1,
        "code": "CIT",
        "name": "College of Information Technology"
      }
    }
  ],
  "count": 1
}
```

### 4. Get Department by ID

Get detailed information about a specific department.

**Endpoint:** `GET /api/departments/{id}`

**Example Request:**
```javascript
const departmentId = 1;

const response = await fetch(
  `${HR_SYSTEM_URL}/api/departments/${departmentId}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  }
);
```

### 5. List Faculties

Get all available faculties.

**Endpoint:** `GET /api/faculties`

**Query Parameters:**
- `type` (optional): Filter by faculty type
- `status` (optional): Filter by status (default: `active`)

**Example Request:**
```javascript
const response = await fetch(`${HR_SYSTEM_URL}/api/faculties`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
  },
});
```

### 6. Get Faculty by ID

Get detailed information about a specific faculty.

**Endpoint:** `GET /api/faculties/{id}`

**Example Request:**
```javascript
const facultyId = 1;

const response = await fetch(
  `${HR_SYSTEM_URL}/api/faculties/${facultyId}`,
  {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  }
);
```

## Integration Examples

### Complete React Integration Example

```jsx
import React, { useState, useEffect } from 'react';

const HR_SYSTEM_URL = 'https://hr-system.example.com';
const CLIENT_ID = 'your-client-id';
const CLIENT_SECRET = 'your-client-secret';
const REDIRECT_URI = window.location.origin + '/oauth/callback';

function EmployeeForm() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('hr_access_token')
  );

  // Check if we have an access token
  useEffect(() => {
    if (!accessToken) {
      // Redirect to OAuth login
      const state = generateRandomState();
      sessionStorage.setItem('oauth_state', state);
      
      const authUrl = `${HR_SYSTEM_URL}/oauth/authorize?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
        `response_type=code&` +
        `scope=openid profile email&` +
        `state=${state}`;
      
      window.location.href = authUrl;
    }
  }, [accessToken]);

  // Load employee data
  useEffect(() => {
    if (accessToken) {
      loadEmployeeData();
    }
  }, [accessToken]);

  const loadEmployeeData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${HR_SYSTEM_URL}/api/employees/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, clear and redirect to login
          localStorage.removeItem('hr_access_token');
          setAccessToken(null);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEmployee(data);
      
      // Auto-fill form
      autoFillForm(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const autoFillForm = (employeeData) => {
    // Auto-fill form fields
    if (document.getElementById('first_name')) {
      document.getElementById('first_name').value = employeeData.name.first_name;
    }
    if (document.getElementById('last_name')) {
      document.getElementById('last_name').value = employeeData.name.surname;
    }
    if (document.getElementById('middle_name')) {
      document.getElementById('middle_name').value = employeeData.name.middle_name || '';
    }
    if (document.getElementById('email')) {
      document.getElementById('email').value = employeeData.contact.email;
    }
    if (document.getElementById('mobile')) {
      document.getElementById('mobile').value = employeeData.contact.mobile || '';
    }
    if (document.getElementById('birth_date')) {
      document.getElementById('birth_date').value = employeeData.personal?.birth_date || '';
    }
    if (document.getElementById('gender')) {
      document.getElementById('gender').value = employeeData.personal?.gender || '';
    }
    if (document.getElementById('civil_status')) {
      document.getElementById('civil_status').value = employeeData.personal?.civil_status || '';
    }
    // Handle address - can be string or object
    if (document.getElementById('present_address') && employeeData.address?.present) {
      if (typeof employeeData.address.present === 'object') {
        const addr = employeeData.address.present;
        document.getElementById('present_address').value = [
          addr.house_no,
          addr.street,
          addr.subdivision,
          addr.barangay,
          addr.city,
          addr.province,
          addr.zip_code
        ].filter(Boolean).join(', ');
      } else {
        document.getElementById('present_address').value = employeeData.address.present;
      }
    }
    if (document.getElementById('permanent_address') && employeeData.address?.permanent) {
      if (typeof employeeData.address.permanent === 'object') {
        const addr = employeeData.address.permanent;
        document.getElementById('permanent_address').value = [
          addr.house_no,
          addr.street,
          addr.subdivision,
          addr.barangay,
          addr.city,
          addr.province,
          addr.zip_code
        ].filter(Boolean).join(', ');
      } else {
        document.getElementById('permanent_address').value = employeeData.address.permanent;
      }
    }
    if (document.getElementById('gsis')) {
      document.getElementById('gsis').value = employeeData.government_ids?.gsis || '';
    }
    if (document.getElementById('sss')) {
      document.getElementById('sss').value = employeeData.government_ids?.sss || '';
    }
    if (document.getElementById('tin')) {
      document.getElementById('tin').value = employeeData.government_ids?.tin || '';
    }
    if (document.getElementById('pagibig')) {
      document.getElementById('pagibig').value = employeeData.government_ids?.pagibig || '';
    }
    // ... fill more fields as needed
  };

  // OAuth callback handler (separate component/page)
  const handleOAuthCallback = async (code, state) => {
    // Verify state
    const storedState = sessionStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for token
    const response = await fetch(`${HR_SYSTEM_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      }),
    });

    const tokenData = await response.json();
    
    if (tokenData.access_token) {
      localStorage.setItem('hr_access_token', tokenData.access_token);
      setAccessToken(tokenData.access_token);
    } else {
      throw new Error('Failed to obtain access token');
    }
  };

  if (loading) return <div>Loading employee data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!employee) return <div>No employee data available</div>;

  return (
    <form>
      <input type="text" id="first_name" placeholder="First Name" />
      <input type="text" id="last_name" placeholder="Last Name" />
      <input type="email" id="email" placeholder="Email" />
      {/* ... more form fields ... */}
    </form>
  );
}

// OAuth Callback Component
function OAuthCallback() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state) {
      // Handle OAuth callback
      handleOAuthCallback(code, state)
        .then(() => {
          window.location.href = '/'; // Redirect to main form
        })
        .catch((error) => {
          console.error('OAuth callback error:', error);
        });
    }
  }, []);

  return <div>Processing authentication...</div>;
}

function generateRandomState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

export { EmployeeForm, OAuthCallback };
```

### PHP Integration Example

```php
<?php

class HRSystemAPI {
    private $baseUrl;
    private $clientId;
    private $clientSecret;
    private $redirectUri;
    private $accessToken;

    public function __construct($baseUrl, $clientId, $clientSecret, $redirectUri) {
        $this->baseUrl = $baseUrl;
        $this->clientId = $clientId;
        $this->clientSecret = $clientSecret;
        $this->redirectUri = $redirectUri;
    }

    /**
     * Get authorization URL
     */
    public function getAuthorizationUrl($state) {
        $params = [
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'response_type' => 'code',
            'scope' => 'openid profile email',
            'state' => $state,
        ];
        
        return $this->baseUrl . '/oauth/authorize?' . http_build_query($params);
    }

    /**
     * Exchange authorization code for access token
     */
    public function exchangeCodeForToken($code) {
        $ch = curl_init($this->baseUrl . '/oauth/token');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'grant_type' => 'authorization_code',
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'redirect_uri' => $this->redirectUri,
            'code' => $code,
        ]));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded',
            'Accept: application/json',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception('Failed to exchange code for token');
        }

        $data = json_decode($response, true);
        $this->accessToken = $data['access_token'];
        
        return $data;
    }

    /**
     * Get current employee
     */
    public function getCurrentEmployee() {
        return $this->makeRequest('GET', '/api/employees/me');
    }

    /**
     * Get employee by ID
     */
    public function getEmployee($employeeId) {
        return $this->makeRequest('GET', "/api/employees/{$employeeId}");
    }

    /**
     * Get departments
     */
    public function getDepartments($type = null) {
        $url = '/api/departments';
        if ($type) {
            $url .= '?type=' . urlencode($type);
        }
        return $this->makeRequest('GET', $url);
    }

    /**
     * Get faculties
     */
    public function getFaculties($type = null, $status = 'active') {
        $params = ['status' => $status];
        if ($type) {
            $params['type'] = $type;
        }
        $url = '/api/faculties?' . http_build_query($params);
        return $this->makeRequest('GET', $url);
    }

    /**
     * Make API request
     */
    private function makeRequest($method, $endpoint) {
        if (!$this->accessToken) {
            throw new Exception('Access token not set');
        }

        $ch = curl_init($this->baseUrl . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->accessToken,
            'Accept: application/json',
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception("API request failed with status {$httpCode}");
        }

        return json_decode($response, true);
    }

    public function setAccessToken($token) {
        $this->accessToken = $token;
    }
}

// Usage example
session_start();

$api = new HRSystemAPI(
    'https://hr-system.example.com',
    'your-client-id',
    'your-client-secret',
    'https://your-app.com/oauth/callback'
);

// Handle OAuth callback
if (isset($_GET['code'])) {
    $state = $_GET['state'];
    $storedState = $_SESSION['oauth_state'];
    
    if ($state !== $storedState) {
        die('Invalid state parameter');
    }
    
    $code = $_GET['code'];
    $tokenData = $api->exchangeCodeForToken($code);
    
    // Store token in session
    $_SESSION['hr_access_token'] = $tokenData['access_token'];
    $api->setAccessToken($tokenData['access_token']);
    
    // Get employee data
    $employee = $api->getCurrentEmployee();
    
    // Use employee data to auto-fill form
    // ...
}

// Redirect to authorization if not authenticated
if (!isset($_SESSION['hr_access_token'])) {
    $state = bin2hex(random_bytes(16));
    $_SESSION['oauth_state'] = $state;
    
    $authUrl = $api->getAuthorizationUrl($state);
    header('Location: ' . $authUrl);
    exit;
}
```

### Python Integration Example

```python
import requests
import secrets
from urllib.parse import urlencode

class HRSystemAPI:
    def __init__(self, base_url, client_id, client_secret, redirect_uri):
        self.base_url = base_url
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self.access_token = None

    def get_authorization_url(self, state):
        params = {
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'response_type': 'code',
            'scope': 'openid profile email',
            'state': state,
        }
        return f"{self.base_url}/oauth/authorize?{urlencode(params)}"

    def exchange_code_for_token(self, code):
        response = requests.post(
            f"{self.base_url}/oauth/token",
            data={
                'grant_type': 'authorization_code',
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                'redirect_uri': self.redirect_uri,
                'code': code,
            },
            headers={
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            }
        )
        response.raise_for_status()
        data = response.json()
        self.access_token = data['access_token']
        return data

    def get_current_employee(self):
        return self._make_request('GET', '/api/employees/me')

    def get_employee(self, employee_id):
        return self._make_request('GET', f'/api/employees/{employee_id}')

    def get_departments(self, type=None):
        url = '/api/departments'
        if type:
            url += f'?type={type}'
        return self._make_request('GET', url)

    def get_faculties(self, type=None, status='active'):
        params = {'status': status}
        if type:
            params['type'] = type
        url = f"/api/faculties?{urlencode(params)}"
        return self._make_request('GET', url)

    def _make_request(self, method, endpoint):
        if not self.access_token:
            raise Exception('Access token not set')

        response = requests.request(
            method,
            f"{self.base_url}{endpoint}",
            headers={
                'Authorization': f'Bearer {self.access_token}',
                'Accept': 'application/json',
            }
        )
        response.raise_for_status()
        return response.json()

# Usage example (Flask)
from flask import Flask, redirect, request, session, render_template_string

app = Flask(__name__)
app.secret_key = 'your-secret-key'

api = HRSystemAPI(
    'https://hr-system.example.com',
    'your-client-id',
    'your-client-secret',
    'https://your-app.com/oauth/callback'
)

@app.route('/')
def index():
    if 'hr_access_token' not in session:
        state = secrets.token_urlsafe(32)
        session['oauth_state'] = state
        auth_url = api.get_authorization_url(state)
        return redirect(auth_url)
    
    api.access_token = session['hr_access_token']
    employee = api.get_current_employee()
    
    # Render form with employee data
    return render_template_string('''
        <form>
            <input type="text" name="first_name" value="{{ employee.name.first_name }}">
            <input type="text" name="last_name" value="{{ employee.name.surname }}">
            <input type="email" name="email" value="{{ employee.contact.email }}">
        </form>
    ''', employee=employee)

@app.route('/oauth/callback')
def oauth_callback():
    code = request.args.get('code')
    state = request.args.get('state')
    
    if state != session.get('oauth_state'):
        return 'Invalid state parameter', 400
    
    token_data = api.exchange_code_for_token(code)
    session['hr_access_token'] = token_data['access_token']
    
    return redirect('/')
```

## Error Handling

### Common HTTP Status Codes

- **200 OK**: Request successful
- **401 Unauthorized**: Missing or invalid access token
- **403 Forbidden**: User doesn't have permission to access the resource
- **404 Not Found**: Resource not found or inactive
- **429 Too Many Requests**: Rate limit exceeded (60 requests/minute)
- **500 Internal Server Error**: Server error

### Error Response Format

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

### Handling Errors in JavaScript

```javascript
async function fetchEmployeeData(accessToken) {
  try {
    const response = await fetch(`${HR_SYSTEM_URL}/api/employees/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        // Clear token and redirect to login
        localStorage.removeItem('hr_access_token');
        window.location.href = '/login';
        return;
      }
      
      if (response.status === 403) {
        const error = await response.json();
        throw new Error(`Access denied: ${error.message}`);
      }
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching employee data:', error);
    throw error;
  }
}
```

## Best Practices

### 1. Token Storage

- **Web Applications**: Store tokens in `sessionStorage` (cleared on tab close) or `localStorage` (persists)
- **Server Applications**: Store tokens in server-side session or database
- **Never** expose client secrets in client-side code

### 2. Token Refresh

Access tokens may expire. Implement token refresh logic:

```javascript
async function refreshTokenIfNeeded() {
  const token = localStorage.getItem('hr_access_token');
  if (!token) return null;

  // Check if token is expired (if you decode JWT)
  // Or make a test API call and handle 401
  
  try {
    const response = await fetch(`${HR_SYSTEM_URL}/api/employees/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (response.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('hr_access_token');
      window.location.href = '/login';
      return null;
    }

    return token;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}
```

### 3. Rate Limiting

Respect the 60 requests/minute limit:

```javascript
class RateLimiter {
  constructor(maxRequests = 60, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  async checkLimit() {
    const now = Date.now();
    // Remove requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.windowMs - (now - oldestRequest);
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`);
    }

    this.requests.push(now);
  }
}

const rateLimiter = new RateLimiter(60, 60000);

async function makeAPICall(url, options) {
  await rateLimiter.checkLimit();
  return fetch(url, options);
}
```

### 4. Caching

Cache employee data to reduce API calls:

```javascript
class EmployeeCache {
  constructor(ttl = 300000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}

const cache = new EmployeeCache();

async function getEmployeeData(employeeId, accessToken) {
  const cacheKey = `employee_${employeeId}`;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  const data = await fetchEmployeeData(accessToken);
  cache.set(cacheKey, data);
  
  return data;
}
```

### 5. Security

- Always use HTTPS for all API calls
- Never expose client secrets in client-side code
- Validate and sanitize all user inputs
- Implement CSRF protection using the `state` parameter
- Store tokens securely (encrypted if possible)

## Troubleshooting

### Issue: "401 Unauthorized" errors

**Possible causes:**
- Access token expired or invalid
- Missing Authorization header
- Token not properly formatted

**Solution:**
- Check that the token is included in the Authorization header
- Verify token format: `Bearer {token}` (note the space)
- Re-authenticate if token expired

### Issue: "403 Forbidden" when accessing employee

**Possible causes:**
- User doesn't have permission to view that employee
- Employee record is inactive

**Solution:**
- Verify user has appropriate permissions
- Check that the employee status is "active"
- Use `/api/employees/me` to get current user's own data

### Issue: "429 Too Many Requests"

**Possible causes:**
- Exceeding 60 requests per minute limit

**Solution:**
- Implement request caching
- Add delays between requests
- Use batch requests if possible

### Issue: CORS errors

**Possible causes:**
- Making requests from browser to different domain
- Missing CORS headers

**Solution:**
- Ensure HR System has your domain in CORS whitelist
- Contact HR System administrator to add your domain
- Use server-side proxy if needed

### Issue: OAuth callback not working

**Possible causes:**
- Redirect URI mismatch
- Invalid state parameter
- Authorization code expired

**Solution:**
- Verify redirect URI matches exactly (including protocol, domain, path)
- Ensure state parameter is properly validated
- Exchange code immediately (codes expire quickly)

## Support

For additional support or questions:

1. Check the [API Documentation](./API_DOCUMENTATION.md) for detailed endpoint information
2. Contact the HR System administrator for:
   - OAuth client registration
   - Access issues
   - API questions
3. Review server logs for detailed error messages

## Data Structure Reference

### Employee Object Structure

The employee object returned by `/api/employees/me` and `/api/employees/{id}` contains the following structure:

#### Personal Information (`personal`)
- `birth_date` (string, format: YYYY-MM-DD): Employee's date of birth
- `gender` (string): Employee's gender
- `civil_status` (string): Employee's civil status (e.g., "Single", "Married", "Divorced", "Widowed")

#### Address Information (`address`)
The address field can be either a string or an object. When it's an object, it contains:

**Present Address (`address.present`):**
- `house_no` (string, optional): House number
- `street` (string, optional): Street name
- `subdivision` (string, optional): Subdivision name
- `barangay` (string, optional): Barangay name
- `city` (string, optional): City name
- `province` (string, optional): Province name
- `zip_code` (string, optional): ZIP code

**Permanent Address (`address.permanent`):**
- Same structure as present address

**Note:** Address fields may also be returned as simple strings. Always check the type before accessing object properties.

#### Government IDs (`government_ids`)
- `gsis` (string, optional): GSIS number
- `sss` (string, optional): SSS number
- `tin` (string, optional): TIN number
- `pagibig` (string, optional): Pag-IBIG number

#### Special Categories (`special_categories`)
An object containing various special category flags (e.g., `pwd`, `senior_citizen`, `indigenous_people`). The exact fields depend on the HR System configuration.

## Changelog

- **v1.0.1** (Updated)
  - Documented complete employee data structure
  - Added address object structure documentation
  - Added personal information fields
  - Added all government ID fields including Pag-IBIG
  - Added special categories documentation

- **v1.0.0** (Initial Release)
  - Employee endpoints
  - Department endpoints
  - Faculty endpoints
  - OAuth 2.0 authentication
  - Role-based access control

