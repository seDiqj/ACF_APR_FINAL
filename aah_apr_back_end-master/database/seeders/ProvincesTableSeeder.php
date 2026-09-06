<?php

namespace Database\Seeders;

use App\Models\Province;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProvincesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $provinces = ["kabul", "badakhshan", "helmand", "ghor", "daikundi"];

        foreach($provinces as $province) {
            Province::create([
                "name" => $province
            ]);
        }
    }
}
