<?php

namespace App\Jobs;

use App\Models\CommunityDialogueSession;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Events\MessageSent;

class AttachBeneficiariesToSession implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Job configuration
     */
    public int $tries = 3;
    public int $timeout = 120;

    protected int $sessionId;
    protected array $beneficiaryIds;
    protected int $triggeredByUserId;

    public function __construct(
        int $sessionId,
        array $beneficiaryIds,
        int $triggeredByUserId,
    ) {
        $this->sessionId = $sessionId;
        $this->beneficiaryIds = $beneficiaryIds;
        $this->triggeredByUserId = $triggeredByUserId;
    }

    public function handle(): void
    {
        $session = CommunityDialogueSession::find($this->sessionId);

        if (! $session) {
            return;
        }

        collect($this->beneficiaryIds)
            ->unique()
            ->chunk(500)
            ->each(function ($chunk) use ($session) {
                $session->beneficiaries()
                    ->syncWithoutDetaching($chunk->toArray());
            });

        // Notify the user who triggered the job.
        $user = User::find($this->triggeredByUserId);

        if ($user) {

            event(new MessageSent($user->id, 
        
                "Session Preparation Completed, Beneficiaries have been attached to the session ."
        
            ));
        }
    }
}
