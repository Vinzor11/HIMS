import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Building2, GraduationCap, RefreshCw, User, AlertCircle, Users, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface Employee {
    id: string;
    name: {
        surname: string;
        first_name: string;
        middle_name?: string;
        name_extension?: string;
        full_name: string;
    };
    contact: {
        email: string;
        mobile?: string;
        telephone?: string;
    };
    employment: {
        status: string;
        employment_status: string;
        employee_type: string;
        date_hired?: string;
        date_regularized?: string;
    };
    department?: {
        id: number;
        code: string;
        name: string;
        type: string;
        faculty_id?: number;
    };
    position?: {
        id: number;
        code: string;
        name: string;
    };
    personal?: {
        birth_date?: string;
        gender?: string;
        civil_status?: string;
    };
    address?: {
        present?: string | {
            house_no?: string;
            street?: string;
            subdivision?: string;
            barangay?: string;
            city?: string;
            province?: string;
            zip_code?: string;
        };
        permanent?: string | {
            house_no?: string;
            street?: string;
            subdivision?: string;
            barangay?: string;
            city?: string;
            province?: string;
            zip_code?: string;
        };
    };
    government_ids?: {
        gsis?: string;
        sss?: string;
        tin?: string;
        pagibig?: string;
    };
    special_categories?: {
        [key: string]: any;
    };
}

interface Department {
    id: number;
    code: string;
    name: string;
    type: string;
    description?: string;
    faculty?: {
        id: number;
        code: string;
        name: string;
    };
}

interface Faculty {
    id: number;
    code: string;
    name: string;
    type?: string;
    status?: string;
    description?: string;
}

interface EmployeesResponse {
    data: Employee[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
}

interface HRSystemIndexProps {
    hasAccessToken: boolean;
    employeeId: string | null;
    employee: Employee | null;
    departments: { data: Department[]; count: number } | null;
    faculties: { data: Faculty[]; count: number } | null;
    error: string | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'HR System',
        href: '/hr-system',
    },
];

