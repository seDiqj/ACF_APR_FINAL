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
        Schema::create('dessaggregations', function (Blueprint $table) {
            $table->id();
            $table->foreignId("indicator_id")->constrained("indicators")->onDelete("cascade");
            $table->foreignId("province_id")->constrained("provinces")->onDelete("cascade");
            $table->string("description");
            $table->integer("target");
            $table->integer("achived_target")->default(0);
            $table->json('months')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dessaggregations');
    }
};
