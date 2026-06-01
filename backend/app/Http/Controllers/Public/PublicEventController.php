<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreEventRequest;
use App\Models\EventRequest;
use App\Models\EventRequestItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PublicEventController extends Controller
{
    public function store(StoreEventRequest $request): JsonResponse
    {
        $data = $request->validated();

        return DB::transaction(function () use ($data) {
            // Создаём заявку
            $eventRequest = EventRequest::create([
                'restaurant_id' => $data['restaurant_id'],
                'client_name' => $data['client_name'],
                'phone' => $data['phone'],
                'email' => $data['email'],
                'date' => $data['date'],
                'guests' => $data['guests'],
                'wishes' => $data['wishes'] ?? null,
                'total_price_per_person' => $data['total_price_per_person'],
                'total_price' => $data['total_price'],
                'status' => 'new',
            ]);

            // Создаём позиции заказа
            foreach ($data['items'] as $item) {
                EventRequestItem::create([
                    'event_request_id' => $eventRequest->id,
                    'menu_item_id' => $item['menu_item_id'],
                    'quantity' => $item['quantity'],
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Заявка на мероприятие успешно отправлена',
                'data' => [
                    'id' => 'EV-' . str_pad($eventRequest->id, 6, '0', STR_PAD_LEFT),
                    'status' => 'new',
                    'total_price' => $data['total_price'],
                ],
            ], 201);
        });
    }
}
