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
        Schema::create('beneficiary_community_dialogue_session', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_dialogue_session_id')
            ->constrained('community_dialogue_sessions', 'id', 'bcds_cd_session_fk')
            ->onDelete('cascade');
            $table->foreignId("beneficiary_id")->constrained("beneficiaries")->onDelete("cascade");
            $table->boolean("isPresent")->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beneficiary_community_dialogue_session');
    }
};
