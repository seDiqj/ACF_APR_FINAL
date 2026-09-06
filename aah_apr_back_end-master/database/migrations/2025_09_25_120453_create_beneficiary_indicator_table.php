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
        Schema::create('beneficiary_indicator', function (Blueprint $table) {
            $table->id();
            $table->foreignId("beneficiary_id")->constrained("beneficiaries")->onDelete("cascade");
            $table->foreignId("indicator_id")->constrained("indicators")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beneficiary_indicator');
    }
};
