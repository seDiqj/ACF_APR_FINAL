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
        Schema::create('trainings', function (Blueprint $table) {
            $table->id();
            $table->foreignId("project_id")->constrained("projects")->onDelete("cascade");
            $table->foreignId("province_id")->constrained("provinces")->onDelete("cascade");
            $table->foreignId("district_id")->constrained("districts")->onDelete("cascade");
            $table->foreignId("indicator_id")->constrained("indicators")->onDelete("cascade");
            $table->string("trainingLocation");
            $table->string("name");
            $table->enum("participantCatagory", ["acf-staff", "stakeholder"]);
            $table->boolean("aprIncluded");
            $table->enum("trainingModality", ["face-to-face", "online"]);
            $table->date("startDate"); 
            $table->date("endDate");
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainings');
    }
};
