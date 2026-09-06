<?php

namespace App\Http\Controllers;

use App\Models\Database;
use App\Models\District;
use App\Models\Indicator;
use App\Models\Kit;
use App\Models\Project;
use App\Models\Province;
use App\Models\Sector;

class FiltersListController extends Controller
{

    // For V2.0, this method will be used to get the filters list for any table based on the fields sent in the request.
    public function getFiltersList(array $fields)
    {
        $finalData = [];

        foreach ($fields as $field) {

            if (in_array($field, ["projectCode", "indicator", "indicatorRef", "province", "district"])) {
                switch ($field) {
                    case "projectCode":
                        $options = Project::select("id", "projectCode")->get()
                            ->map(fn($p) => ["value" => $p->id, "label" => $p->projectCode]);
                        break;

                    case "indicator":
                    case "indicatorRef":
                        $options = Indicator::select("id", "indicatorRef")->get()
                            ->map(fn($i) => ["value" => $i->id, "label" => $i->indicatorRef]);
                        break;

                    case "province":
                        $options = Province::select("id", "name")->get()
                            ->map(fn($p) => ["value" => $p->id, "label" => $p->name]);
                        break;

                    case "district":
                        $options = District::select("id", "name")->get()
                            ->map(fn($d) => ["value" => $d->id, "label" => $d->name]);
                        break;
                }

                $finalData[] = [
                    "filter"  => $field,
                    "type"    => "multiSelect",
                    "options" => $options
                ];

            } elseif ($field === "maritalStatus") {
                $finalData[] = [
                    "filter"  => $field,
                    "type"    => "multiSelect",
                    "options" => [
                        ["value"=>"single","label"=>"Single"],
                        ["value"=>"married","label"=>"Married"],
                        ["value"=>"divorced","label"=>"Divorced"],
                        ["value"=>"widowed","label"=>"Widowed"],
                        ["value"=>"separated","label"=>"Separated"],
                    ]
                ];
            } elseif ($field === "householdStatus") {
                $finalData[] = [
                    "filter"  => $field,
                    "type"    => "multiSelect",
                    "options" => [
                        ["value"=>"idp_drought","label"=>"IDP (Drought)"],
                        ["value"=>"idp_conflict","label"=>"IDP (Conflict)"],
                        ["value"=>"returnee","label"=>"Returnee"],
                        ["value"=>"host_community","label"=>"Host Community"],
                        ["value"=>"refugee","label"=>"Refugee"],
                    ]
                ];
            } elseif ($field === "gender" || $field === "status") {
                $options = $field === "gender"
                    ? [["value"=>"male","label"=>"Male"], ["value"=>"female","label"=>"Female"]]
                    : [["value"=>"active","label"=>"Active"], ["value"=>"inactive","label"=>"Inactive"]];

                $finalData[] = [
                    "filter"  => $field,
                    "type"    => "multiSelect",
                    "options" => $options
                ];

            } else {
                $finalData[] = [
                    "filter" => $field,
                    "type"   => "text",
                ];
            }
        }

        return response()->json([
            "status"  => true,
            "message" => "",
            "data"    => $finalData
        ], 200);
    }
    
    public function getSubmittedDatabasesFiltersList () {

        $projects = Project::select("id", "projectCode")->get();
        $provinces = Province::select("id", "name")->get();
        $databases = Database::select("id", "name")->get();

        $finalData = [
            [
                "filter" => "projectCode",
                "type" => "multiSelect",
                "options" => $projects->map(function ($project) {
                    return [
                        "value" => $project->id,
                        "label" => $project->projectCode
                    ];
                }),
            ],
            [
                "filter" => "province",
                "type" => "multiSelect",
                "options" => $provinces->map(function ($province) {
                    return [
                        "value" => $province->id,
                        "label" => $province->name
                    ];
                }),
            ],
            [
                "filter" => "database",
                "type" => "multiSelect",
                "options" => $databases->map(function ($database) {
                    return [
                        "value" => $database->id,
                        "label" => $database->name
                    ];
                }),
            ],
            [
                "filter" => "fromData",
                "type" => "text",
            ],
            [
                "filter" => "toDate",
                "type" => "text",
            ],
        ];

        return response()->json(["status" => true, "message" => "", "data" => $finalData], 200);
    }

