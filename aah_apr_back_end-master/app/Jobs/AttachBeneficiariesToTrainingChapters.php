<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Training;
use App\Models\User;
use App\Events\MessageSent;


class AttachBeneficiariesToTrainingChapters implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Job configuration
     */
    public int $tries = 3;
    public int $timeout = 120;

    private Training $training;
    private int $triggeredByUserId;

    /**
     * Create a new job instance.
     */
    public function __construct(
        Training $training,
        int $triggeredByUserId
    )
    {
        $this->training = $training;
        $this->triggeredByUserId = $triggeredByUserId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        
        $beneficiaries = $this->training->beneficiaries;

        $chapterIds = $this->training->chapters()->pluck("id")->toArray();

        foreach ($beneficiaries as $beneficiary) {

            $beneficiary->chapters()->syncWithoutDetaching($chapterIds);
        }

        $user = User::find($this->triggeredByUserId);

        if ($user) {

            event(new MessageSent($user->id, 
        
                "Chapters successfully attached to beneficiaries ."
        
            ));
        }

    }
}
