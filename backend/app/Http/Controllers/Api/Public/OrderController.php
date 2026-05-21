<?php

// app/Http/Controllers/Api/Public/OrderController.php
namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingRequest;
use App\Http\Requests\StoreEventRequest;
use App\Models\Order;
use Carbon\Carbon;

class OrderController extends Controller
{
    public function storeBooking(StoreBookingRequest $request)
    {
        $order = Order::create([
            ...$request->validated(),
            'type' => 'table',
        ]);

        return response()->json(['message' => 'Бронирование принято', 'id' => $order->id], 201);
    }

    public function storeEvent(StoreEventRequest $request)
    {
        $validated = $request->validated();

        // Считаем сумму из переданных блюд
        $amount = collect($validated['dishes'] ?? [])->sum(
            fn($d) => ($d['qty'] ?? 0) * ($d['price'] ?? 0)
        );

        $order = Order::create([
            ...$validated,
            'type'   => 'event',
            'amount' => $amount * ($validated['guests'] ?? 1),
        ]);

        return response()->json(['message' => 'Заявка принята', 'id' => $order->id], 201);
    }
}
