<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Isp3;

class Isp3Controller extends Controller
{
    public function store (Request $request)
    {
        $isp3s = $request->input("isp3s");

        foreach ($isp3s as $isp3) {

            $isp3FromDb = Isp3::where("description", $isp3["name"])->first();

            if (!$isp3FromDb) continue;

            $indicators = $isp3["indicators"];

            $isp3FromDb->indicators()->sync($indicators);

        }

        return response()->json(["status" => true, "message" => "Indicators successfully set to isp3s"], 200);
    }
}
