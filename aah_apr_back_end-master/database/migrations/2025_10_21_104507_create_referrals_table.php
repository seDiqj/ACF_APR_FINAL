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
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId("beneficiary_id")->constrained("beneficiaries")->onDelete("cascade");
            $table->foreignId("indicator_id")->constrained("indicators")->onDelete("cascade");
            $table->boolean("referralConcern")->default(false);
            $table->tinyText("referralConcernNote")->nullable()->nullable();
            $table->boolean("concentGiven")->default(false);
            $table->boolean("needReferral")->default(false);
            $table->string("problemReportedBy", 50)->nullable();
            $table->string("caseNumber")->nullable();
            $table->enum("type", ["internal", "external"])->nullable();
            $table->string("referrerName", 64)->nullable();
            $table->string("referrerAgency", 100)->nullable();
            $table->string("referrerPosition", 100)->nullable();
            $table->string("referrerPhone", 32)->nullable();
            $table->string("referrerEmail", 100)->nullable();
            $table->string("referrerAddress", 100)->nullable();
            $table->string("referredToName", 64)->nullable();
            $table->string("referredToAgency", 100)->nullable();
            $table->string("referredToPosition", 100)->nullable();
            $table->string("referredToPhone", 32)->nullable();
            $table->string("referredToEmail", 100)->nullable();
            $table->string("referredToAddress", 100)->nullable();
            $table->date("dateOfReferral")->nullable();
            $table->tinyText("nationalId")->nullable();
            $table->tinyText("currentAddress")->nullable();
            $table->json("spokenLanguage")->nullable();
            $table->tinyText("referralReason")->nullable();
            $table->json("mentalHealthAlert")->nullable();
            $table->tinyText("mentalHealthDesk")->nullable();
            $table->json("serviceRequested")->nullable();
            $table->tinyText("expectedOutcome")->nullable();
            $table->boolean("referralAccepted")->default(false);
            $table->text("referralRejectedReasone")->nullable();
            $table->boolean('consentProvided')
                ->nullable();
            $table->text('consentReason')
                ->nullable();
            $table->text('otherServiceText')
                ->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
