<?php

namespace Database\Seeders;

use App\Models\Sector;
use Illuminate\Database\Seeder;

class SectorsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sectors = ["mhpss", "wash", "health&nutrition", "fsl"];

        foreach($sectors as $sector) {
            Sector::create([
                "name" => $sector
            ]);
        }
    }
}
