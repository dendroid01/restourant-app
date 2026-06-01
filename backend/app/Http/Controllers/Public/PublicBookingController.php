<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreBookingRequest;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;

class PublicBookingController extends Controller
{
    public function store(StoreBookingRequest $request): JsonResponse
    {
        $data = $request->validated();

        $booking = Booking::create([
            'restaurant_id' => $data['restaurant_id'],
            'client_name' => $data['client_name'],
            'phone' => $data['phone'],
            'email' => $data['email'],
            'date' => $data['date'],
            'time' => $data['time'],
            'guests' => $data['guests'],
            'wishes' => $data['wishes'] ?? null,
            'status' => 'new',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Бронирование успешно отправлено',
            'data' => [
                'id' => 'BK-' . str_pad($booking->id, 6, '0', STR_PAD_LEFT),
                'status' => 'new',
            ],
        ], 201);
    }
}