    public function getProjectsFiltersList () {

        $projects = Project::select("id", "projectCode")->get();
        $provinces = Province::select("id", "name")->get();
        $sectors = Sector::select("id", "name")->get();

        $finalData = [
            [
                "filter" => "projectCode",
                "type" => "multiSelect",
                "options" => $projects->map(function ($project) {
                    return [
                        "value" => $project->id,
                        "label" => $project->projectCode
                    ];
                }),
            ],
            [
                "filter" => "thematicSector",
                "type" => "multiSelect",
                "options" => $sectors->map(function ($sector) {
                    return [
                        "value" => $sector->id,
                        "label" => $sector->name
                    ];
                })
            ],
            [
                "filter" => "province",
                "type" => "multiSelect",
                "options" => $provinces->map(function ($province) {
                    return [
                        "value" => $province->id,
                        "label" => $province->name
                    ];
                }),
            ],
            [
                "filter" => "status",
                "type" => "multiSelect",
                "options" => [
                    [
                        "value" => "planed",
                        "label" => "Planed"
                    ],
                    [
                        "value" => "onGoing",
                        "label" => "On going",
                    ],
                    [
                        "value" => "compleated",
                        "label" => "Compleated"
                    ],
                    [
                        "value" => "onHold",
                        "label" => "On hold"
                    ],
                    [
                        "value" => "canclled",
                        "lable" => "Canclled"
                    ]
                ]
            ],
            [
                "filter" => "projectManager",
                "type" => "text",
            ],
            [
                "filter" => "startDate",
                "type" => "text",
            ],
            [
                "filter" => "endDate",
                "type" => "text",
            ],
            
        ];

        return response()->json(["status" => true, "message" => "", "data" => $finalData], 200);

    }

    public function getMainDbBnfFiltersList () {

        $projects = Project::select("id", "projectCode")->get();
        $indicators = Indicator::select("id", "indicatorRef")->get();
        $provinces = Province::select("id", "name")->get();

        $finalData = [

            [
                "filter" => "projectCode",
                "type" => "multiSelect",
                "options" => $projects->map(function ($project) {
                    return [
                        "value" => $project->id,
                        "label" => $project->projectCode
                    ];
                })
            ],
            [
                "filter" => "indicator",
                "type" => "multiSelect",
                "options" => $indicators->map(function ($indicator) {
                    return [
                        "value" => $indicator->id,
                        "label" => $indicator->indicatorRef
                    ];
                })
            ],
            [
                "filter" => "province",
                "type" => "multiSelect",
                "options" => $provinces->map(function ($province) {
                    return [
                        "value" => $province->id,
                        "label" => $province->name
                    ];
                })
            ],
            [
                "filter" => "maritalStatus",
                "type" => "multiSelect",
                "options" => [
                    [
                        "value" => "single",
                        "label" => "Single"
                    ],
                    [
                        "value" => "married",
                        "label" => "Married",
                    ],
                    [
                        "value" => "divorced",
                        "label" => "Divorced",
                    ],
                    [
                        "value" => "widowed",
                        "label" => "Widowed"
                    ],
                    [
                        "value" => "separated",
                        "label" => "Separated"
                    ]
                ] 
            ],
            [
                "filter" => "householdStatus",
                "type" => "multiSelect",
                "options" => [
                    [ "value" => "idp_drought", "label" => "IDP (Drought)" ],
                    [ "value" => "idp_conflict", "label" => "IDP (Conflict)" ],
                    [ "value" => "returnee", "label" => "Returnee" ],
                    [ "value" => "host_community", "label" => "Host Community" ],
                    [ "value" => "refugee", "label" => "Refugee" ],
                ]
            ],
            [
                "filter" => "focalPoint",
                "type" => "text",
            ],
            [
                "filter" => "siteCode",
                "type" => "text"
            ],
            [
                "filter" => "healthFacilitator",
                "type" => "text"
            ],
            [
                "filter" => "dateOfRegistration",
                "type" => "text"
            ],
            [
                "filter" => "age",
                "type" => "text"
            ],
            [
                "filter" => "baselineDate",
                "type" => "text"
            ],
            [
                "filter" => "endlineDate",
                "type" => "text",
            ],
            [
                "filter" => "code",
                "type" => "text"
            ]

        ];

        return response()->json(["status" => true, "message" => "", "data" => $finalData], 200);
    }

