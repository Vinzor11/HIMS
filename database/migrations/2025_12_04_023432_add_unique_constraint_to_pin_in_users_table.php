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
        Schema::table('users', function (Blueprint $table) {
            // Check if PIN column exists, if not add it with unique constraint
            if (!Schema::hasColumn('users', 'pin')) {
                $table->string('pin')->unique()->nullable()->after('password');
            } else {
                // If column exists, add unique constraint
                $table->unique('pin');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop unique index
            $table->dropUnique(['pin']);
        });
    }
};
