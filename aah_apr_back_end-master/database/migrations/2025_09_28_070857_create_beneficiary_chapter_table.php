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
        Schema::create('beneficiary_chapter', function (Blueprint $table) {
            $table->id();
            $table->foreignId("beneficiary_id")->constrained("beneficiaries")->onDelete("cascade");
            $table->foreignId("chapter_id")->constrained("chapters")->onDelete("cascade");
            $table->tinyInteger("preTestScore")->default(0);
            $table->tinyInteger("postTestScore")->default(0);
            $table->tinyText("remark")->default("");
            $table->boolean("isPresent")->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beneficiary_chapter');
    }
};
