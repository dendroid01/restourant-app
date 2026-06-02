<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreContactRequest;
use App\Services\ContactService;
use Illuminate\Http\JsonResponse;

class PublicContactController extends Controller
{
    public function __construct(
        protected ContactService $contactService
    ) {}

    /**
     * POST /api/contact - отправить сообщение
     */
    public function send(StoreContactRequest $request): JsonResponse
    {
        $data = $request->validated();
        $ipAddress = $request->ip();

        $message = $this->contactService->send($data, $ipAddress);

        return response()->json([
            'success' => true,
            'message' => 'Сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время.',
            'data' => [
                'id' => $message->id,
                'created_at' => $message->created_at->format('d.m.Y H:i'),
            ],
        ], 201);
    }
}
