<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class HRSystemService
{
    private $baseUrl;
    private $accessToken;
    private $employeeId;

    public function __construct()
    {
        $this->baseUrl = config('services.oauth.provider_url');
        $this->accessToken = Session::get('hr_access_token');
        $this->employeeId = Session::get('hr_employee_id');
    }

    /**
     * Set the access token for API calls
     */
    public function setAccessToken($token)
    {
        $this->accessToken = $token;
        Session::put('hr_access_token', $token);
    }

    /**
     * Get the current access token
     */
    public function getAccessToken()
    {
        return $this->accessToken;
    }

    /**
     * Check if we have a valid access token
     */
    public function hasAccessToken()
    {
        return !empty($this->accessToken);
    }

    /**
     * Get the stored employee ID from OAuth
     */
    public function getEmployeeId()
    {
        return $this->employeeId;
    }

    /**
     * Get current employee data
     * First tries /api/employees/me, then falls back to /api/employees/{id}
     */
    public function getCurrentEmployee()
    {
        // First, try the /api/employees/me endpoint
        Log::info('Attempting to fetch employee via /api/employees/me');
        try {
            $result = $this->makeRequest('GET', '/api/employees/me');
            Log::info('Successfully fetched employee via /api/employees/me');
            return $result;
        } catch (\Exception $e) {
            Log::warning('Failed to fetch employee via /api/employees/me', [
                'error' => $e->getMessage(),
                'employeeId' => $this->employeeId,
            ]);
            
            // If /api/employees/me returns 404, try using the employee_id from OAuth
            if ((str_contains($e->getMessage(), 'Resource not found') || str_contains($e->getMessage(), '404')) && $this->employeeId) {
                Log::info('Falling back to /api/employees/{id}', ['employee_id' => $this->employeeId]);
                try {
                    $result = $this->makeRequest('GET', "/api/employees/{$this->employeeId}");
                    Log::info('Successfully fetched employee via /api/employees/{id}', ['employee_id' => $this->employeeId]);
                    return $result;
                } catch (\Exception $fallbackException) {
                    Log::error('Fallback to /api/employees/{id} also failed', [
                        'employee_id' => $this->employeeId,
                        'error' => $fallbackException->getMessage(),
                    ]);
                    throw $fallbackException;
                }
            }
            throw $e;
        }
    }

    /**
     * Get employee by ID
     */
    public function getEmployee($employeeId)
    {
        return $this->makeRequest('GET', "/api/employees/{$employeeId}");
    }

    /**
     * Get all employees with pagination and status filtering
     * 
     * @param int $page Page number (default: 1)
     * @param int $perPage Number of items per page (default: 50, max: 100)
     * @param string $status Filter by status: 'active', 'inactive', or 'all' (default: 'active')
     * @return array Response with data, meta, and links
     */
    public function getAllEmployees($page = 1, $perPage = 50, $status = 'active')
    {
        // Validate per_page (max 100)
        $perPage = min($perPage, 100);
        
        // Build query parameters
        $params = [
            'page' => $page,
            'per_page' => $perPage,
            'status' => $status,
        ];
        
        $url = '/api/employees?' . http_build_query($params);
        return $this->makeRequest('GET', $url);
    }

    /**
     * Get all departments
     */
    public function getDepartments($type = null)
    {
        $url = '/api/departments';
        if ($type) {
            $url .= '?type=' . urlencode($type);
        }
        return $this->makeRequest('GET', $url);
    }

    /**
     * Get department by ID
     */
    public function getDepartment($departmentId)
    {
        return $this->makeRequest('GET', "/api/departments/{$departmentId}");
    }

    /**
     * Get all faculties
     */
    public function getFaculties($type = null, $status = 'active')
    {
        $params = ['status' => $status];
        if ($type) {
            $params['type'] = $type;
        }
        $url = '/api/faculties?' . http_build_query($params);
        return $this->makeRequest('GET', $url);
    }

    /**
     * Get faculty by ID
     */
    public function getFaculty($facultyId)
    {
        return $this->makeRequest('GET', "/api/faculties/{$facultyId}");
    }

    /**
     * Make API request to HR System
     */
    private function makeRequest($method, $endpoint)
    {
        if (!$this->accessToken) {
            throw new \Exception('Access token not available. Please authenticate with HR System first.');
        }

        $url = rtrim($this->baseUrl, '/') . $endpoint;

        Log::info('HR System API request', [
            'method' => $method,
            'url' => $url,
            'endpoint' => $endpoint,
        ]);

        try {
            $http = Http::withToken($this->accessToken)
                ->acceptJson()
                ->timeout(30)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ]);
            
            // Handle different HTTP methods
            switch (strtoupper($method)) {
                case 'GET':
                    $response = $http->get($url);
                    break;
                case 'POST':
                    $response = $http->post($url);
                    break;
                case 'PUT':
                    $response = $http->put($url);
                    break;
                case 'PATCH':
                    $response = $http->patch($url);
                    break;
                case 'DELETE':
                    $response = $http->delete($url);
                    break;
                default:
                    throw new \Exception("Unsupported HTTP method: {$method}");
            }

            if ($response->successful()) {
                return $response->json();
            }

            // Log full response details for debugging
            Log::warning('HR System API request failed', [
                'method' => $method,
                'url' => $url,
                'endpoint' => $endpoint,
                'status' => $response->status(),
                'headers' => $response->headers(),
                'body' => $response->body(),
                'json' => $response->json(),
            ]);

            // Handle specific error cases
            if ($response->status() === 401) {
                // Token expired or invalid
                Session::forget('hr_access_token');
                throw new \Exception('Authentication failed. Please re-authenticate with HR System.');
            }

            if ($response->status() === 403) {
                throw new \Exception('Access denied. You do not have permission to access this resource.');
            }

            if ($response->status() === 404) {
                $errorBody = $response->json();
                $errorMessage = $errorBody['message'] ?? $errorBody['error'] ?? "Resource not found at endpoint: {$endpoint}";
                throw new \Exception($errorMessage);
            }

            if ($response->status() === 429) {
                throw new \Exception('Rate limit exceeded. Please try again later.');
            }

            $errorBody = $response->json();
            $errorMessage = $errorBody['message'] ?? $errorBody['error'] ?? 'API request failed';
            
            Log::error('HR System API request failed', [
                'method' => $method,
                'url' => $url,
                'status' => $response->status(),
                'error' => $errorMessage,
            ]);

            throw new \Exception($errorMessage);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('HR System API connection failed', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            throw new \Exception('Failed to connect to HR System. Please try again later.');
        } catch (\Exception $e) {
            // Don't wrap our own exceptions
            if (str_contains($e->getMessage(), 'Access token not available') ||
                str_contains($e->getMessage(), 'Resource not found') ||
                str_contains($e->getMessage(), 'Authentication failed') ||
                str_contains($e->getMessage(), 'Access denied') ||
                str_contains($e->getMessage(), 'Rate limit exceeded') ||
                str_contains($e->getMessage(), 'Failed to connect')) {
                throw $e;
            }
            Log::error('HR System API error', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);
            throw new \Exception('An error occurred while fetching data from HR System: ' . $e->getMessage());
        }
    }
}

