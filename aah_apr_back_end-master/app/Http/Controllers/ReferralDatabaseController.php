<?php

namespace App\Http\Controllers;

use App\Models\Beneficiary;
use App\Models\Referral;
use App\Models\Indicator;
use App\Models\Database;
use Illuminate\Http\Request;

class ReferralDatabaseController extends Controller
{
    public function index (Request $request)
    {
        $query = Beneficiary::query()->whereHas("referral")->with("programs");

        if ($request->filled('age')) {
            $ages = explode(",", $request->input("age"));
            $query->where(function ($q) use ($ages) {
                foreach ($ages as $age) {
                    $q->orWhere("age", "like", "%" . $age . "%");
                }
            });
        }

        if ($request->filled("gender")) {
            $genders = $request->input('gender');
            $query->whereIn('gender', $genders);
        }
            

        if ($request->filled('dateOfRegistration')) {
            $dates = explode(",", $request->input("dateOfRegistration"));
            $query->whereIn('dateOfRegistration', $dates);
        }

        if ($request->filled("projectCode"))
            $query->whereHas("programs", function ($q) use ($request) {
                $q->whereHas('project', function($q2) use ($request) {
                    $q2->whereIn('id', (array) $request->input('projectCode'));
                });
            });

        if ($request->filled("province"))
            $query->whereHas("programs", function ($q) use ($request) {
                $q->whereHas("province", function ($q2) use ($request) {
                    $q2->whereIn("id", (array) $request->input("province"));
                });
            });

        if ($search = $request->input("search")) {
            $searchItems = array_map('trim', explode(",", $search));

            $query->where(function($q) use ($searchItems) {
                foreach ($searchItems as $item) {
                    $q->orWhere('name', 'like', "%{$item}%")
                    ->orWhere('fatherHusbandName', 'like', "%{$item}%")
                    ->orWhere('code', 'like', "%{$item}%");
                }
            });
        }

        if ($request->filled('code')) {
            $codes = explode(",", $request->input("code"));
            $query->whereIn('code', $codes);
        }

        $perPage = $request->integer("perPage", 10);
        $order = $request->str("order", "desc");

        $beneficiaries = $query->orderBy("created_at", $order)->paginate($perPage);

        if ($beneficiaries->isEmpty()) return response()->json(["status" => false, "message" => "No beneficiary was found !", "data" => []], 200);

        $beneficiaries->getCollection()->transform(function ($bnf) {
            $bnf->programName = optional($bnf->programs->first())->name;
            unset($bnf->programs);
            return $bnf;
        });

        return response()->json(["status" => true, "message" => "", "data" => $beneficiaries]);
    }

    public function indexRefferalDatabaseIndicators ()
    {
        
        $refferalDatabase = Database::where("name", "refferal_database")->first();

        if (!$refferalDatabase) return response()->json(["status" => false, "message" => "Refferal database is not a valid database !", "data" => []], 404);

        $indicators = Indicator::where("database_id", $refferalDatabase->id)->get();

        if ($indicators->isEmpty())
            return response()->json(["status" => false, "message" => "There is no indicator that belongs to refferal database !", "data" => []], 404);


        $finalData = $indicators->map(function ($indicator) {
            return [
                "id" => $indicator->id,
                "indicatorRef" => $indicator->indicatorRef,
            ];
        });

        return response()->json(["status" => true, "message" => "", "data" => $finalData], 200);

    }

