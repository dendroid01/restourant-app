<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained();
            $table->string('client_name');
            $table->string('phone');
            $table->string('email');
            $table->date('date');
            $table->time('time');
            $table->tinyInteger('guests')->unsigned();
            $table->text('wishes')->nullable();
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
        Schema::dropIfExists('bookings');
    }
};