    public function getMainDbProgramsFiltersList()
    {
        $projects   = Project::select("id", "projectCode")->get();
        $provinces  = Province::select("id", "name")->get();
        $districts  = District::select("id", "name")->get();

        $finalData = [

            [
                "filter" => "projectCode",
                "type"   => "multiSelect",
                "options" => $projects->map(function ($project) {
                    return [
                        "value" => $project->id,
                        "label" => $project->projectCode
                    ];
                })
            ],

            [
                "filter" => "focalPoint",
                "type"   => "text",
            ],

            [
                "filter" => "province",
                "type"   => "multiSelect",
                "options" => $provinces->map(function ($province) {
                    return [
                        "value" => $province->id,
                        "label" => $province->name
                    ];
                })
            ],

            [
                "filter" => "district",
                "type"   => "multiSelect",
                "options" => $districts->map(function ($district) {
                    return [
                        "value" => $district->id,
                        "label" => $district->name
                    ];
                })
            ],

            [
                "filter" => "village",
                "type"   => "text",
            ],

            [
                "filter" => "siteCode",
                "type"   => "text",
            ],

            [
                "filter" => "healthFacilityName",
                "type"   => "text",
            ],

            [
                "filter" => "interventionModality",
                "type"   => "text",
            ],
        ];

        return response()->json([
            "status"  => true,
            "message" => "",
            "data"    => $finalData
        ], 200);
    }

    public function getKitDbBnfFiltersList()
    {
        $projects   = Project::select("id", "projectCode")->get();
        $indicators = Indicator::select("id", "indicatorRef")->get();
        $provinces  = Province::select("id", "name")->get();

        $finalData = [

            [
                "filter" => "projectCode",
                "type"   => "multiSelect",
                "options" => $projects->map(function ($project) {
                    return [
                        "value" => $project->id,
                        "label" => $project->projectCode
                    ];
                })
            ],

            [
                "filter" => "indicator",
                "type"   => "multiSelect",
                "options" => $indicators->map(function ($indicator) {
                    return [
                        "value" => $indicator->id,
                        "label" => $indicator->indicatorRef
                    ];
                })
            ],

            [
                "filter" => "focalPoint",
                "type"   => "text",
            ],

            [
                "filter" => "province",
                "type"   => "multiSelect",
                "options" => $provinces->map(function ($province) {
                    return [
                        "value" => $province->id,
                        "label" => $province->name
                    ];
                })
            ],

            [
                "filter" => "siteCode",
                "type"   => "text",
            ],

            [
                "filter" => "healthFacilitator",
                "type"   => "text",
            ],

            [
                "filter" => "dateOfRegistration",
                "type"   => "text",
            ],

            [
                "filter" => "age",
                "type"   => "text",
            ],

            [
                "filter" => "maritalStatus",
                "type"   => "multiSelect",
                "options" => [
                    [ "value" => "single",    "label" => "Single" ],
                    [ "value" => "married",   "label" => "Married" ],
                    [ "value" => "divorced",  "label" => "Divorced" ],
                    [ "value" => "widowed",   "label" => "Widowed" ],
                    [ "value" => "separated", "label" => "Separated" ],
                ]
            ],

            [
                "filter" => "householdStatus",
                "type"   => "multiSelect",
                "options" => [
                    [ "value" => "idp_drought",   "label" => "IDP (Drought)" ],
                    [ "value" => "idp_conflict",  "label" => "IDP (Conflict)" ],
                    [ "value" => "returnee",      "label" => "Returnee" ],
                    [ "value" => "host_community","label" => "Host Community" ],
                    [ "value" => "refugee",       "label" => "Refugee" ],
                ]
            ],

            [
                "filter" => "code",
                "type"   => "text",
            ],
        ];

        return response()->json([
            "status"  => true,
            "message" => "",
            "data"    => $finalData
        ], 200);
    }

