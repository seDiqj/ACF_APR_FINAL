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
        Schema::create('database_program_beneficiary', function (Blueprint $table) {
            $table->id();
            $table->foreignId("database_id")->constrained("databases")->onDelete("cascade");
            $table->foreignId("program_id")->nullable()->constrained("programs")->onDelete("cascade");
            $table->foreignId("beneficiary_id")->constrained("beneficiaries")->onDelete("cascade");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('main_database');
    }
};
