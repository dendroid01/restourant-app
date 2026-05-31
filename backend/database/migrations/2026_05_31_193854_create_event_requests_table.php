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
        Schema::create('event_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained();
            $table->string('client_name');
            $table->string('phone');
            $table->string('email');
            $table->date('date');
            $table->smallInteger('guests')->unsigned();
            $table->text('wishes')->nullable();
            $table->decimal('total_price_per_person', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->enum('status', ['new', 'processing', 'confirmed', 'cancelled'])->default('new');
            $table->text('admin_comment')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_requests');
    }
};
