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
        Schema::create('indicators', function (Blueprint $table) {
            $table->id();
            $table->foreignId("output_id")->constrained("outputs")->onDelete("cascade");
            $table->foreignId("parent_indicator")->nullable()->constrained("indicators")->onDelete("cascade");
            $table->foreignId("database_id")->constrained("databases")->onDelete("cascade");
            $table->text("indicator");
            $table->string("indicatorRef");
            $table->integer("target");
            $table->integer("achived_target")->default(0);
            $table->enum("status", ["notStarted", "inProgress", "achived", "notAchived", "partiallyAchived"]);
            $table->enum("dessaggregationType", ["session", "indevidual", "enact"]);
            $table->longText("description");
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('indicators');
    }
};
