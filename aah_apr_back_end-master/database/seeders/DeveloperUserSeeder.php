<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Permission;

class DeveloperUserSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'developer@developer.com')->first();

        if (! $user) {
            $this->command->warn('⚠️  User with email admin@example.com not found!');
            return;
        }

        $permissions = Permission::pluck('name')->toArray();

        if (empty($permissions)) {
            $this->command->warn('⚠️  No permissions found. Did you run the permission seeder?');
            return;
        }

        $user->syncPermissions($permissions);

        $this->command->info('✅ All permissions assigned successfully to user: ' . $user->email);
    }
}
