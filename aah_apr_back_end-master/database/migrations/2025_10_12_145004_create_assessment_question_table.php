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
        Schema::create('assessment_question', function (Blueprint $table) {
            $table->id();
            $table->foreignId("assessment_id")->constrained("assessments")->cascadeOnDelete();
            $table->foreignId("question_id")->constrained("questions");
            $table->float("score")->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assessment_question');
    }
};
