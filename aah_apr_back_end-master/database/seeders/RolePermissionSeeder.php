<?php

namespace Database\Seeders;

use App\Enums\PermissionEnum;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // ===================== Roles =====================
        $roles = [
            'Sys_admin',
            'CD/DCD',
            'HoD/DHoD/FM',
            'Grant Co',
            'HQ',
            'RFM',
            'PM/DPM',
            'Supervisor',
            'Data Entry',
            'User',
        ];

        $permissionGroups = [
            "List User" => "User",
            "Create User" => "User",
            "Edit User" => "User",
            "Delete User" => "User",
            "View User" => "User",
            "Export User" => "User",
            "List Role" => "Role",
            "Create Role" => "Role",
            "Edit Role" => "Role",
            "Delete Role" => "Role",
            "View Role" => "Role",
            "Export Role" => "Role",
            "List Category" => "Category",
            "Create Category" => "Category",
            "Edit Category" => "Category",
            "Delete Category" => "Category",
            "Project.create" => "Grant Management",
            "Project.view" => "Grant Management",
            "Project.edit" => "Grant Management",
            "Project.delete" => "Grant Management",
            "Project.submit" => "Grant Management",
            "Project.grantFinalize" => "Grant Management",
            "Project.HQFinalize" => "Grant Management",
            "Maindatabase.create" => "Myspace Main Database (MHPSS)",
            "Maindatabase.view" => "Myspace Main Database (MHPSS)",
            "Maindatabase.edit" => "Myspace Main Database (MHPSS)",
            "Maindatabase.delete" => "Myspace Main Database (MHPSS)",
            "Maindatabase.download_excel_report" => "Myspace Main Database (MHPSS)",
            "Kit.create" => "Myspace Kit Distribution",
            "Kit.view" => "Myspace Kit Distribution",
            "Kit.edit" => "Myspace Kit Distribution",
            "Kit.delete" => "Myspace Kit Distribution",
            "Kit.assign" => "Myspace Kit Distribution",
            "Kit_database.download_excel_report" => "Myspace Kit Distribution",
            "Psychoeducation.create" => "Myspace Psychoeducation",
            "Psychoeducation.view" => "Myspace Psychoeducation",
            "Psychoeducation.edit" => "Myspace Psychoeducation",
            "Psychoeducation.delete" => "Myspace Psychoeducation",
            "Psychoeducation.download_excel_report" => "Myspace Psychoeducation",
            "Dialogue.create" => "Myspace Community Dialogue",
            'Dialogue.create_beneficiary' => "Myspace Community Dialogue",
            "Dialogue.view" => "Myspace Community Dialogue",
            "Dialogue.edit" => "Myspace Community Dialogue",
            "Dialogue.delete" => "Myspace Community Dialogue",
            "Dialogue.assign" => "Myspace Community Dialogue",
            'Community_dailogue.download_excel_report' => "Myspace Community Dialogue",
            "Training.create" => "Myspace Training Sessions",
            "Training.view" => "Myspace Training Sessions",
            "Training.edit" => "Myspace Training Sessions",
            "Training.delete" => "Myspace Training Sessions",
            'Training.assign_training' => "Myspace Training Sessions",
            'Training_database.download_excel_report' => "Myspace Training Sessions",
            "Referral.create" => "Myspace Referrals",
            "Referral.view" => "Myspace Referrals",
            "Referral.edit" => "Myspace Referrals",
            "Referral.delete" => "Myspace Referrals",
            "Referral.assign" => "Myspace Referrals",
            'Export.referral excel report' => "Myspace Referrals",
            'Enact.create' => "Myspace Enacts",
            'Enact.view' => "Myspace Enacts",
            'Enact.edit' => "Myspace Enacts",
            'Enact.delete' => "Myspace Enacts",
            "Database_submission.create" => "Database Submission",
            "Database_submission.view" => "Database Submission",
            "Database_submission.edit" => "Database Submission",
            "Database_submission.delete" => "Database Submission",
            "Database_submission.assign" => "Database Submission",
            "Database_submission.approve" => "Database Submission",
            "Database_submission.generate_apr" => "Database Submission",
            "Database_submission.download" => "Database Submission",
            "Apr.review" => "APR Management",
            "Apr.view/list" => "APR Management",
            "Apr.mark_as_reviewed" => "APR Management",
            "Apr.validate" => "APR Management",
            "Apr.download" => "APR Management",
            "Month Report Chart" => "Dashboard",
            'Project activities' => "Dashboard",
            "filtering" => "Dashboard",
            "View Activities" => "Log System",
            "delete Activities" => "Log System",
        ];

        // ===================== Create all permissions =====================
        foreach (PermissionEnum::cases() as $permission) {
            Permission::firstOrCreate([
                'name' => $permission->value,
                "label" => strtoupper($permission->value),
                "group_name" => $permissionGroups[$permission->value]
            ]);
        }

        // ===================== Assign permissions =====================
        $rolePermissions = [

            'Sys_admin' => array_map(fn($p) => $p->value, PermissionEnum::cases()),

            'CD/DCD' => [
                PermissionEnum::USER_VIEW->value,
                PermissionEnum::ROLE_VIEW->value,
                PermissionEnum::GRANT_PROJECT_VIEW->value,
                PermissionEnum::APR_VIEW->value,
                PermissionEnum::DASHBOARD_MONTH_REPORT_CHART->value,
                PermissionEnum::DASHBOARD_PROJECT_ACTIVITIES->value,
            ],

            'HoD/DHoD/FM' => [
                PermissionEnum::USER_VIEW->value,
                PermissionEnum::GRANT_PROJECT_CREATE->value,
                PermissionEnum::GRANT_PROJECT_EDIT->value,
                PermissionEnum::GRANT_PROJECT_SUBMIT->value,
                PermissionEnum::APR_REVIEW->value,
                PermissionEnum::APR_VIEW->value,
            ],

            'Grant Co' => [
                PermissionEnum::GRANT_PROJECT_CREATE->value,
                PermissionEnum::GRANT_PROJECT_EDIT->value,
                PermissionEnum::GRANT_PROJECT_DELETE->value,
                PermissionEnum::GRANT_PROJECT_VIEW->value,
                PermissionEnum::GRANT_PROJECT_SUBMIT->value,
            ],

            'HQ' => [
                PermissionEnum::GRANT_PROJECT_HQ_FINALIZE->value,
                PermissionEnum::DATABASE_APPROVE->value,
                PermissionEnum::APR_VALIDATE->value,
                PermissionEnum::APR_DOWNLOAD->value,
            ],

            'RFM' => [
                PermissionEnum::KIT_VIEW->value,
                PermissionEnum::PSYCHO_VIEW->value,
                PermissionEnum::DIALOGUE_VIEW->value,
                PermissionEnum::TRAINING_VIEW->value ?? null,
                PermissionEnum::REFERRAL_VIEW->value,
                PermissionEnum::DATABASE_VIEW->value,
            ],

            // --- PM/DPM ---
            'PM/DPM' => [
                PermissionEnum::GRANT_PROJECT_VIEW->value,
                PermissionEnum::DIALOGUE_CREATE->value,
                PermissionEnum::DIALOGUE_EDIT->value,
                PermissionEnum::DIALOGUE_DELETE->value,
                PermissionEnum::DIALOGUE_ASSIGN->value,
                PermissionEnum::PSYCHO_CREATE->value,
                PermissionEnum::PSYCHO_EDIT->value,
                PermissionEnum::PSYCHO_DELETE->value,
            ],

            // --- Supervisor ---
            'Supervisor' => [
                PermissionEnum::TRAINING_CREATE->value,
                PermissionEnum::TRAINING_EDIT->value,
                PermissionEnum::TRAINING_DELETE->value,
                PermissionEnum::REFERRAL_CREATE->value,
                PermissionEnum::REFERRAL_EDIT->value,
                PermissionEnum::REFERRAL_DELETE->value,
                // PermissionEnum::DATABASE_SUBMISSION_CREATE->value ?? PermissionEnum::DATABASE_CREATE->value,
            ],

            // --- Data Entry ---
            'Data Entry' => [
                PermissionEnum::MHPSS_CREATE->value,
                PermissionEnum::MHPSS_EDIT->value,
                PermissionEnum::MHPSS_DELETE->value,
                PermissionEnum::KIT_CREATE->value,
                PermissionEnum::KIT_EDIT->value,
                PermissionEnum::KIT_DELETE->value,
                PermissionEnum::REFERRAL_CREATE->value,
                PermissionEnum::REFERRAL_EDIT->value,
            ],

            // --- User ---
            'User' => [
                PermissionEnum::USER_VIEW->value,
                PermissionEnum::ROLE_VIEW->value,
                PermissionEnum::DASHBOARD_FILTERING->value,
            ],
        ];

        // ===================== Apply roles and permissions =====================
        foreach ($roles as $roleName) {
            $role = Role::firstOrCreate(['name' => $roleName], ['status' => 'active']);
            $permissions = $rolePermissions[$roleName] ?? [];

            $permissions = array_filter($permissions);  
            $role->syncPermissions($permissions);
        }
    }
}