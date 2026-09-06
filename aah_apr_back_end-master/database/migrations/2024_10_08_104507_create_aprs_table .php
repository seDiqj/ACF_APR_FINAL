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
        Schema::create('aprs', function (Blueprint $table) {
            $table->id();
            $table->foreignId("project_id")->constrained("projects")->cascadeOnDelete();
            $table->foreignId("database_id")->constrained("databases")->cascadeOnDelete();
            $table->foreignId("province_id")->constrained("provinces");
            $table->foreignId("manager_id")->constrained("users");
            $table->enum("status", ["submitted", "resubmitted", "firstApproved", "firstRejected", "aprGenerated", "secondRejected", "reviewed", "thirdRejected", "secondApproved", "fourthRejected"]);
            $table->date("fromDate");
            $table->date("toDate");
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aprs');
    }
};
