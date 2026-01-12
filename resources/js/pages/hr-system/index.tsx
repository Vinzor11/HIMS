import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Building2, GraduationCap, RefreshCw, User, AlertCircle } from 'lucide-react';
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
        present?: string;
        permanent?: string;
    };
    government_ids?: {
        gsis?: string;
        sss?: string;
        tin?: string;
        pagibig?: string;
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

interface HRSystemIndexProps {
    hasAccessToken: boolean;
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
    employee,
    departments,
    faculties,
    error,
}: HRSystemIndexProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.post(
            '/hr-system/refresh',
            {},
            {
                preserveScroll: true,
                onFinish: () => setIsRefreshing(false),
            }
        );
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

    if (error) {
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
                            <Button onClick={handleRefresh} disabled={isRefreshing}>
                                <RefreshCw
                                    className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                                />
                                Retry
                            </Button>
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
                        </p>
                    </div>
                    <Button onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                        Refresh Data
                    </Button>
                </div>

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
                                    {employee.government_ids && (
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                                Government IDs
                                            </p>
                                            <div className="grid gap-2 md:grid-cols-3">
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
                </div>
            </div>
        </AppLayout>
    );
}