export default function HRSystemIndex({
    hasAccessToken,
    employeeId,
    employee,
    departments,
    faculties,
    error,
}: HRSystemIndexProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [employeesData, setEmployeesData] = useState<EmployeesResponse | null>(null);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [employeesError, setEmployeesError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(50);
    const [status, setStatus] = useState<'active' | 'inactive' | 'all'>('active');

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            preserveScroll: true,
            onFinish: () => setIsRefreshing(false),
        });
    };

    const fetchEmployees = async (pageNum: number = page, perPageNum: number = perPage, statusFilter: string = status) => {
        setIsLoadingEmployees(true);
        setEmployeesError(null);
        
        try {
            const params = new URLSearchParams({
                page: pageNum.toString(),
                per_page: perPageNum.toString(),
                status: statusFilter,
            });
            
            const response = await fetch(`/hr-system/employees?${params.toString()}`, {
                headers: {
                    'Accept': 'application/json',
                },
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setEmployeesData(data);
            setPage(pageNum);
            setPerPage(perPageNum);
            setStatus(statusFilter as 'active' | 'inactive' | 'all');
        } catch (error: any) {
            setEmployeesError(error.message || 'Failed to fetch employees');
            setEmployeesData(null);
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && employeesData && newPage <= employeesData.meta.last_page) {
            fetchEmployees(newPage, perPage, status);
        }
    };

    const handlePerPageChange = (newPerPage: string) => {
        const num = parseInt(newPerPage);
        if (num >= 1 && num <= 100) {
            fetchEmployees(1, num, status);
        }
    };

    const handleStatusChange = (newStatus: string) => {
        fetchEmployees(1, perPage, newStatus);
    };

    if (!hasAccessToken) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="HR System Data" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <Card className="border-destructive">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                <CardTitle>Authentication Required</CardTitle>
                            </div>
                            <CardDescription>
                                Please authenticate with HR System to view data
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                You need to sign in with HR System first. Go to the login page and
                                click "Sign in with HR System" to authenticate.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    // Show error card only if we have no data at all
    if (error && !employee && !departments && !faculties) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="HR System Data" />
                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    <Card className="border-destructive">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-destructive" />
                                <CardTitle>Error Loading Data</CardTitle>
                            </div>
                            <CardDescription>{error}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    This error may occur if:
                                </p>
                                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                    <li>The HR System API endpoint does not exist</li>
                                    <li>The access token has expired or is invalid</li>
                                    <li>You don't have permission to access the resource</li>
                                    <li>The HR System is temporarily unavailable</li>
                                </ul>
                                <div className="pt-4">
                                    <Button onClick={handleRefresh} disabled={isRefreshing}>
                                        <RefreshCw
                                            className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                                        />
                                        Retry
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="HR System Data" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">HR System Data</h1>
                        <p className="text-sm text-muted-foreground">
                            View employee, department, and faculty information from HR System
                            {employeeId && (
                                <span className="ml-2 text-xs">
                                    (Employee ID: <code className="bg-muted px-1 rounded">{employeeId}</code>)
                                </span>
                            )}
                        </p>
                    </div>
                    <Button onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                        Refresh Data
                    </Button>
                </div>

                {/* Show error banner if there are partial errors */}
                {error && (employee || departments || faculties) && (
                    <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                <CardTitle className="text-yellow-800 dark:text-yellow-200">
                                    Partial Data Loaded
                                </CardTitle>
                            </div>
                            <CardDescription className="text-yellow-700 dark:text-yellow-300">
                                {error}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Employee Card */}
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                <CardTitle>Current Employee</CardTitle>
                            </div>
                            <CardDescription>Your employee information from HR System</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {employee ? (
                                <div className="space-y-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Full Name
                                            </p>
                                            <p className="text-lg font-semibold">
                                                {employee.name.full_name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Employee ID
                                            </p>
                                            <p className="text-lg font-semibold">{employee.id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Email
                                            </p>
                                            <p className="text-lg">{employee.contact.email}</p>
                                        </div>
                                        {employee.contact.mobile && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Mobile
                                                </p>
                                                <p className="text-lg">{employee.contact.mobile}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Employment Status
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge
                                                    variant={
                                                        employee.employment.status === 'active'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {employee.employment.employment_status}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {employee.employment.employee_type}
                                                </Badge>
                                            </div>
                                        </div>
                                        {employee.department && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Department
                                                </p>
                                                <p className="text-lg">{employee.department.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {employee.department.code}
                                                </p>
                                            </div>
                                        )}
                                        {employee.position && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Position
                                                </p>
                                                <p className="text-lg">{employee.position.name}</p>
                                            </div>
                                        )}
                                        {employee.employment.date_hired && (
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Date Hired
                                                </p>
                                                <p className="text-lg">
                                                    {new Date(
                                                        employee.employment.date_hired
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {/* Personal Information */}
                                    {employee.personal && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                                Personal Information
                                            </p>
                                            <div className="grid gap-2 md:grid-cols-3">
                                                {employee.personal.birth_date && (
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">
                                                            Birth Date:
                                                        </span>{' '}
                                                        <span className="text-sm">
                                                            {new Date(
                                                                employee.personal.birth_date
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                {employee.personal.gender && (
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">
                                                            Gender:
                                                        </span>{' '}
                                                        <span className="text-sm">
                                                            {employee.personal.gender}
                                                        </span>
                                                    </div>
                                                )}
                                                {employee.personal.civil_status && (
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">
                                                            Civil Status:
                                                        </span>{' '}
                                                        <span className="text-sm">
                                                            {employee.personal.civil_status}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Address Information */}
                                    {employee.address && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                                Address Information
                                            </p>
                                            <div className="grid gap-2 md:grid-cols-2">
                                                {employee.address.present && (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground mb-1">
                                                            Present Address:
                                                        </p>
                                                        {typeof employee.address.present === 'string' ? (
                                                            <p className="text-sm">{employee.address.present}</p>
                                                        ) : (
                                                            <div className="text-sm space-y-1">
                                                                {employee.address.present.house_no && (
                                                                    <p>{employee.address.present.house_no}</p>
                                                                )}
                                                                {employee.address.present.street && (
                                                                    <p>{employee.address.present.street}</p>
                                                                )}
                                                                {employee.address.present.subdivision && (
                                                                    <p>{employee.address.present.subdivision}</p>
                                                                )}
                                                                {employee.address.present.barangay && (
                                                                    <p>{employee.address.present.barangay}</p>
                                                                )}
                                                                <p>
                                                                    {[
                                                                        employee.address.present.city,
                                                                        employee.address.present.province,
                                                                        employee.address.present.zip_code,
                                                                    ]
                                                                        .filter(Boolean)
                                                                        .join(', ')}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                {employee.address.permanent && (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground mb-1">
                                                            Permanent Address:
                                                        </p>
                                                        {typeof employee.address.permanent === 'string' ? (
                                                            <p className="text-sm">{employee.address.permanent}</p>
                                                        ) : (
                                                            <div className="text-sm space-y-1">
                                                                {employee.address.permanent.house_no && (
                                                                    <p>{employee.address.permanent.house_no}</p>
                                                                )}
                                                                {employee.address.permanent.street && (
                                                                    <p>{employee.address.permanent.street}</p>
                                                                )}
                                                                {employee.address.permanent.subdivision && (
                                                                    <p>{employee.address.permanent.subdivision}</p>
                                                                )}
                                                                {employee.address.permanent.barangay && (
                                                                    <p>{employee.address.permanent.barangay}</p>
                                                                )}
                                                                <p>
                                                                    {[
                                                                        employee.address.permanent.city,
                                                                        employee.address.permanent.province,
                                                                        employee.address.permanent.zip_code,
                                                                    ]
                                                                        .filter(Boolean)
                                                                        .join(', ')}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Government IDs */}
                                    {employee.government_ids && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                                Government IDs
                                            </p>
                                            <div className="grid gap-2 md:grid-cols-4">
                                                {employee.government_ids.gsis && (
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">
                                                            GSIS:
                                                        </span>{' '}
                                                        <span className="text-sm">
                                                            {employee.government_ids.gsis}
                                                        </span>
                                                    </div>
                                                )}
                                                {employee.government_ids.sss && (
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">
                                                            SSS:
                                                        </span>{' '}
                                                        <span className="text-sm">
                                                            {employee.government_ids.sss}
                                                        </span>
                                                    </div>
                                                )}
                                                {employee.government_ids.tin && (
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">
                                                            TIN:
                                                        </span>{' '}
                                                        <span className="text-sm">
                                                            {employee.government_ids.tin}
                                                        </span>
                                                    </div>
                                                )}
                                                {employee.government_ids.pagibig && (
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">
                                                            Pag-IBIG:
                                                        </span>{' '}
                                                        <span className="text-sm">
                                                            {employee.government_ids.pagibig}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Special Categories */}
                                    {employee.special_categories &&
                                        Object.keys(employee.special_categories).length > 0 && (
                                            <div className="pt-4 border-t">
                                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                                    Special Categories
                                                </p>
                                                <div className="grid gap-2 md:grid-cols-2">
                                                    {Object.entries(employee.special_categories).map(
                                                        ([key, value]) => (
                                                            <div key={key}>
                                                                <span className="text-xs text-muted-foreground capitalize">
                                                                    {key.replace(/_/g, ' ')}:
                                                                </span>{' '}
                                                                <span className="text-sm">
                                                                    {String(value)}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Departments Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                <CardTitle>Departments</CardTitle>
                            </div>
                            <CardDescription>
                                {departments
                                    ? `${departments.count} department${departments.count !== 1 ? 's' : ''}`
                                    : 'Loading departments...'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {departments && departments.data ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {departments.data.map((dept) => (
                                        <div
                                            key={dept.id}
                                            className="p-3 rounded-lg border border-sidebar-border/70 bg-muted/30"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-semibold">{dept.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {dept.code}
                                                    </p>
                                                    {dept.description && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {dept.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <Badge variant="outline" className="ml-2">
                                                    {dept.type}
                                                </Badge>
                                            </div>
                                            {dept.faculty && (
                                                <div className="mt-2 pt-2 border-t border-sidebar-border/50">
                                                    <p className="text-xs text-muted-foreground">
                                                        Faculty:
                                                    </p>
                                                    <p className="text-sm font-medium">
                                                        {dept.faculty.name}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Faculties Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <GraduationCap className="h-5 w-5" />
                                <CardTitle>Faculties</CardTitle>
                            </div>
                            <CardDescription>
                                {faculties
                                    ? `${faculties.count} facult${faculties.count !== 1 ? 'ies' : 'y'}`
                                    : 'Loading faculties...'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {faculties && faculties.data ? (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {faculties.data.map((faculty) => (
                                        <div
                                            key={faculty.id}
                                            className="p-3 rounded-lg border border-sidebar-border/70 bg-muted/30"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="font-semibold">{faculty.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {faculty.code}
                                                    </p>
                                                    {faculty.description && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {faculty.description}
                                                        </p>
                                                    )}
                                                </div>
                                                {faculty.status && (
                                                    <Badge
                                                        variant={
                                                            faculty.status === 'active'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="ml-2"
                                                    >
                                                        {faculty.status}
                                                    </Badge>
                                                )}
                                            </div>
                                            {faculty.type && (
                                                <div className="mt-2">
                                                    <Badge variant="outline">{faculty.type}</Badge>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Employees API Testing Card */}
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                <CardTitle>Employees API Testing</CardTitle>
                            </div>
                            <CardDescription>
                                Test the Employees API endpoint with pagination and filtering
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Controls */}
                                <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-muted/30">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium">Status:</label>
                                        <Select value={status} onValueChange={handleStatusChange}>
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="all">All</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-medium">Per Page:</label>
                                        <Select value={perPage.toString()} onValueChange={handlePerPageChange}>
                                            <SelectTrigger className="w-[100px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="25">25</SelectItem>
                                                <SelectItem value="50">50</SelectItem>
                                                <SelectItem value="100">100</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button 
                                        onClick={() => fetchEmployees(page, perPage, status)}
                                        disabled={isLoadingEmployees}
                                    >
                                        {isLoadingEmployees ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            'Fetch Employees'
                                        )}
                                    </Button>
                                </div>

                                {/* Error Display */}
                                {employeesError && (
                                    <Card className="border-destructive bg-destructive/10">
                                        <CardContent className="pt-6">
                                            <div className="flex items-center gap-2 text-destructive">
                                                <AlertCircle className="h-4 w-4" />
                                                <p className="text-sm">{employeesError}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Employees Table */}
                                {employeesData && (
                                    <div className="space-y-4">
                                        {/* Pagination Info */}
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div>
                                                Showing {employeesData.meta.from || 0} to {employeesData.meta.to || 0} of {employeesData.meta.total} employees
                                            </div>
                                            <div>
                                                Page {employeesData.meta.current_page} of {employeesData.meta.last_page}
                                            </div>
                                        </div>

                                        {/* Table */}
                                        <div className="border rounded-lg overflow-hidden">
                                            <div className="overflow-x-auto">
                                                <table className="w-full">
                                                    <thead className="bg-muted">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-sm font-medium">ID</th>
                                                            <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                                                            <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                                                            <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                                                            <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                                                            <th className="px-4 py-3 text-left text-sm font-medium">Department</th>
                                                            <th className="px-4 py-3 text-left text-sm font-medium">Position</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {employeesData.data.map((emp) => (
                                                            <tr key={emp.id} className="border-t hover:bg-muted/50">
                                                                <td className="px-4 py-3 text-sm font-mono">{emp.id}</td>
                                                                <td className="px-4 py-3 text-sm font-medium">{emp.name.full_name}</td>
                                                                <td className="px-4 py-3 text-sm">{emp.contact.email}</td>
                                                                <td className="px-4 py-3">
                                                                    <Badge 
                                                                        variant={emp.employment.status === 'active' ? 'default' : 'secondary'}
                                                                    >
                                                                        {emp.employment.status}
                                                                    </Badge>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">{emp.employment.employee_type}</td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    {emp.department ? (
                                                                        <div>
                                                                            <div className="font-medium">{emp.department.name}</div>
                                                                            <div className="text-xs text-muted-foreground">{emp.department.code}</div>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">-</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    {emp.position ? emp.position.name : <span className="text-muted-foreground">-</span>}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Pagination Controls */}
                                        <div className="flex items-center justify-between">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(page - 1)}
                                                disabled={!employeesData.links.prev || isLoadingEmployees}
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" />
                                                Previous
                                            </Button>
                                            <div className="text-sm text-muted-foreground">
                                                Page {employeesData.meta.current_page} of {employeesData.meta.last_page}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(page + 1)}
                                                disabled={!employeesData.links.next || isLoadingEmployees}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Loading State */}
                                {isLoadingEmployees && !employeesData && (
                                    <div className="space-y-2">
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                )}

                                {/* Empty State */}
                                {!isLoadingEmployees && !employeesData && !employeesError && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Click "Fetch Employees" to load employee data</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}

