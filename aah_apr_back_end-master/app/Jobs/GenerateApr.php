<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Http\Controllers\AprGeneratorController;
use App\Models\User;
use App\Events\MessageSent;
use App\Models\Project;

class GenerateApr implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Job configuration
     */
    public int $tries = 3;
    public int $timeout = 120;

    private $projectId;
    private $databaseId;
    private $provinceId;
    private $fromDate;
    private $toDate;
    private $triggeredByUserId;

    /**
     * Create a new job instance.
     */
    public function __construct(
        int $projectId,
        int $databaseId,
        int $provinceId,
        string $fromDate,
        string $toDate,
        int $triggeredByUserId
    )
    {
        $this->projectId = $projectId;
        $this->databaseId = $databaseId;
        $this->provinceId = $provinceId;
        $this->fromDate = $fromDate;
        $this->toDate = $toDate;
        $this->triggeredByUserId = $triggeredByUserId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        
        $instance = new AprGeneratorController();

        $instance->generate(
            $this->projectId,
            $this->databaseId,
            $this->provinceId,
            $this->fromDate,
            $this->toDate
        );

        $user = User::find($this->triggeredByUserId);

        $projectCode = Project::find($this->projectId)->projectCode;

        if ($user) {

            event(new MessageSent($user->id, 
        
                "The Apr witch belongs to project with code " . $projectCode . " successfully generated !!!"
        
            ));
        }

    }
}