    public function getKitDbProgramsFiltersList()
    {
        $projects   = Project::select("id", "projectCode")->get();
        $provinces  = Province::select("id", "name")->get();
        $districts  = District::select("id", "name")->get();

        $finalData = [

            [
                "filter" => "projectCode",
                "type"   => "multiSelect",
                "options" => $projects->map(function ($project) {
                    return [
                        "value" => $project->id,
                        "label" => $project->projectCode
                    ];
                })
            ],

            [
                "filter" => "focalPoint",
                "type"   => "text",
            ],

            [
                "filter" => "province",
                "type"   => "multiSelect",
                "options" => $provinces->map(function ($province) {
                    return [
                        "value" => $province->id,
                        "label" => $province->name
                    ];
                })
            ],

            [
                "filter" => "district",
                "type"   => "multiSelect",
                "options" => $districts->map(function ($district) {
                    return [
                        "value" => $district->id,
                        "label" => $district->name
                    ];
                })
            ],

            [
                "filter" => "village",
                "type"   => "text",
            ],

            [
                "filter" => "siteCode",
                "type"   => "text",
            ],

            [
                "filter" => "healthFacilityName",
                "type"   => "text",
            ],

            [
                "filter" => "interventionModality",
                "type"   => "text",
            ],
        ];

        return response()->json([
            "status"  => true,
            "message" => "",
            "data"    => $finalData
        ], 200);
    }

    public function getPsychoeducationFiltersList()
    {
        $indicators = Indicator::select("id", "indicatorRef")->get();

        $finalData = [

            [
                "filter" => "indicator",
                "type"   => "multiSelect",
                "options" => $indicators->map(function ($indicator) {
                    return [
                        "value" => $indicator->id,
                        "label" => $indicator->indicatorRef
                    ];
                })
            ],

            [
                "filter" => "awarenessTopic",
                "type"   => "text",
            ],

            [
                "filter" => "awarenessDate",
                "type"   => "text",
            ],
        ];

        return response()->json([
            "status"  => true,
            "message" => "",
            "data"    => $finalData
        ], 200);
    }

    public function getCdDbBnfFiltersList()
    {
        $projects   = Project::select("id", "projectCode")->get();
        $provinces  = Province::select("id", "name")->get();
        $indicators = Indicator::select("id", "indicatorRef")->get();

        $finalData = [

            [
                "filter" => "projectCode",
                "type"   => "multiSelect",
                "options" => $projects->map(function ($project) {
                    return [
                        "value" => $project->id,
                        "label" => $project->projectCode
                    ];
                })
            ],

            [
                "filter" => "province",
                "type"   => "multiSelect",
                "options" => $provinces->map(function ($province) {
                    return [
                        "value" => $province->id,
                        "label" => $province->name
                    ];
                })
            ],

            [
                "filter" => "indicator",
                "type"   => "multiSelect",
                "options" => $indicators->map(function ($indicator) {
                    return [
                        "value" => $indicator->id,
                        "label" => $indicator->indicatorRef
                    ];
                })
            ],

            [
                "filter" => "age",
                "type"   => "text",
            ],

            [
                "filter" => "gender",
                "type"   => "multiSelect",
                "options" => [
                    [ "value" => "male",   "label" => "Male" ],
                    [ "value" => "female", "label" => "Female" ],
                ]
            ],

            [
                "filter" => "dateOfRegistration",
                "type"   => "text",
            ],

            [
                "filter" => "code",
                "type"   => "text",
            ],
        ];

        return response()->json([
            "status"  => true,
            "message" => "",
            "data"    => $finalData
        ], 200);
    }

