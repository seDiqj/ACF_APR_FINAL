<?php

namespace Database\Seeders;

use App\Models\Isp3;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class Isp3TableSeeder extends Seeder
{
    
    public function run(): void
    {
       $isp3s =  [
            "Improved Mental health and psychosocial well-being",
            "Total transfers for the MHPSS & Protection sector",
            "Reach of Care Practices",
            "Reach of Mental health and Psychosocial Support and Protection",
            "Reach of MHPSS, Care Practices and Protection capacity building activities",
            "Reach of MHPSS, Care Practices and Protection kits deliveries",
       ];

       foreach ($isp3s as $isp3) {
            Isp3::create([
                "description" => $isp3
            ]);
       }
    }
}
