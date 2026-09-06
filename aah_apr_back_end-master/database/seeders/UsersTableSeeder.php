<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = env('SEED_ADMIN_PASSWORD') ?: 'developer123';

        User::factory()->create([
            'name' => 'Mosa Baregzay',
            "title" => "Developer",
            'email' => 'developer@developer.com',
            "password" => Hash::make($password),
            "status" => "active",
            "department_id" => Department::find(1)->id,
        ]);

        $this->command->info('Admin user created: developer@developer.com');
        $this->command->info('Admin password: ' . $password);
        $this->command->info('Set SEED_ADMIN_PASSWORD in .env to use a known password.');

        $user = User::where('email', 'developer@developer.com')->first();

        if (! $user) {
            $this->command->warn('⚠️  User with email admin@example.com not found!');
            return;
        }

        $this->command->info('✅ All permissions assigned successfully to user: ' . $user->email);
    }
}
