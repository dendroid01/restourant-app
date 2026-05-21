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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['table', 'event']);
            $table->string('client');
            $table->string('phone');
            $table->string('email')->nullable();
            $table->string('restaurant')->nullable();
            $table->date('date');
            $table->time('time')->nullable();         // только для table
            $table->unsignedSmallInteger('guests');
            $table->text('wishes')->nullable();
            $table->unsignedBigInteger('amount')->nullable();  // только для event
            $table->json('dishes')->nullable();       // [{id, title, qty, price}] для event
            $table->enum('status', ['new', 'processing', 'confirmed', 'cancelled'])->default('new');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
