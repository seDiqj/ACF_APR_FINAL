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
        Schema::create('indicator_isp3', function (Blueprint $table) {
            $table->id();
            $table->foreignId("indicator_id")->constrained("indicators")->cascadeOnDelete();
            $table->foreignId("isp3_id")->constrained("isp3s")->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('indicator_isp3');
    }
};