    public function refferBeneficiaries (Request $request)
    {

        $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer|exists:beneficiaries,id",
            "selectedIndicator" => "required|integer|exists:indicators,id"
        ]);
        
        $ids = $request->input("ids");

        $beneficiaries = Beneficiary::whereIn("id", $ids)->get();

        foreach ($beneficiaries as $beneficiary) {
            $beneficiary->referral()->updateOrCreate([
                "indicator_id" => $request->input("selectedIndicator")
            ]);
        }

        return response()->json(["status" => true, "message" => (string) count($beneficiaries) . " added to referral !"], 200);

    }

    public function show (string $id)
    {
        $beneficiary = Beneficiary::with("referral")->select("id", "name", "fatherHusbandName", "phone", "dateOfRegistration", "childAge", "childCode", "code", "disabilityType", "gender", "age", "householdStatus", "literacyLevel", "maritalStatus")->find($id);

        if (!$beneficiary) return response()->json(["status" => false, "message" => "No such beneficiary in system !"], 404);

        return response()->json(["status" => true, "message" => "", "data" => $beneficiary]);
    }

    public function update(Request $request, string $id)
    {
        $beneficiary = Beneficiary::find($id);

        if (!$beneficiary) {
            return response()->json([
                "status" => false,
                "message" => "No such beneficiary in system!"
            ], 404);
        }

        $validatedData = $request->validate([

            /*
            |--------------------------------------------------------------------------
            | Referral Questions
            |--------------------------------------------------------------------------
            */

            'referralConcern' => ['nullable', 'boolean'],

            'referralConcernNote' => [
                'nullable',
                'string',
            ],

            'needReferral' => ['nullable', 'boolean'],

            'concentGiven' => ['nullable', 'boolean'],

            /*
            |--------------------------------------------------------------------------
            | Consent Information
            |--------------------------------------------------------------------------
            */

            'consentProvided' => ['nullable', 'boolean'],

            'consentReason' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Case Information
            |--------------------------------------------------------------------------
            */

            'caseNumber' => [
                'nullable',
                'string',
                'max:255',
            ],

            'type' => [
                'nullable',
                'in:internal,external',
            ],

            'dateOfReferral' => [
                'nullable',
                'date',
            ],

            /*
            |--------------------------------------------------------------------------
            | Referred By
            |--------------------------------------------------------------------------
            */

            'referrerName' => [
                'nullable',
                'string',
                'max:64',
            ],

            'referrerAgency' => [
                'nullable',
                'string',
                'max:100',
            ],

            'referrerPhone' => [
                'nullable',
                'string',
                'max:32',
            ],

            'referrerEmail' => [
                'nullable',
                'email',
                'max:100',
            ],

            'referrerAddress' => [
                'nullable',
                'string',
                'max:100',
            ],

            /*
            |--------------------------------------------------------------------------
            | Referred To
            |--------------------------------------------------------------------------
            */

            'referredToName' => [
                'nullable',
                'string',
                'max:64',
            ],

            'referredToAgency' => [
                'nullable',
                'string',
                'max:100',
            ],

            'referredToPhone' => [
                'nullable',
                'string',
                'max:32',
            ],

            'referredToEmail' => [
                'nullable',
                'email',
                'max:100',
            ],

            'referredToAddress' => [
                'nullable',
                'string',
                'max:100',
            ],

            /*
            |--------------------------------------------------------------------------
            | Personal Information
            |--------------------------------------------------------------------------
            */

            'nationalId' => [
                'nullable',
                'string',
            ],

            'currentAddress' => [
                'nullable',
                'string',
            ],

            'spokenLanguage' => [
                'nullable',
                'array',
            ],

            'spokenLanguage.*' => [
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Mental Health Alert
            |--------------------------------------------------------------------------
            */

            'mentalHealthAlert' => [
                'nullable',
                'array',
            ],

            'mentalHealthAlert.*' => [
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Requested Services
            |--------------------------------------------------------------------------
            */

            'serviceRequested' => [
                'nullable',
                'array',
            ],

            'serviceRequested.*' => [
                'string',
            ],

            'otherServiceText' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Expected Outcome
            |--------------------------------------------------------------------------
            */

            'expectedOutcome' => [
                'nullable',
                'string',
            ],

            /*
            |--------------------------------------------------------------------------
            | Provider Decision
            |--------------------------------------------------------------------------
            */

            'referralAccepted' => [
                'nullable',
                'boolean',
            ],

            'referralRejectedReasone' => [
                'nullable',
                'string',
            ],
        ]);

        $referral = $beneficiary->referral;

        if (!$referral) {
            return response()->json([
                "status" => false,
                "message" => "Referral record not found for this beneficiary!"
            ], 404);
        }

        $referral->update($validatedData);

        return response()->json([
            "status" => true,
            "message" => "Beneficiary referral form updated successfully!",
            "data" => $referral->fresh(),
        ], 200);
    }

    public function destroy (Request $request)
    {   
        $ids = $request->input("ids");

        $request->validate([
            "ids" => "required|array",
            "ids.*" => "integer"
        ]);

        Referral::whereIn("beneficiary_id", $ids)->delete();

        return response()->json(["stataus" => false, "message" => (string) count($ids) . " Beneficiaries successfully removed from referral list !"], 200);
    }
}
