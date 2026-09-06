<?php

namespace Tests\Feature;

use App\Models\Dessaggregation;
use App\Models\Indicator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EndToEndAprWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private string $token = "";

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $login = $this->postJson('/api/authentication/login', [
            'email' => 'developer@developer.com',
            'password' => 'test-password-123',
        ]);
        $login->assertStatus(200);
        $this->token = $login->json('access_token');
        $this->assertNotEmpty($this->token);
    }

    private function api()
    {
        return $this->withToken($this->token);
    }

    private function assertCreatedOrOk($response): void
    {
        $this->assertContains($response->getStatusCode(), [200, 201], 'Expected 200 or 201, got ' . $response->getStatusCode() . ' body: ' . $response->getContent());
    }

    public function test_full_beneficiary_to_apr_workflow_counts_beneficiary(): void
    {
        // 1. Create project
        $projectRes = $this->api()->postJson('/api/projects', [
            'projectCode' => 'E2E-PRJ-001',
            'projectTitle' => 'E2E Test Project',
            'projectGoal' => 'Improve mental health of communities',
            'projectDonor' => 'E2E Donor',
            'startDate' => '2025-01-01',
            'endDate' => '2025-12-31',
            'status' => 'ongoing',
            'projectManager' => 'Mosa Baregzay',
            'reportingDate' => '2026-01-15',
            'reportingPeriod' => 'Q4',
            'description' => 'E2E full workflow test',
        ]);
        $this->assertCreatedOrOk($projectRes);
        $projectId = $projectRes->json('data.project.id');
        $this->assertNotNull($projectId, 'Project must be created');

        // 2. Create outcome
        $outcomeRes = $this->api()->postJson('/api/projects/o/outcome', [
            'project_id' => $projectId,
            'outcome' => 'Improved psychosocial wellbeing',
            'outcomeRef' => 'E2E-O-1',
        ]);
        $this->assertCreatedOrOk($outcomeRes);
        $outcomeId = $outcomeRes->json('data.id');
        $this->assertNotNull($outcomeId);

        // 3. Create output
        $outputRes = $this->api()->postJson('/api/projects/o/output', [
            'outcomeId' => $outcomeId,
            'output' => 'MHPSS consultations delivered',
            'outputRef' => 'E2E-OP-1',
        ]);
        $this->assertCreatedOrOk($outputRes);
        $outputId = $outputRes->json('data.id');
        $this->assertNotNull($outputId);

        // 4. Create indicator (main_database, individual type) with per-province target
        $indicatorRes = $this->api()->postJson('/api/projects/i/indicator', [
            'indicator' => [
                'outputId' => $outputId,
                'database' => 'main_database',
                'indicator' => 'E2E Beneficiaries reached',
                'indicatorRef' => 'E2E-IND-1',
                'target' => 100,
                'status' => 'inProgress',
                'dessaggregationType' => 'indevidual',
                'description' => 'E2E individual reach indicator',
                'provinces' => [
                    ['province' => 'kabul', 'target' => 100, 'councilorCount' => 4],
                ],
            ],
        ]);
        $this->assertCreatedOrOk($indicatorRes);
        $indicatorId = $indicatorRes->json('data.0.id');
        $this->assertNotNull($indicatorId, 'Indicator must be created');

        // 5. Create disaggregation for the indicator
        $disRes = $this->api()->postJson('/api/projects/d/disaggregation', [
            'dessaggregations' => [
                [
                    'indicatorId' => $indicatorId,
                    'dessaggration' => '# Of Male (above 18)',
                    'province' => 'kabul',
                    'target' => 100,
                ],
            ],
        ]);
        $this->assertCreatedOrOk($disRes);

        // 6. Create program (main_database)
        $district = \App\Models\District::first();
        $programRes = $this->api()->postJson('/api/global/program/main_database', [
            'project_id' => $projectId,
            'name' => 'E2E Program Alpha',
            'focalPoint' => 'FP-ALPHA',
            'province' => 'kabul',
            'district' => $district->name,
            'village' => 'Village Alpha',
            'siteCode' => 'SC-ALPHA',
            'healthFacilityName' => 'HF Alpha',
            'interventionModality' => 'MHPSS',
        ]);
        $this->assertCreatedOrOk($programRes);
        $programId = $programRes->json('data.id');
        $this->assertNotNull($programId, 'Program must be created');

        // 7. Create beneficiary (main database)
        $beneficiaryRes = $this->api()->postJson('/api/main_db/beneficiary', [
            'program' => $programId,
            'dateOfRegistration' => '2025-03-15',
            'code' => 'E2E-BNF-001',
            'name' => 'E2E Beneficiary Male',
            'fatherHusbandName' => 'Father Name',
            'age' => 30,
            'gender' => 'male',
            'maritalStatus' => 'married',
            'phone' => '0700123456',
        ]);
        $this->assertCreatedOrOk($beneficiaryRes);
        $beneficiaryId = \App\Models\Beneficiary::where('code', 'E2E-BNF-001')->first()->id;

        // 8. Attach a session to the beneficiary under the indicator (links bnf -> indicator)
        $sessionRes = $this->api()->postJson("/api/main_db/sessions/{$beneficiaryId}", [
            'indicators' => [
                [
                    'id' => $indicatorId,
                    'indicatorRef' => 'E2E-IND-1',
                    'sessions' => [
                        ['id' => null, 'group' => null, 'session' => '1', 'date' => '2025-03-20', 'topic' => 'First consultation'],
                    ],
                ],
            ],
        ]);
        $this->assertCreatedOrOk($sessionRes);

        // Verify APR include state
        $bnf = \App\Models\Beneficiary::find($beneficiaryId);
        $this->assertTrue((bool) $bnf->aprIncluded, 'Beneficiary must be APR-included by default');

        // 9. Submit the database (creates an APR record)
        $mainDb = \App\Models\Database::where('name', 'main_database')->firstOrFail();
        $province = \App\Models\Province::where('name', 'kabul')->firstOrFail();
        $submitRes = $this->api()->postJson('/api/db_management/submit_new_database', [
            'project_id' => $projectId,
            'database_id' => $mainDb->id,
            'province_id' => $province->id,
            'manager_id' => 1,
            'fromDate' => '2025-01-01',
            'toDate' => '2025-12-31',
        ]);
        $this->assertCreatedOrOk($submitRes);
        $apr = \App\Models\Apr::where('project_id', $projectId)->where('database_id', $mainDb->id)->firstOrFail();
        $this->assertSame('submitted', $apr->status);

        // 10. Approve (first approval)
        $approveRes = $this->api()->postJson("/api/db_management/change_db_status/{$apr->id}", [
            'newStatus' => 'firstApproved',
        ]);
        $this->assertCreatedOrOk($approveRes);
        $apr->refresh();
        $this->assertSame('firstApproved', $apr->status);

        // 11. Generate APR (dispatches GenerateApr job -> runs synchronously on sync queue)
        $genRes = $this->api()->postJson("/api/apr_management/generate_apr/{$apr->id}");
        $this->assertCreatedOrOk($genRes);
        $apr->refresh();
        $this->assertSame('aprGenerated', $apr->status);

        // 12. Verify the indicator/disaggregation was actually calculated
        $des = Dessaggregation::where('description', '# Of Male (above 18)')
            ->where('indicator_id', $indicatorId)
            ->first();
        $this->assertNotNull($des, 'Disaggregation must exist');
        $this->assertSame(1, $des->achived_target, 'Male-above-18 achieved target must count exactly 1 beneficiary');
        $this->assertSame(1, array_sum($des->months), 'Monthly buckets must sum to 1');

        $ind = Indicator::find($indicatorId);
        $this->assertSame(1, $ind->achived_target, 'Indicator achieved target must count exactly 1 beneficiary');

        // 13. Fetch the APR preview payload (the exact JSON used by UI + Excel)
        $showRes = $this->api()->getJson("/api/apr_management/show_apr/{$apr->id}");
        $this->assertCreatedOrOk($showRes);
        $data = $showRes->json('data');
        $this->assertNotEmpty($data['outcomes'], 'APR preview must contain outcomes');

        $foundIndicator = null;
        foreach ($data['outcomes'] as $outcome) {
            foreach ($outcome['outputs'] ?? [] as $output) {
                foreach ($output['indicators'] ?? [] as $ind) {
                    if (($ind['code'] ?? '') === 'E2E-IND-1') {
                        $foundIndicator = $ind;
                    }
                }
            }
        }
        $this->assertNotNull($foundIndicator, 'APR preview must contain the E2E indicator');

        $maleDis = collect($foundIndicator['disaggregation'])->firstWhere('name', '# Of Male (above 18)');
        $this->assertNotNull($maleDis, 'APR preview must contain the male-above-18 disaggregation');
        $this->assertSame(1, array_sum($maleDis['months']), 'APR preview months must count the beneficiary');

        // 14. Generate the Excel export from the exact same payload and verify the count
        $excelTotal = $this->excelTotalAchievement($data);
        $this->assertSame(1, $excelTotal, 'Excel total achievement must equal the beneficiary count');
    }

    private function excelTotalAchievement(array $payload): int
    {
        $tmpDir = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR);
        $payloadPath = $tmpDir . DIRECTORY_SEPARATOR . 'apr_payload_' . uniqid() . '.json';
        $outPath = $tmpDir . DIRECTORY_SEPARATOR . 'apr_out_' . uniqid() . '.xlsx';

        file_put_contents($payloadPath, json_encode($payload));
        $driver = 'C:\Users\scs\AppData\Local\Temp\opencode\apr_excel_driver.py';

        $output = [];
        $code = 0;
        exec(escapeshellarg('python') . ' ' . escapeshellarg($driver) . ' ' . escapeshellarg($payloadPath) . ' ' . escapeshellarg($outPath) . ' 2>&1', $output, $code);

        $result = 0;
        foreach ($output as $line) {
            if (preg_match('/^TOTAL_ACHIEVEMENT=(\d+)$/', trim($line), $m)) {
                $result = (int) $m[1];
            }
        }

        @unlink($payloadPath);
        @unlink($outPath);

        $this->assertSame(0, $code, 'Python Excel driver must run successfully: ' . implode(' | ', $output));

        return $result;
    }
}