    public function getCdFiltersList()
    {
        $projects   = Project::select("id", "projectCode")->get();
        $provinces  = Province::select("id", "name")->get();
        $indicators = Indicator::select("id", "indicatorRef")->get();

        $finalData = [

            [
                "filter" => "projectCode",
                "type"   => "multiSelect",
                "options" => $projects->map(function ($project) {
                    return [
                        "value" => $project->id,
                        "label" => $project->projectCode
                    ];
                })
            ],

            [
                "filter" => "focalPoint",
                "type"   => "text",
            ],

            [
                "filter" => "province",
                "type"   => "multiSelect",
                "options" => $provinces->map(function ($province) {
                    return [
                        "value" => $province->id,
                        "label" => $province->name
                    ];
                })
            ],

            [
                "filter" => "indicator",
                "type"   => "multiSelect",
                "options" => $indicators->map(function ($indicator) {
                    return [
                        "value" => $indicator->id,
                        "label" => $indicator->indicatorRef
                    ];
                })
            ],
        ];

        return response()->json([
            "status"  => true,
            "message" => "",
            "data"    => $finalData
        ], 200);
    }

    public function getTrainingBnfFiltersList()
    {
        $projects   = Project::select("id", "projectCode")->get();
        $indicators = Indicator::select("id", "indicatorRef")->get();
        $provinces  = Province::select("id", "name")->get();

        $finalData = [

            [
                "filter" => "projectCode",
                "type"   => "multiSelect",
                "options" => $projects->map(function ($project) {
                    return [
                        "value" => $project->id,
                        "label" => $project->projectCode
                    ];
                })
            ],

            [
                "filter" => "indicator",
                "type"   => "multiSelect",
                "options" => $indicators->map(function ($indicator) {
                    return [
                        "value" => $indicator->id,
                        "label" => $indicator->indicatorRef
                    ];
                })
            ],

            [
                "filter" => "province",
                "type"   => "multiSelect",
                "options" => $provinces->map(function ($province) {
                    return [
                        "value" => $province->id,
                        "label" => $province->name
                    ];
                })
            ],

            [
                "filter" => "age",
                "type"   => "text",
            ],

            [
                "filter" => "gender",
                "type"   => "multiSelect",
                "options" => [
                    [ "value" => "male",   "label" => "Male" ],
                    [ "value" => "female", "label" => "Female" ],
                ]
            ],

            [
                "filter" => "code",
                "type"   => "text",
            ],
        ];

        return response()->json([
            "status"  => true,
            "message" => "",
            "data"    => $finalData
        ], 200);
    }

    public function getTrainingFiltersList()
    {
        $projects   = Project::select("id", "projectCode")->get();
        $indicators = Indicator::select("id", "indicatorRef")->get();
        $provinces  = Province::select("id", "name")->get();

        $finalData = [

            [
                "filter" => "projectCode",
                "type"   => "multiSelect",
                "options" => $projects->map(function ($project) {
                    return [
                        "value" => $project->id,
                        "label" => $project->projectCode
                    ];
                })
            ],

            [
                "filter" => "indicatorRef",
                "type"   => "multiSelect",
                "options" => $indicators->map(function ($indicator) {
                    return [
                        "value" => $indicator->id,
                        "label" => $indicator->indicatorRef
                    ];
                })
            ],

            [
                "filter" => "province",
                "type"   => "multiSelect",
                "options" => $provinces->map(function ($province) {
                    return [
                        "value" => $province->id,
                        "label" => $province->name
                    ];
                })
            ],
        ];

        return response()->json([
            "status"  => true,
            "message" => "",
            "data"    => $finalData
        ], 200);
    }

    public function getRefferalFiltersList()
    {
        $projects  = Project::select("id", "projectCode")->get();
        $provinces = Province::select("id", "name")->get();

        $finalData = [

            [
                "filter" => "projectCode",
                "type"   => "multiSelect",
                "options" => $projects->map(function ($project) {
                    return [
                        "value" => $project->id,
                        "label" => $project->projectCode
                    ];
                })
            ],

            [
                "filter" => "province",
                "type"   => "multiSelect",
                "options" => $provinces->map(function ($province) {
                    return [
                        "value" => $province->id,
                        "label" => $province->name
                    ];
                })
            ],

            [
                "filter" => "age",
                "type"   => "text",
            ],

            [
                "filter" => "gender",
                "type"   => "multiSelect",
                "options" => [
                    [ "value" => "male",   "label" => "Male" ],
                    [ "value" => "female", "label" => "Female" ],
                ]
            ],

            [
                "filter" => "dateOfRegistration",
                "type"   => "text",
            ],

            [
                "filter" => "code",
                "type"   => "text",
            ],
        ];

        return response()->json([
            "status"  => true,
            "message" => "",
            "data"    => $finalData
        ], 200);
    }

