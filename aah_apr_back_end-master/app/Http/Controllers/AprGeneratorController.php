<?php

namespace App\Http\Controllers;

use App\Helpers\LogHelpers;
use App\Models\Beneficiary;
use App\Models\Database;
use App\Models\Dessaggregation;
use App\Models\Enact;
use App\Models\Indicator;
use App\Models\Project;
use App\Models\Province;
use App\Models\Psychoeducations;
use App\Models\Training;
use App\Traits\AprToolsTrait;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class AprGeneratorController extends Controller
{
    use AprToolsTrait;

    /**
     * Main method to generate every single database apr.
     *
     * @param string $projectId
     * @param string $databaseId
     * @param string $provinceId
     * @param string $fromDate
     * @param string $toDate
     * @return void
     */
    public function generate(string $projectId, string $databaseId, string $provinceId, string $fromDate, string $toDate)
    {

        $project = Project::with("outcomes.outputs.indicators.dessaggregations")->find($projectId);
        if (!$project) return response()->json(["status" => false, "message" => "No such project in system!"], 404);

        $database = Database::find($databaseId);
        if (!$database) return response()->json(["status" => false, "message" => "No such database in system!"], 404);

        $province = Province::find($provinceId);
        if (!$province) return response()->json(["status" => false, "message" => "No such province in system!"], 404);

        // parse dates (keeps original behaviour if strings empty)
        $from = $fromDate ? Carbon::parse($fromDate) : null;
        $to = $toDate ? Carbon::parse($toDate) : null;

        $projectPrograms = $project->programs()->pluck("id")->toArray();

        $projectIndicators = $this->projectIndicatorsToASpicificDatabase($project, $databaseId);

        $updatedIndicators = collect();

        if ($database->name == "cd_database") 
        {

            $beneficiaries = Beneficiary::whereHas('programs', function ($query) use ($projectPrograms, $databaseId, $provinceId) {
                $query->whereIn('programs.id', $projectPrograms)
                      ->where('database_program_beneficiary.database_id', $databaseId)
                      ->where("province_id", $provinceId);
            })
            ->where("dateOfRegistration", ">=", $from)
            ->where("dateOfRegistration", "<=", $to)
            ->where("aprIncluded", true)
            ->with(['indicators', 'programs'])
            ->get();
        
            foreach ($projectIndicators as $indicator) {
        
                $achieved = 0;
                $subIndicator = Indicator::where('parent_indicator', $indicator->id)->first();
        
                if ($indicator->dessaggregationType === 'indevidual') {
        
                    $achieved = $beneficiaries->filter(fn($b) => $b->indicators->contains('id', $indicator->id))->count();

                    $this->updateDessaggregationsFromBeneficiaries($indicator, $beneficiaries, $provinceId, $project->startDate, $project->endDate);

                    // Do not remove these codes.
                    // if ($subIndicator) {
                    //     $subAchieved = $beneficiaries->reduce(function ($total, $b) use ($indicator) {
                    //         if ($b->indicators->contains('id', $indicator->id)) {
                    //             $total += $b->communityDialogueSessions->count();

                    //             $groupDessaggregation = Dessaggregation::where("indicator_id", $indicator->id)
                    //                                                         ->where("description", "# 0f group MHPSS consultations")->first();

                    //             if ($groupDessaggregation) {

                    //                 $groupSessoins = $b->communityDialogueSessions->count();

                    //                 $beforeTarget = $groupDessaggregation->achived_target;

                    //                 $newTarget = $beforeTarget + $groupSessoins;;

                    //                 $groupDessaggregation->achived_target = $newTarget;

                    //                 $groupDessaggregation->save();

                    //             }
                    //         }
                    //         return $total;
                    //     }, 0);
        
                    //     $subIndicator->achived_target = $subAchieved;
                    //     $subIndicator->save();
                    //     $updatedIndicators->push($subIndicator);
                    // }
        
                }
                
                
                elseif ($indicator->dessaggregationType === 'session') {
                    $achieved = $beneficiaries->reduce(function ($total, $b) use ($indicator) {
                        if ($b->indicators->contains('id', $indicator->id)) {
                            $total += $b->communityDialogueSessions->count();

                            $groupDessaggregation = Dessaggregation::where("indicator_id", $indicator->id)
                                                                            ->where("description", "# 0f group MHPSS consultations")->first();

                            if ($groupDessaggregation) {

                                $groupSessoins = $b->communityDialogueSessions->count();

                                $beforeTarget = $groupDessaggregation->achived_target;

                                $newTarget = $beforeTarget + $groupSessoins;;

                                $groupDessaggregation->achived_target = $newTarget;

                                $groupDessaggregation->save();

                            }
                        }
                        return $total;
                    }, 0);
        
                    // if ($subIndicator) {
                    //     $beneficiaryCount = $beneficiaries->filter(fn($b) => $b->indicators->contains('id', $indicator->id))->count();
                    //     $subIndicator->achived_target = $beneficiaryCount;
                    //     $subIndicator->save();
                    //     $this->updateDessaggregationsFromBeneficiaries($indicator, $beneficiaries, $provinceId);
                    //     $updatedIndicators->push($subIndicator);
                    // }
                }
        
                $indicator->achived_target = $achieved;
                $indicator->save();
        
                $updatedIndicators->push($indicator);
            }
        
        }
        
        elseif ($database->name == "main_database_meal_tool") {

            $beneficiaries = Beneficiary::whereHas('programs', function ($query) use ($projectPrograms, $databaseId, $provinceId) {
                $query->whereIn('programs.id', $projectPrograms)
                    ->where('database_program_beneficiary.database_id', $databaseId)
                    ->where('province_id', $provinceId);
            })
            ->whereHas('mealTools')
            ->where("dateOfRegistration", ">=", $from)
            ->where("dateOfRegistration", "<=", $to)
            ->where("aprIncluded", true)
            ->get();

        
            foreach ($projectIndicators as $indicator) {
                $achieved = $beneficiaries->count();
        
                $indicator->achived_target = $achieved;
                $indicator->save();

                $this->updateDessaggregationsFromBeneficiaries($indicator, $beneficiaries, $provinceId, $from, $to);

                $updatedIndicators->push($indicator);
            }
        }
        
        elseif ($database->name == "psychoeducation_database") {

            $psychoeducations = Psychoeducations::whereHas("program", function ($q) use ($provinceId, $projectPrograms) { 
                $q->whereIn("program_id", $projectPrograms)->where("province_id", $provinceId);
            })
            ->where("awarenessDate", ">=", $from)
            ->where("awarenessDate", "<=", $to)
            ->get();

            foreach ($projectIndicators as $indicator) {
                $achieved = $psychoeducations->where('indicator_id', $indicator->id)->count();
                $indicator->achived_target = $achieved;
                $indicator->save();
                $updatedIndicators->push($indicator);

                $this->updateDessaggregationsFromPsycho($indicator, $psychoeducations->where("indicator_id", $indicator->id), $provinceId, $project->startDate, $project->endDate);
            }

        }
        
        elseif ($database->name == "training_database") {

            $trainings = Training::where('project_id', $projectId)
                ->where('province_id', $provinceId)
                ->with('beneficiaries', function ($q) use ($from, $to) {
                    $q
                    ->where("dateOfRegistration", ">=", $from)
                    ->where("dateOfRegistration", "<=", $to)
                    ->where("aprIncluded", true);
                })
                ->get();
        
            foreach ($projectIndicators as $indicator) {
                $achieved = $trainings->reduce(function ($carry, $training) use ($indicator) {
                    if ($training->indicator_id == $indicator->id) {
                        return $carry + $training->beneficiaries->count();
                    }
                    return $carry;
                }, 0);
        
                $indicator->achived_target = $achieved;
                $indicator->save();
                $updatedIndicators->push($indicator);

                // NEW: dessaggregation update using trainings collection
                $this->updateDessaggregationsFromTrainings($indicator, $trainings, $provinceId, $project->startDate, $project->endDate);
            }
        }

        elseif ($database->name == "refferal_database") {

            $beneficiaries = 
            Beneficiary::whereHas("referral", function ($q) use ($projectId, $provinceId) {
                $q->whereHas("indicator", function ($q2) use ($projectId, $provinceId) {
                    $q2->whereHas("output", function ($q3) use ($projectId) {

                        $q3->whereHas("outcome", function ($q4) use ($projectId) {
                            $q4->whereHas("project", function ($q5) use ($projectId) {
                                $q5->where("id", $projectId);
                            });
                        });

                    });

                    $q2->whereHas("provinces", function ($q3) use ($provinceId) {

                        $q3->where("province_id", $provinceId);
                        
                    });
                });
            })
            ->where("dateOfRegistration", ">=", $from)
            ->where("dateOfRegistration", "<=", $to)
            ->where("aprIncluded", true)
            ->with(["referral"])
            ->get();;


            foreach ($projectIndicators as $indicator) {

                $achieved = $beneficiaries->reduce(function ($carry, $beneficiary) use ($indicator) {
                    if ($beneficiary->referral->indicator_id == $indicator->id) {
                        return $carry + 1;
                    }
                    return $carry;
                }, 0);

                $indicator->achived_target = $achieved;
                $indicator->save();
                $updatedIndicators->push($indicator);

                $this->updateDessaggregationsFromBeneficiaries($indicator, $beneficiaries, $provinceId, $project->startDate, $project->endDate);

            }

        }

        elseif  ($database->name == "enact_database") {


            $enacts = Enact::where('project_id', $projectId)
                ->where('province_id', $provinceId)
                ->where("date", ">=", $from)
                ->where("date", "<=", $to)
                ->with('assessments')
                ->get();

            // ✅ NEW: timeline dynamic based on APR date range
            $numberOfAssessmentsPerMonth = $this->buildMonthlyTimeline($project->startDate, $project->endDate);
            $scoresPerMonth = $this->buildMonthlyTimeline($project->startDate, $project->endDate);
            
            foreach ($projectIndicators as $indicator) {
                
                $achieved = 0;

                $enacts->map(function ($enact) use (
                    $indicator,
                    &$numberOfAssessmentsPerMonth,
                    &$scoresPerMonth,
                    &$achieved,
                    $project
                ) {
                    $achieved += $enact->assessments->reduce(function ($carry, $assessment) use (
                        $indicator,
                        &$numberOfAssessmentsPerMonth,
                        &$scoresPerMonth,
                        $project
                    ) {
                        if ($assessment->enact->indicator_id == $indicator->id && $assessment->enact->aprIncluded) {

                            $monthIndex = $this->getMonthIndex($project->startDate, Carbon::parse($assessment->date));
                            if ($monthIndex === null) return $carry;

                            $numberOfAssessmentsPerMonth[$monthIndex]++;
                            $scoresPerMonth[$monthIndex] += $assessment->totalScore;

                            return $carry + 1;
                        }
                        return $carry;
                    }, 0);
                });

        
                $indicator->achived_target = $achieved;
                $indicator->save();
                $updatedIndicators->push($indicator);
                
                $dessaggregations = $indicator->dessaggregations()
                ->where('province_id', $provinceId)
                ->get();

                if ($dessaggregations->isEmpty()) continue;

                $dessaggregations->map(function ($dessaggregation) use (&$numberOfAssessmentsPerMonth, &$scoresPerMonth) {

                    $dessaggregationFromDb = Dessaggregation::where("id", $dessaggregation["id"])->first();

                    if (!$dessaggregationFromDb) return;

                    switch ($dessaggregation->description) {
                        case '# of supervised psychosocial counsellors':

                            $dessaggregationFromDb->months = $numberOfAssessmentsPerMonth;
                            $dessaggregationFromDb->achived_target = (collect(...$numberOfAssessmentsPerMonth))->reduce(function ($carry, $item) {
                                return $carry + $item;
                            }, 0); 
                            $dessaggregationFromDb->save();

                            break;
                        
                        case '# Accumulated score EQUIP (ENACT) Tool':

                            $dessaggregationFromDb->months = $scoresPerMonth;
                            $dessaggregationFromDb->achived_target = collect(...$scoresPerMonth)->reduce(function ($carry, $item) {
                                return $carry + $item;
                            });
                            $dessaggregationFromDb->save();

                            break;
                    }
                });
                
            }

        }
        
        // Handle's Main databas & Kit database.
        else {

            $beneficiaries = false;

            if ($database->name == "main_database") {
                $beneficiaries = Beneficiary::whereHas('programs', function ($query) use ($projectPrograms, $databaseId, $provinceId) {
                    $query->whereIn('programs.id', $projectPrograms)
                        ->where('database_program_beneficiary.database_id', $databaseId)
                        ->where("province_id", $provinceId);
                })
                ->where("dateOfRegistration", ">=", $from)
                ->where("dateOfRegistration", "<=", $to)
                ->where("aprIncluded", true)
                ->with(['indicators.sessions', 'programs'])
                ->get();
            }else {
                
                // kit_database

                $beneficiaries = Beneficiary::whereHas('programs', function ($query) use ($projectPrograms, $databaseId, $provinceId) {
                    $query->whereIn('programs.id', $projectPrograms)
                        ->where('database_program_beneficiary.database_id', $databaseId)
                        ->where("province_id", $provinceId);
                })
                // ->whereHas('kits', function ($q) {
                //     $q->wherePivot('is_received', true);
                // })
                ->where("dateOfRegistration", ">=", $from)
                ->where("dateOfRegistration", "<=", $to)
                ->where("aprIncluded", true)
                ->with(['indicators.sessions', 'programs', 'kits'])
                ->get();
            }

            $beneficiaries->transform(function ($beneficiary) {
                $beneficiary->indicators->transform(function ($indicator) use ($beneficiary) {
                    $indicator->setRelation(
                        'sessions',
                        $indicator->sessions->where('beneficiary_id', $beneficiary->id)->values()
                    );
                    return $indicator;
                });
                return $beneficiary;
            });


            foreach ($projectIndicators as $indicator) {
                $achieved = 0;

                if ($indicator->dessaggregationType === 'indevidual') {

                    $achieved = $beneficiaries
                        ->filter(fn($b) => $b->indicators->contains('id', $indicator->id) && $b->aprIncluded)
                        ->count();

                    error_log($achieved);

                    $this->updateDessaggregationsFromBeneficiaries($indicator, $beneficiaries, $provinceId, $project->startDate, $project->endDate);
                
                    $subIndicator = Indicator::where('parent_indicator', $indicator->id)->first();
                
                    if ($subIndicator instanceof Indicator) {
                
                        $subAchieved = $beneficiaries->reduce(function ($total, $b) use ($indicator) {
                            $ind = $b->indicators->firstWhere('id', $indicator->id);
                
                            if ($ind) {
                                $total += $ind->sessions->count();
                            }
                
                            return $total;
                        }, 0);

                        $this->updateDessaggregationsFromBeneficiaries($subIndicator, $beneficiaries, $provinceId, $project->startDate, $project->endDate);

                        $subIndicator->update(['achived_target' => $subAchieved]);
                    }

                }


                elseif ($indicator->dessaggregationType === 'session') {

                    $subIndicator = Indicator::where('parent_indicator', $indicator->id)->first();

                    $achieved = $beneficiaries->reduce(function ($total, $b) use ($indicator, $beneficiaries, $provinceId) {
                        $ind = $b->indicators->firstWhere('id', $indicator->id);
                        if ($ind) {

                            $total += $ind->sessions->count();

                            // $groupDessaggregation = Dessaggregation::where("indicator_id", $indicator->id)
                            //                                                 ->where("description", "# 0f group MHPSS consultations")->first();
                            // $individualDessaggregation = Dessaggregation::where("indicator_id", $indicator->id)->where("description", "# 0f indevidual MHPSS consultations")->first();

                            
                        };
                        return $total;
                    }, 0);
                    
                    $this->updateDessaggregationsFromBeneficiaries($indicator, $beneficiaries, $provinceId, $project->startDate, $project->endDate);
                    
                    if ($subIndicator) {
                        $beneficiaryCount = $beneficiaries->filter(fn($b) => $b->indicators->contains('id', $indicator->id))->count();
                        $subIndicator->update(['achived_target' => $beneficiaryCount]);
                        $subIndicator->save();
                        
                        $this->updateDessaggregationsFromBeneficiaries($subIndicator, $beneficiaries, $provinceId, $project->startDate, $project->endDate);

                        $updatedIndicators->push($subIndicator);
                    }
                }

                $indicator->achived_target = $achieved;
                $indicator->save();
                $updatedIndicators->push($indicator);
            }
        }

    }

    /**
     * Main method to show a spicific database apr.
     *
     * @param string $projectId
     * @param string $databaseId
     * @param string $provinceId
     * @param string $fromDate
     * @param string $toDate
     * @return void
     */
    public function showSpicificDatabaseApr(string $projectId, string $databaseId, string $provinceId, string $fromDate, string $toDate)
    {
        $project = Project::with("outcomes.outputs.indicators.dessaggregations")->find($projectId);
        if (!$project) return response()->json(["status" => false, "message" => "No such project in system!"], 404);

        $database = Database::find($databaseId);
        if (!$database) return response()->json(["status" => false, "message" => "No such database in system!"], 404);

        $province = Province::find($provinceId);
        if (!$province) return response()->json(["status" => false, "message" => "No such province in system!"], 404);

        $projectIndicators = $this->projectIndicatorsToASpicificDatabase($project, "*");

        $projectIndicatorsWithDessaggregations = $this->projectIndicatorsWithDessaggregations($project, $databaseId);
        

        $isp3s = $projectIndicatorsWithDessaggregations->flatMap(function ($indicator) {
            return $indicator->isp3()->with("indicators")->get();
        });

        $isp3s = $isp3s->map(function ($isp3) use ($project) {
            return [
                "isp3" => $isp3->description,
                "indicators" => $isp3->indicators->map(function ($indicator) use ($project) {
                    return [
                        "indicatorRef" => $indicator->indicatorRef,
                        "indicator" => $indicator->indicator,
                        "disaggregation" => $indicator->dessaggregations->map(function ($d) use ($project) {
                            return [
                                "name" => $d->description,
                                "target" => $d->target ?? 0,
                                "months" => $d->months ?? $this->buildMonthlyTimeline($project->startDate, $project->endDate)
                            ];
                        })->toArray(),
                    ];
                })->toArray(),
            ];
        });

        $finalAPR = [
            "impact" => $project->projectGoal,
            "projectCode" => $project->projectCode,
            "projectManager" => $project->projectManager,
            "projectStartDate" => $project->startDate->format('Y-m-d'),
            "projectEndDate" => $project->endDate->format('Y-m-d'),
            "outcomes" => $project->outcomes->map(function ($outcome) use ($projectIndicators, $project) {
                $filteredOutputs = $outcome->outputs->filter(function ($output) use ($projectIndicators, $project) {
                    $hasIndicator = $projectIndicators->where('output_id', $output->id)->isNotEmpty();
                    return $hasIndicator;
                });

                if ($filteredOutputs->isEmpty()) {
                    return null;
                }

                return [
                    "name" => $outcome->outcome,
                    "outputs" => $filteredOutputs->map(function ($output) use ($projectIndicators, $project) {
                        $filteredIndicators = $projectIndicators->where('output_id', $output->id);

                        return [
                            "name" => $output->output,
                            "indicators" => $filteredIndicators->map(function ($indicator) use ($project) {
                                return [
                                    "code" => $indicator->indicatorRef,
                                    "name" => $indicator->indicator,
                                    "isSub" => false,
                                    "disaggregation" => $indicator->dessaggregations->map(function ($d) use ($project) {
                                        return [
                                            "name" => $d->description,
                                            "target" => $d->target ?? 0,
                                            "months" => $d->months ?? $this->buildMonthlyTimeline($project->startDate, $project->endDate)
                                        ];
                                    })->toArray(),
                                ];
                            })->values()->toArray(),
                        ];
                    })->values()->toArray(),
                ];
            })->filter()->values()->toArray(),
            "isp3s" => $isp3s,
            "start_date" => $project->startDate
        ];

        return response()->json([
            "status" => true,
            "data" => $finalAPR
        ]);
    }

    /**
     * Update dessaggregation targets based on beneficiaries collection.
     * This covers demographic dessaggregations and session/group splits.
     * 
     * @helperMethod
     */
    private function updateDessaggregationsFromBeneficiaries(Indicator $indicator, Collection $beneficiaries, Int $provinceId, mixed $from, mixed $to)
    {

        $dess = $indicator->dessaggregations()->where('province_id', $provinceId)->get();

        if ($dess->isEmpty()) return;

        $groupTotal = 0;
        $individualTotal = 0;

        $demographics = [
            "# Of Male (above 18)" => 0,
            "# Of Female (above 18)" => 0,
            "# of Male adolescents (12 to 17 years old)" => 0,
            "# of Female adolescents (12 to 17 years old)" => 0,
            "# of Male children (6 to 11 years old)" => 0,
            "# of Female children (6 to 11 years old)" => 0,
            "# of Male CU5 (boys)" => 0,
            "# of Female CU5 (girls)" => 0,
        ];

        $demographicMonthDate = [];
        foreach ($demographics as $key => $val) {
            $demographicMonthDate[$key] = $this->buildMonthlyTimeline($from, $to);
        }

        $groupMonthDate = $this->buildMonthlyTimeline($from, $to);
        $individualMonthDate = $this->buildMonthlyTimeline($from, $to);

        foreach ($beneficiaries as $b) {
            if ($indicator->database->name != "refferal_database" && $indicator->database->name != "main_database_meal_tool" && (!$b->indicators->contains('id', $indicator->id))) continue;
            else if ($indicator->database->name == "refferal_database" && $b->referral->indicator_id != $indicator->id) continue;

            $ind = $indicator;

            $sessions = $ind->parent_indicator ? $b->sessions->where("indicator_id", $ind->parent_indicator) : $b->sessions->where("indicator_id", $ind->id);

            $groupTotal += $sessions->whereNotNull('group')->count();
            $individualTotal += $sessions->whereNull('group')->count();

            foreach ($sessions as $s) {
                if (!$s->date) continue;
                $monthIndex = $this->getMonthIndex($from, Carbon::parse($s->date));
                if ($monthIndex === null) continue;


                if ($s->group !== null) {

                    $groupMonthDate[$monthIndex]++;

                } 
                else {

                    $individualMonthDate[$monthIndex]++;

                }
            }

            $age = (int) $b->age;
            $gender = strtolower($b->gender ?? '');
            try {
                $dateOfRegistration = $b->dateOfRegistration ? Carbon::parse($b->dateOfRegistration) : null;
                $monthIndex = $dateOfRegistration ? $this->getMonthIndex($from, $dateOfRegistration) : null;
            } catch (\Exception $e) {
                $monthIndex = null;
            }

            if (str_starts_with(strtoupper(trim((string) ($b->childCode ?? ''))), 'B')) {
                $demographics["# of Male CU5 (boys)"]++;
                if ($monthIndex !== null) $demographicMonthDate["# of Male CU5 (boys)"][$monthIndex]++;
            } elseif (str_starts_with(strtoupper(trim((string) ($b->childCode ?? ''))), 'G')) {
                $demographics["# of Female CU5 (girls)"]++;
                if ($monthIndex !== null) $demographicMonthDate["# of Female CU5 (girls)"][$monthIndex]++;
            } elseif ($gender === 'male' && $age >= 18) {
                $demographics["# Of Male (above 18)"]++;
                if ($monthIndex !== null) $demographicMonthDate["# Of Male (above 18)"][$monthIndex]++;
            } elseif ($gender === 'female' && $age >= 18) {
                $demographics["# Of Female (above 18)"]++;
                if ($monthIndex !== null) $demographicMonthDate["# Of Female (above 18)"][$monthIndex]++;
            } elseif ($gender === 'male' && $age >= 12 && $age <= 17) {
                $demographics["# of Male adolescents (12 to 17 years old)"]++;
                if ($monthIndex !== null) $demographicMonthDate["# of Male adolescents (12 to 17 years old)"][$monthIndex]++;
            } elseif ($gender === 'female' && $age >= 12 && $age <= 17) {
                $demographics["# of Female adolescents (12 to 17 years old)"]++;
                if ($monthIndex !== null) $demographicMonthDate["# of Female adolescents (12 to 17 years old)"][$monthIndex]++;
            } elseif ($gender === 'male' && $age >= 6 && $age <= 11) {
                $demographics["# of Male children (6 to 11 years old)"]++;
                if ($monthIndex !== null) $demographicMonthDate["# of Male children (6 to 11 years old)"][$monthIndex]++;
            } elseif ($gender === 'female' && $age >= 6 && $age <= 11) {
                $demographics["# of Female children (6 to 11 years old)"]++;
                if ($monthIndex !== null) $demographicMonthDate["# of Female children (6 to 11 years old)"][$monthIndex]++;
            }
        }


        foreach ($dess as $d) {
            $desc = trim($d->description);

            if (stripos($desc, 'group') !== false) {
                $d->achived_target = $groupTotal;
                $d->months = $groupMonthDate;
            } elseif (stripos($desc, 'indevidual') !== false || stripos($desc, 'individual') !== false) {
                $d->achived_target = $individualTotal;
                $d->months = $individualMonthDate;
            } elseif (array_key_exists($desc, $demographics)) {
                $d->achived_target = $demographics[$desc];
                $d->months = $demographicMonthDate[$desc];
            } else {
                $d->achived_target = $d->achived_target ?? 0;
                $d->months = $d->months ?? $this->buildMonthlyTimeline($from, $to);
            }

            $d->save();
        }
    }

    /**
     * Update dessaggregation targets from psychoeducations collection.
     * For simple case: count psychoeducations per dessaggregation description if possible,
     * otherwise set dess->achived_target to total psycho count for indicator.
     * 
     * @helperMethod
     */
    private function updateDessaggregationsFromPsycho(Indicator $indicator, $psychoeducations, $provinceId, $from, $to)
    {

        $dess = $indicator->dessaggregations()->where('province_id', $provinceId)->get();        

        if ($dess->isEmpty()) return;

        $demographics = [
            "# Of Male (above 18)" => 0,
            "# Of Female (above 18)" => 0,
            "# of Male adolescents (12 to 17 years old)" => 0,
            "# of Female adolescents (12 to 17 years old)" => 0,
        ];

        $demographicMonthDate = [];

        foreach ($demographics as $key => $val) {
            $demographicMonthDate[$key] = $this->buildMonthlyTimeline($from, $to);
        }


        foreach ($psychoeducations as $psychoeducation) {

            $monthIndex = $this->getMonthIndex($from, Carbon::parse($psychoeducation->awarenessDate));


            $numberOfMenAbove18 = 
                ((int) ($psychoeducation->ofMenHostCommunity ?? 0)) +
                ((int) ($psychoeducation->ofMenIdp ?? 0)) +
                ((int) ($psychoeducation->ofMenRefugee ?? 0)) +
                ((int) ($psychoeducation->ofMenReturnee ?? 0));

            $numberOfWomenAbove18 = 
                ((int) ($psychoeducation->ofWomenHostCommunity ?? 0)) +
                ((int) ($psychoeducation->ofWomenIdp ?? 0)) +
                ((int) ($psychoeducation->ofWomenRefugee ?? 0)) +
                ((int) ($psychoeducation->ofWomenReturnee ?? 0));

            $numberOfMenUnder18 = 
                ((int) ($psychoeducation->ofBoyHostCommunity ?? 0)) +
                ((int) ($psychoeducation->ofBoyIdp ?? 0)) +
                ((int) ($psychoeducation->ofBoyRefugee ?? 0)) +
                ((int) ($psychoeducation->ofBoyReturnee ?? 0));

            $numberOfWomenUnder18 = 
                ((int) ($psychoeducation->ofGirlHostCommunity ?? 0)) +
                ((int) ($psychoeducation->ofGirlIdp ?? 0)) +
                ((int) ($psychoeducation->ofGirlRefugee ?? 0)) +
                ((int) ($psychoeducation->ofGirlReturnee ?? 0));



            $demographicMonthDate["# Of Male (above 18)"][$monthIndex] += $numberOfMenAbove18;
            $demographicMonthDate["# Of Female (above 18)"][$monthIndex] += $numberOfWomenAbove18;
            $demographicMonthDate["# of Male adolescents (12 to 17 years old)"][$monthIndex] += $numberOfMenUnder18;
            $demographicMonthDate["# of Female adolescents (12 to 17 years old)"][$monthIndex] += $numberOfWomenUnder18;

            $demographics["# Of Male (above 18)"] += $numberOfMenAbove18;
            $demographics["# Of Female (above 18)"] += $numberOfWomenAbove18;
            $demographics["# of Male adolescents (12 to 17 years old)"] += $numberOfMenUnder18;
            $demographics["# of Female adolescents (12 to 17 years old)"] += $numberOfWomenUnder18;
        }            

        foreach ($demographics as $desc => $value) {
            $targetDess = $dess->firstWhere('description', $desc);
            if ($targetDess) {
                $targetDess->achived_target = $value;
                $targetDess->months = $demographicMonthDate[$desc];
                $targetDess->save();
            }
        }
    }

    /**
     * Update dessaggregation targets using trainings collection.
     * We count beneficiaries inside trainings for the indicator.
     * 
     * @helperMethod
     */
    private function updateDessaggregationsFromTrainings(Indicator $indicator, $trainings, $provinceId, $from, $to)
    {
        $dess = $indicator->dessaggregations()
            ->where('province_id', $provinceId)
            ->get();

        if ($dess->isEmpty()) return;

        $demographicTargets = [
            "# Of Male (above 18)" => 0,
            "# Of Female (above 18)" => 0,
            "# of Male adolescents (12 to 17 years old)" => 0,
            "# of Female adolescents (12 to 17 years old)" => 0,
            "# of Male children (6 to 11 years old)" => 0,
            "# of Female children (6 to 11 years old)" => 0,
            "# of Male CU5 (boys)" => 0,
            "# of Female CU5 (girls)" => 0,
        ];

        $demographicMonthDate = [];
        foreach ($demographicTargets as $key => $val) {
            $demographicMonthDate[$key] = $this->buildMonthlyTimeline($from, $to);
        }

        foreach ($trainings as $training) {
            if ($training->indicator_id != $indicator->id) continue;

            foreach ($training->beneficiaries as $b) {

                try {
                    $dateOfRegistration = $b->dateOfRegistration ? Carbon::parse($b->dateOfRegistration) : null;
                    $monthIndex = $dateOfRegistration ? $this->getMonthIndex($from, Carbon::parse($dateOfRegistration)) : null;
                } catch (\Exception $e) {
                    $monthIndex = null;
                }


                if (str_starts_with(strtoupper(trim((string) ($b->childCode ?? ''))), 'B'))
                {
                    $demographicTargets["# of Male CU5 (boys)"]++;
                    if ($monthIndex !== null) $demographicMonthDate["# of Male CU5 (boys)"][$monthIndex]++;
                }

                else if (str_starts_with(strtoupper(trim((string) ($b->childCode ?? ''))), 'G'))
                {
                    $demographicTargets["# of Female CU5 (girls)"]++;
                    if ($monthIndex !== null) $demographicMonthDate["# of Female CU5 (girls)"][$monthIndex]++;
                }

                else if ($b->gender == "male" && $b->age >= 18) 
                {
                    $demographicTargets["# Of Male (above 18)"]++;
                    if ($monthIndex !== null) $demographicMonthDate["# Of Male (above 18)"][$monthIndex]++;
                }

                else if ($b->gender == "female" && $b->age >= 18)
                {
                    $demographicTargets["# Of Female (above 18)"]++;
                    if ($monthIndex !== null) $demographicMonthDate["# Of Female (above 18)"][$monthIndex]++;
                }

                else if ($b->gender == "male" && ($b->age >= 12 && $b->age <= 17))
                {
                    $demographicTargets["# of Male adolescents (12 to 17 years old)"]++;
                    if ($monthIndex !== null) $demographicMonthDate["# of Male adolescents (12 to 17 years old)"][$monthIndex]++;
                }

                else if ($b->gender == "female" && ($b->age >= 12 && $b->age <= 17))
                {
                    $demographicTargets["# of Female adolescents (12 to 17 years old)"]++;
                    if ($monthIndex !== null) $demographicMonthDate["# of Female adolescents (12 to 17 years old)"][$monthIndex]++;
                }

                else if ($b->gender == "male" && ($b->age >= 6 && $b->age <= 11))
                {
                    $demographicTargets["# of Male children (6 to 11 years old)"]++;
                    if ($monthIndex !== null) $demographicMonthDate["# of Male children (6 to 11 years old)"][$monthIndex]++;
                }

                else if ($b->gender == "female" && ($b->age >= 6 && $b->age <= 11))
                {
                    $demographicTargets["# of Female children (6 to 11 years old)"]++;
                    if ($monthIndex !== null) $demographicMonthDate["# of Female children (6 to 11 years old)"][$monthIndex]++;
                }

            }
        }

        foreach ($demographicTargets as $desc => $value) {
            $targetDess = $dess->firstWhere('description', $desc);
            if ($targetDess) {
                $targetDess->achived_target = $value;
                $targetDess->months = $demographicMonthDate[$desc];
                $targetDess->save();
            }
        }
    }

    /**
     * Build a linear month timeline between two dates.
     * Example: Dec-2024 → Sep-2025  => 10 months
     */
    protected function buildMonthlyTimeline(Carbon $from, Carbon $to): array
    {
        $monthsCount = $from->diffInMonths($to) + 1;

        return array_fill(0, $monthsCount, 0);
    }

    /**
     * Calculate month index relative to APR start date.
     * Example: from=Dec-2024, date=Feb-2025 => index=2
     */
    protected function getMonthIndex(Carbon $from, Carbon $date): ?int
    {
        if ($date->lt($from)) return null;

        return $from->diffInMonths($date);
    }

}


// https://github.com/seDiqj/aah_apr_front_end.git
