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
        Schema::create('community_dialogues', function (Blueprint $table) {
            $table->id();
            $table->foreignId("program_id")->constrained("programs")->onDelete("cascade");
            $table->foreignId("indicator_id")->constrained("indicators")->cascadeOnDelete();
            $table->string("name")->unique();
            $table->string("remark");
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('community_dialogues');
    }
};