    public function getEnactFiltersList()
    {
        $projects   = Project::select("id", "projectCode")->get();
        $provinces  = Province::select("id", "name")->get();
        $indicators = Indicator::select("id", "indicatorRef")->get();

        $finalData = [

            [
                "filter" => "projectCode",
                "type"   => "multiSelect",
                "options" => $projects->map(function ($project) {
                    return [
                        "value" => $project->id,
                        "label" => $project->projectCode
                    ];
                })
            ],

            [
                "filter" => "province",
                "type"   => "multiSelect",
                "options" => $provinces->map(function ($province) {
                    return [
                        "value" => $province->id,
                        "label" => $province->name
                    ];
                })
            ],

            [
                "filter" => "indicator",
                "type"   => "multiSelect",
                "options" => $indicators->map(function ($indicator) {
                    return [
                        "value" => $indicator->id,
                        "label" => $indicator->indicatorRef
                    ];
                })
            ],

            [
                "filter" => "date",
                "type"   => "text",
            ],
        ];

        return response()->json([
            "status"  => true,
            "message" => "",
            "data"    => $finalData
        ], 200);
    }

    public function getUsersFiltersList()
    {
        $finalData = [

            [
                "filter" => "name",
                "type"   => "text",
            ],

            [
                "filter" => "email",
                "type"   => "text",
            ],

            [
                "filter" => "title",
                "type"   => "text",
            ],

            [
                "filter" => "status",
                "type"   => "multiSelect",
                "options" => [
                    [ "value" => "active",   "label" => "Active" ],
                    [ "value" => "inactive", "label" => "Inactive" ],
                ]
            ],
            [
                "filter" => "create_at",
                "type"   => "text",
            ],
        ];

        return response()->json([
            "status"  => true,
            "message" => "",
            "data"    => $finalData
        ], 200);
    }

    public function getRolesFiltersList()
    {
        $finalData = [

            [
                "filter" => "name",
                "type"   => "text",
            ],

            [
                "filter" => "status",
                "type"   => "multiSelect",
                "options" => [
                    [ "value" => "active",   "label" => "Active" ],
                    [ "value" => "inactive", "label" => "Inactive" ],
                ]
            ],
        ];

        return response()->json([
            "status"  => true,
            "message" => "",
            "data"    => $finalData
        ], 200);
    }

    public function getPermissionsFiltersList() 
    {
        $finalData = [

            [
                "filter" => "group_name",
                "type"   => "text",
            ],
        ];

        return response()->json([
            "status"  => true,
            "message" => "",
            "data"    => $finalData
        ], 200);
    }

    public function getKitListFiltersList()
    {
        $registeredKits = Kit::select('id', 'name')
            ->where('status', 'active')
            ->get();

        $finalData = [

            [
                "filter"  => "kit",
                "type"    => "multiSelect",
                "options" => $registeredKits->map(fn ($kit) => [
                    'label' => $kit->name,
                    'value' => $kit->id
                ])->values()
            ],

            [
                "filter" => "destribution_date",
                "type"   => "text"
            ],

            // [
            //     "filter"  => "is_received",
            //     "type"    => "multiSelect",
            //     "options" => [
            //         [
            //             "label" => "Yes",
            //             "value" => true
            //         ],
            //         [
            //             "label" => "No",
            //             "value" => false
            //         ]
            //     ]
            // ]

        ];

        return response()->json([
            'status'  => true,
            'message' => "",
            "data"    => $finalData
        ], 200);
    }
    
}