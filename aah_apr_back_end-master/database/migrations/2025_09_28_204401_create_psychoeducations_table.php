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
        Schema::create('psychoeducations', function (Blueprint $table) {
            $table->id();
            $table->foreignId("program_id")->constrained("programs")->onDelete("cascade");
            $table->foreignId("indicator_id")->constrained("indicators")->cascadeOnDelete();
            $table->string("awarenessTopic");
            $table->date("awarenessDate");
            $table->smallInteger("ofMenHostCommunity")->nullable();
            $table->smallInteger("ofMenIdp")->nullable();
            $table->smallInteger("ofMenRefugee")->nullable();
            $table->smallInteger("ofMenReturnee")->nullable();
            $table->smallInteger("ofWomenHostCommunity")->nullable();
            $table->smallInteger("ofWomenIdp")->nullable();
            $table->smallInteger("ofWomenRefugee")->nullable();
            $table->smallInteger("ofWomenReturnee")->nullable();
            $table->smallInteger("ofBoyHostCommunity")->nullable();
            $table->smallInteger("ofBoyIdp")->nullable();
            $table->smallInteger("ofBoyRefugee")->nullable();
            $table->smallInteger("ofBoyReturnee")->nullable();
            $table->smallInteger("ofGirlHostCommunity")->nullable();
            $table->smallInteger("ofGirlIdp")->nullable();
            $table->smallInteger("ofGirlRefugee")->nullable();
            $table->smallInteger("ofGirlReturnee")->nullable();
            $table->string("remark")->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('psychoeducations');
    }
};
