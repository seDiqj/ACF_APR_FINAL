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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string("projectCode");
            $table->text("projectTitle");
            $table->text("projectGoal");
            $table->string("projectDonor");
            $table->date("startDate");
            $table->date("endDate");
            $table->enum("status", ["planed", "ongoing", "completed", "onhold", "canclled"]);
            $table->enum("aprStatus", [
                    "notCreatedYet",
                    "created",
                    "hodDhodApproved",
                    "hodDhodRejected",
                    "grantFinalized",
                    "grantRejected",
                    "hqFinalized",
                    "hqRejected"
                ]);
            $table->string("projectManager");
            $table->string("reportingDate");
            $table->text("reportingPeriod");
            $table->longText("description");
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
