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
        Schema::create('community_dialogue_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId("community_dialogue_id")->constrained("community_dialogues")->onDelete("cascade");
            $table->enum("type", ["initial", "followUp"]);
            $table->string("topic");
            $table->date("date");
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('community_dialogue_sessions');
    }
};
