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
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId("beneficiary_id")->constrained("beneficiaries")->onDelete("cascade");
            $table->date("date");
            $table->json("clientSessionEvaluation");
            $table->string("otherClientSessionEvaluation", 100);
            $table->enum("clientSatisfaction", ["veryGood", "good", "neutral", "bad", "veryBad"]);
            $table->date("satisfactionDate");
            $table->json("dischargeReason");
            $table->string("otherDischargeReasone", 100);
            $table->date("dischargeReasonDate");
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
