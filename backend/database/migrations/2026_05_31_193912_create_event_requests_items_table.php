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
        Schema::create('event_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_request_id')->constrained()->onDelete('cascade');
            $table->foreignId('menu_item_id')->constrained();
            $table->smallInteger('quantity')->unsigned();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_requests_items');
    }
};
