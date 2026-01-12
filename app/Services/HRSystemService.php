<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;

class HRSystemService
{
    private $baseUrl;
    private $accessToken;

    public function __construct()
    {
        $this->baseUrl = config('services.oauth.provider_url');
        $this->accessToken = Session::get('hr_access_token');
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
     * Get current employee data
     */
    public function getCurrentEmployee()
    {
        return $this->makeRequest('GET', '/api/employees/me');
    }

    /**
     * Get employee by ID
     */
    public function getEmployee($employeeId)
    {
        return $this->makeRequest('GET', "/api/employees/{$employeeId}");
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

        try {
            $http = Http::withToken($this->accessToken)
                ->acceptJson()
                ->timeout(30);
            
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
                throw new \Exception('Resource not found.');
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
            if (str_contains($e->getMessage(), 'Access token not available')) {
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

