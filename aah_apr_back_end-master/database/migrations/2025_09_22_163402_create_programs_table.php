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
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId("database_id")->constrained("databases")->onDelete("cascade");
            $table->foreignId("project_id")->constrained("projects")->onDelete("cascade");
            $table->text("name");
            $table->string("focalPoint");
            $table->foreignId("province_id")->constrained("provinces")->onDelete("cascade");
            $table->foreignId("district_id")->constrained("districts");
            $table->string("village");
            $table->string("siteCode");
            $table->string("healthFacilityName");
            $table->string("interventionModality");
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
