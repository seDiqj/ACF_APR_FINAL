<?php

namespace Database\Seeders;

use App\Models\IndicatorType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class IndicatorsTypeTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = ["adult_psychosocial_support", "child_psychosocial_support", "parenting_skills", "child_care_practices"];

        foreach ($types as $type) {
            IndicatorType::create([
                "type" => $type,
            ]);
        }
    }
}
