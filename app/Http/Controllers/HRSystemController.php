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
            'employee' => null,
            'departments' => null,
            'faculties' => null,
            'error' => null,
        ];

        if (!$this->hrSystemService->hasAccessToken()) {
            $data['error'] = 'No access token found. Please authenticate with HR System first.';
            return Inertia::render('hr-system/index', $data);
        }

        try {
            // Fetch all data - catch individual errors so we can still show partial data
            try {
                $data['employee'] = $this->hrSystemService->getCurrentEmployee();
            } catch (\Exception $e) {
                \Log::warning('Failed to fetch employee data', ['error' => $e->getMessage()]);
                $data['error'] = ($data['error'] ? $data['error'] . ' ' : '') . 'Employee: ' . $e->getMessage();
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

