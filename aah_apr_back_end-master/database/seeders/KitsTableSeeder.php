<?php

namespace Database\Seeders;

use App\Models\Kit;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KitsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Kit::create([
            "name" => "test_kit",
            "description" => "some test description",
            "status" => "active",
        ]);
    }
}
