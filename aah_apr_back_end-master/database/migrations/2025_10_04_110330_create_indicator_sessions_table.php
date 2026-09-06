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
        Schema::create('indicator_sessions', function (
            Blueprint $table
        ) {
            $table->id();

            $table
                ->foreignId('indicator_id')
                ->nullable()
                ->constrained('indicators')
                ->cascadeOnDelete();

            $table
                ->foreignId('beneficiary_id')
                ->constrained('beneficiaries')
                ->cascadeOnDelete();

            $table
                ->string('group')
                ->nullable();

            $table
                ->string('session')
                ->nullable();

            $table
                ->date('date')
                ->nullable();

            $table
                ->text('topic')
                ->nullable();

            $table
                ->boolean('is_group')
                ->default(false);

            $table->timestamps();

            $table->index([
                'beneficiary_id',
                'indicator_id',
            ]);

            $table->index('is_group');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('indicator_sessions');
    }
};
