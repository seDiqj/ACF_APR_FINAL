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
        Schema::create('apr_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId("apr_id")->constrained("aprs")->cascadeOnDelete();
            $table->foreignId("user_id")->constrained("users");
            $table->enum("action", ["submitted", "resubmitted", "firstApproved", "firstRejected", "aprGenerated", "secondRejected", "reviewed", "thirdRejected", "secondApproved", "fourthRejected"]);
            $table->longText("comment")->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apr_logs');
    }
};
