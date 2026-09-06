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
        Schema::create('beneficiaries', function (Blueprint $table) {
            $table->id();
            $table->date("dateOfRegistration")->nullable();
            $table->string("code")->unique();
            $table->string("name");
            $table->string("fatherHusbandName");
            $table->char("age");
            $table->enum("gender", ["male", "female", "other"]);
            $table->enum("maritalStatus", ["single", "married", "divorced", "widowed", "widower", "sperated"])->nullable();
            $table->string("childCode")->nullable();
            $table->char("childAge")->nullable();
            $table->string("phone");
            $table->string("nationalId", 20)->nullable();
            $table->string("householdStatus")->nullable();
            $table->string("literacyLevel", 100)->nullable();
            $table->string("jobTitle", 255)->nullable();
            $table->string("disabilityType")->nullable();
            $table->json("protectionServices")->nullable();
            $table->boolean("incentiveReceived")->nullable();
            $table->string("incentiveAmount")->nullable();
            $table->string("participantOrganization")->nullable();
            $table->string("email")->nullable();
            $table->boolean("refferedForKit")->nullable()->default(false);
            $table->boolean("aprIncluded");
            $table->string("currancy")->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beneficiaries');
    }
};
