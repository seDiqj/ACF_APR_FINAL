<?php

namespace Database\Seeders;

use App\Models\Database;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabasesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $databases = ["main_database", "main_database_meal_tool", "kit_database", "psychoeducation_database", "cd_database", "training_database", "refferal_database", "enact_database"];

        foreach($databases as $database) {
            Database::create([
                "name" => $database
            ]);
        }

    }
}
