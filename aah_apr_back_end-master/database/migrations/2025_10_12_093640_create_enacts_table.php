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
        Schema::create('enacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId("project_id")->constrained("projects")->cascadeOnDelete();
            $table->foreignId("province_id")->constrained("provinces")->cascadeOnDelete();
            $table->foreignId("indicator_id")->constrained("indicators")->cascadeOnDelete();
            $table->string("councilorName");
            $table->string("raterName");
            $table->enum("type", ["enact"]);
            $table->date("date");
            $table->boolean("aprIncluded");
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enacts');
    }
};
