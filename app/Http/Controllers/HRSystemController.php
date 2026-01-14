<?php

namespace App\Http\Controllers;

use App\Services\HRSystemService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HRSystemController extends Controller
{
    protected $hrSystemService;

    public function __construct(HRSystemService $hrSystemService)
    {
        $this->hrSystemService = $hrSystemService;
    }

    /**
     * Display HR System data page
     */
    public function index(): Response
    {
        $data = [
            'hasAccessToken' => $this->hrSystemService->hasAccessToken(),
            'employeeId' => $this->hrSystemService->getEmployeeId(),
            'employee' => null,
            'departments' => null,
            'faculties' => null,
            'error' => null,
        ];

        // Log session data for debugging
        \Log::info('HR System page loaded', [
            'hasAccessToken' => $data['hasAccessToken'],
            'employeeId' => $data['employeeId'],
        ]);

        if (!$this->hrSystemService->hasAccessToken()) {
            $data['error'] = 'No access token found. Please authenticate with HR System first.';
            return Inertia::render('hr-system/index', $data);
        }

        try {
            // Fetch all data - catch individual errors so we can still show partial data
            try {
                \Log::info('Attempting to fetch employee data', [
                    'hasEmployeeId' => !empty($data['employeeId']),
                    'employeeId' => $data['employeeId'],
                ]);
                $data['employee'] = $this->hrSystemService->getCurrentEmployee();
                \Log::info('Successfully fetched employee data');
            } catch (\Exception $e) {
                \Log::warning('Failed to fetch employee data', [
                    'error' => $e->getMessage(),
                    'employeeId' => $data['employeeId'],
                    'trace' => $e->getTraceAsString(),
                ]);
                // Provide helpful error message based on the error type
                if (str_contains($e->getMessage(), 'Resource not found') || str_contains($e->getMessage(), '404')) {
                    if ($data['employeeId']) {
                        $data['error'] = ($data['error'] ? $data['error'] . ' ' : '') . "Employee not found. Both /api/employees/me and /api/employees/{$data['employeeId']} returned 404. Please check the Laravel logs for detailed error information.";
                    } else {
                        $data['error'] = ($data['error'] ? $data['error'] . ' ' : '') . 'Employee endpoint not available. The /api/employees/me endpoint returned 404 and no employee_id was provided by OAuth. Please check the Laravel logs for detailed error information.';
                    }
                } else {
                    $data['error'] = ($data['error'] ? $data['error'] . ' ' : '') . 'Employee: ' . $e->getMessage();
                }
            }

            try {
                $data['departments'] = $this->hrSystemService->getDepartments();
            } catch (\Exception $e) {
                \Log::warning('Failed to fetch departments data', ['error' => $e->getMessage()]);
                $data['error'] = ($data['error'] ? $data['error'] . ' ' : '') . 'Departments: ' . $e->getMessage();
            }

            try {
                $data['faculties'] = $this->hrSystemService->getFaculties();
            } catch (\Exception $e) {
                \Log::warning('Failed to fetch faculties data', ['error' => $e->getMessage()]);
                $data['error'] = ($data['error'] ? $data['error'] . ' ' : '') . 'Faculties: ' . $e->getMessage();
            }
        } catch (\Exception $e) {
            // Fallback error handling
            \Log::error('Unexpected error in HR System index', ['error' => $e->getMessage()]);
            $data['error'] = $e->getMessage();
        }

        return Inertia::render('hr-system/index', $data);
    }

    /**
     * Get current employee
     */
    public function getCurrentEmployee()
    {
        try {
            $employee = $this->hrSystemService->getCurrentEmployee();
            return response()->json($employee);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get employee by ID
     */
    public function getEmployee($employeeId)
    {
        try {
            $employee = $this->hrSystemService->getEmployee($employeeId);
            return response()->json($employee);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get all employees with pagination
     */
    public function getEmployees(Request $request)
    {
        try {
            $page = (int) $request->query('page', 1);
            $perPage = (int) $request->query('per_page', 50);
            $status = $request->query('status', 'active');
            
            // Validate status
            if (!in_array($status, ['active', 'inactive', 'all'])) {
                $status = 'active';
            }
            
            $employees = $this->hrSystemService->getAllEmployees($page, $perPage, $status);
            return response()->json($employees);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get departments
     */
    public function getDepartments(Request $request)
    {
        try {
            $type = $request->query('type');
            $departments = $this->hrSystemService->getDepartments($type);
            return response()->json($departments);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get department by ID
     */
    public function getDepartment($departmentId)
    {
        try {
            $department = $this->hrSystemService->getDepartment($departmentId);
            return response()->json($department);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get faculties
     */
    public function getFaculties(Request $request)
    {
        try {
            $type = $request->query('type');
            $status = $request->query('status', 'active');
            $faculties = $this->hrSystemService->getFaculties($type, $status);
            return response()->json($faculties);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get faculty by ID
     */
    public function getFaculty($facultyId)
    {
        try {
            $faculty = $this->hrSystemService->getFaculty($facultyId);
            return response()->json($faculty);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Refresh data
     */
    public function refresh(Request $request)
    {
        // Redirect back to index which will reload all data
        return redirect()->route('hr-system.index');
    }
}

