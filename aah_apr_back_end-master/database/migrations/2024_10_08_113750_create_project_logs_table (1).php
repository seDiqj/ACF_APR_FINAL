<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('project_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId("project_id")->constrained("projects")->cascadeOnDelete();
            $table->foreignId("user_id")->constrained("users");
            $table->enum('action', [
                'reset',           // when status is "notCreatedYet"
                'create',          // created
                'submit',          // hodDhodApproved
                'rejectSubmit',    // hodDhodRejected
                'grantFinalize',   // grantFinalized
                'rejectGrant',     // grantRejected
                'hqFinalize',      // hqFinalized
                'rejectHq',        // hqRejected
            ])->default('create');

            $table->enum("result", ["approved", "rejected"])->nullable();
            $table->text("comment")->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_logs');
    }
};
