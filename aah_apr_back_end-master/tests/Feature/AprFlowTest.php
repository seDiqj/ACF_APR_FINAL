<?php

namespace Tests\Feature;

use App\Http\Controllers\AprGeneratorController;
use App\Models\Beneficiary;
use App\Models\Dessaggregation;
use App\Models\Indicator;
use App\Models\IndicatorSession;
use App\Models\Outcome;
use App\Models\Output;
use App\Models\Program;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AprFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_main_database_beneficiary_is_counted_in_apr(): void
    {
        $mainDb = \App\Models\Database::where('name', 'main_database')->firstOrFail();
        $province = \App\Models\Province::where('name', 'kabul')->firstOrFail();

        $project = Project::create([
            'projectCode' => 'PRJ-TEST-1',
            'projectTitle' => 'Test Project',
            'projectGoal' => 'Goal',
            'projectDonor' => 'Donor',
            'startDate' => '2025-01-01',
            'endDate' => '2025-06-30',
            'status' => 'ongoing',
            'aprStatus' => 'created',
            'projectManager' => 'Mosa',
            'reportingDate' => '2025-07-01',
            'reportingPeriod' => 'Q2',
            'description' => 'Test',
        ]);

        $program = Program::create([
            'database_id' => $mainDb->id,
            'name' => 'Program A',
            'project_id' => $project->id,
            'province_id' => $province->id,
            'district_id' => \App\Models\District::first()->id,
            'village' => 'V1',
            'focalPoint' => 'FP1',
            'siteCode' => 'SC1',
            'healthFacilityName' => 'HF1',
            'interventionModality' => 'MHPSS',
        ]);

        $outcome = Outcome::create(['outcome' => 'Outcome 1', 'outcomeRef' => 'O1', 'project_id' => $project->id]);
        $output = Output::create(['output' => 'Output 1', 'outputRef' => 'OP1', 'outcome_id' => $outcome->id]);

        $indicator = Indicator::create([
            'output_id' => $output->id,
            'database_id' => $mainDb->id,
            'indicator' => 'Beneficiaries reached',
            'indicatorRef' => 'IND-1',
            'target' => 10,
            'achived_target' => 0,
            'status' => 'inProgress',
            'dessaggregationType' => 'indevidual',
            'description' => 'Test indicator',
        ]);

        Dessaggregation::create([
            'indicator_id' => $indicator->id,
            'province_id' => $province->id,
            'description' => '# Of Male (above 18)',
            'target' => 10,
            'achived_target' => 0,
        ]);

        // Included beneficiary: male, 30yo, registered inside range, linked to program + indicator.
        $included = Beneficiary::create([
            'dateOfRegistration' => '2025-02-10',
            'code' => 'BNF-001',
            'name' => 'Ali',
            'fatherHusbandName' => 'Ahmad',
            'age' => '30',
            'gender' => 'male',
            'maritalStatus' => 'married',
            'phone' => '0700000000',
            'aprIncluded' => true,
        ]);
        $included->programs()->attach($program->id, ['database_id' => $mainDb->id]);
        $included->indicators()->attach($indicator->id);

        // Excluded beneficiary (aprIncluded=false) - must NOT be counted.
        $excluded = Beneficiary::create([
            'dateOfRegistration' => '2025-02-11',
            'code' => 'BNF-002',
            'name' => 'Karim',
            'fatherHusbandName' => 'Safi',
            'age' => '40',
            'gender' => 'male',
            'maritalStatus' => 'married',
            'phone' => '0700000001',
            'aprIncluded' => false,
        ]);
        $excluded->programs()->attach($program->id, ['database_id' => $mainDb->id]);
        $excluded->indicators()->attach($indicator->id);

        // Beneficiary outside date range - must NOT be counted.
        $late = Beneficiary::create([
            'dateOfRegistration' => '2025-09-01',
            'code' => 'BNF-003',
            'name' => 'Hamid',
            'fatherHusbandName' => 'Zia',
            'age' => '25',
            'gender' => 'male',
            'maritalStatus' => 'single',
            'phone' => '0700000002',
            'aprIncluded' => true,
        ]);
        $late->programs()->attach($program->id, ['database_id' => $mainDb->id]);
        $late->indicators()->attach($indicator->id);

        $generator = new AprGeneratorController();
        $generator->generate($project->id, $mainDb->id, $province->id, '2025-01-01', '2025-06-30');

        $indicator->refresh();
        $this->assertSame(1, $indicator->achived_target, 'Only the included, in-range beneficiary should be counted');

        $des = Dessaggregation::where('indicator_id', $indicator->id)
            ->where('province_id', $province->id)
            ->where('description', '# Of Male (above 18)')
            ->firstOrFail();
        $this->assertSame(1, $des->achived_target);
        $this->assertSame(1, array_sum($des->months), 'The male-above-18 monthly buckets should sum to 1');
    }

    public function test_cu5_gender_is_derived_from_child_bnf_code(): void
    {
        $mainDb = \App\Models\Database::where('name', 'main_database')->firstOrFail();
        $province = \App\Models\Province::where('name', 'kabul')->firstOrFail();

        $project = Project::create([
            'projectCode' => 'PRJ-CU5',
            'projectTitle' => 'CU5 Project',
            'projectGoal' => 'Goal',
            'projectDonor' => 'Donor',
            'startDate' => '2025-01-01',
            'endDate' => '2025-03-31',
            'status' => 'ongoing',
            'aprStatus' => 'created',
            'projectManager' => 'Mosa',
            'reportingDate' => '2025-04-01',
            'reportingPeriod' => 'Q1',
            'description' => 'Test',
        ]);

        $program = Program::create([
            'database_id' => $mainDb->id,
            'name' => 'Program CU5',
            'project_id' => $project->id,
            'province_id' => $province->id,
            'district_id' => \App\Models\District::first()->id,
            'village' => 'V',
            'focalPoint' => 'FP',
            'siteCode' => 'SC',
            'healthFacilityName' => 'HF',
            'interventionModality' => 'MHPSS',
        ]);

        $outcome = Outcome::create(['outcome' => 'O', 'outcomeRef' => 'OC', 'project_id' => $project->id]);
        $output = Output::create(['output' => 'OP', 'outputRef' => 'OPC', 'outcome_id' => $outcome->id]);
        $indicator = Indicator::create([
            'output_id' => $output->id,
            'database_id' => $mainDb->id,
            'indicator' => 'CU5 reach',
            'indicatorRef' => 'IND-CU5',
            'target' => 10,
            'achived_target' => 0,
            'status' => 'inProgress',
            'dessaggregationType' => 'indevidual',
            'description' => 'Test',
        ]);

        Dessaggregation::create(['indicator_id' => $indicator->id, 'province_id' => $province->id, 'description' => '# of Male CU5 (boys)', 'target' => 10]);
        Dessaggregation::create(['indicator_id' => $indicator->id, 'province_id' => $province->id, 'description' => '# of Female CU5 (girls)', 'target' => 10]);

        $maleCu5 = Beneficiary::create([
            'dateOfRegistration' => '2025-01-10', 'code' => 'BNF-C5-1', 'name' => 'M', 'fatherHusbandName' => 'F',
            'age' => '30', 'gender' => 'female', 'childCode' => 'B003', 'phone' => '0700000000', 'aprIncluded' => true,
        ]);
        $maleCu5->programs()->attach($program->id, ['database_id' => $mainDb->id]);
        $maleCu5->indicators()->attach($indicator->id);

        $femaleCu5 = Beneficiary::create([
            'dateOfRegistration' => '2025-01-11', 'code' => 'BNF-C5-2', 'name' => 'F', 'fatherHusbandName' => 'G',
            'age' => '28', 'gender' => 'female', 'childCode' => 'G005', 'phone' => '0700000001', 'aprIncluded' => true,
        ]);
        $femaleCu5->programs()->attach($program->id, ['database_id' => $mainDb->id]);
        $femaleCu5->indicators()->attach($indicator->id);

        $noChild = Beneficiary::create([
            'dateOfRegistration' => '2025-01-12', 'code' => 'BNF-C5-3', 'name' => 'A', 'fatherHusbandName' => 'B',
            'age' => '35', 'gender' => 'male', 'phone' => '0700000002', 'aprIncluded' => true,
        ]);
        $noChild->programs()->attach($program->id, ['database_id' => $mainDb->id]);
        $noChild->indicators()->attach($indicator->id);

        $generator = new AprGeneratorController();
        $generator->generate($project->id, $mainDb->id, $province->id, '2025-01-01', '2025-03-31');

        $male = Dessaggregation::where('description', '# of Male CU5 (boys)')->firstOrFail();
        $female = Dessaggregation::where('description', '# of Female CU5 (girls)')->firstOrFail();

        $this->assertSame(1, $male->achived_target, 'B-prefixed child code must count as Male CU5');
        $this->assertSame(1, $female->achived_target, 'G-prefixed child code must count as Female CU5');
    }

    public function test_session_type_indicator_counts_sessions(): void
    {
        $mainDb = \App\Models\Database::where('name', 'main_database')->firstOrFail();
        $province = \App\Models\Province::where('name', 'kabul')->firstOrFail();

        $project = Project::create([
            'projectCode' => 'PRJ-TEST-2',
            'projectTitle' => 'Session Project',
            'projectGoal' => 'Goal',
            'projectDonor' => 'Donor',
            'startDate' => '2025-01-01',
            'endDate' => '2025-03-31',
            'status' => 'ongoing',
            'aprStatus' => 'created',
            'projectManager' => 'Mosa',
            'reportingDate' => '2025-04-01',
            'reportingPeriod' => 'Q1',
            'description' => 'Test',
        ]);

        $program = Program::create([
            'database_id' => $mainDb->id,
            'name' => 'Program S',
            'project_id' => $project->id,
            'province_id' => $province->id,
            'district_id' => \App\Models\District::first()->id,
            'village' => 'V2',
            'focalPoint' => 'FP2',
            'siteCode' => 'SC2',
            'healthFacilityName' => 'HF2',
            'interventionModality' => 'MHPSS',
        ]);

        $outcome = Outcome::create(['outcome' => 'Outcome S', 'outcomeRef' => 'OS', 'project_id' => $project->id]);
        $output = Output::create(['output' => 'Output S', 'outputRef' => 'OPS', 'outcome_id' => $outcome->id]);

        $indicator = Indicator::create([
            'output_id' => $output->id,
            'database_id' => $mainDb->id,
            'indicator' => 'MHPSS consultations',
            'indicatorRef' => 'IND-S',
            'target' => 5,
            'achived_target' => 0,
            'status' => 'inProgress',
            'dessaggregationType' => 'session',
            'description' => 'Test indicator',
        ]);

        $beneficiary = Beneficiary::create([
            'dateOfRegistration' => '2025-01-15',
            'code' => 'BNF-S1',
            'name' => 'Laila',
            'fatherHusbandName' => 'Sara',
            'age' => '28',
            'gender' => 'female',
            'maritalStatus' => 'married',
            'phone' => '0700000100',
            'aprIncluded' => true,
        ]);
        $beneficiary->programs()->attach($program->id, ['database_id' => $mainDb->id]);
        $beneficiary->indicators()->attach($indicator->id);

        IndicatorSession::create(['indicator_id' => $indicator->id, 'beneficiary_id' => $beneficiary->id, 'session' => 's1', 'date' => '2025-01-20']);
        IndicatorSession::create(['indicator_id' => $indicator->id, 'beneficiary_id' => $beneficiary->id, 'session' => 's2', 'date' => '2025-02-05']);

        $generator = new AprGeneratorController();
        $generator->generate($project->id, $mainDb->id, $province->id, '2025-01-01', '2025-03-31');

        $indicator->refresh();
        $this->assertSame(2, $indicator->achived_target, 'Session-type indicator should count 2 sessions');
    }
}