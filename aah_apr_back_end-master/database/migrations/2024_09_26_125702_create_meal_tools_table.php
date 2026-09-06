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
        Schema::create('meal_tools', function (Blueprint $table) {
            $table->id();
            $table->foreignId("beneficiary_id")->constrained("beneficiaries")->onDelete("cascade");
            $table->string("type");
            $table->date("baselineDate");
            $table->date("endlineDate");
            $table->char("baselineTotalScore");
            $table->char("endlineTotalScore");
            $table->char("improvementPercentage");
            $table->enum("baseline", ["low", "moderate", "high", "evaluationNotPossible", "n/a"]);
            $table->enum("endline", ["low", "moderate", "high", "evaluationNotPossible", "n/a"]);
            $table->boolean("isBaselineActive");
            $table->boolean("isEndlineActive");
            $table->string("evaluation");
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meal_tools');
    }
};
