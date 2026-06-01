<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;

class PublicReviewController extends Controller
{
    public function __construct(
        protected ReviewService $reviewService
    ) {}

    /**
     * GET /api/reviews - получить одобренные отзывы
     */
    public function index(): JsonResponse
    {
        $reviews = $this->reviewService->getPaginated(['status' => 'approved'], 20);

        return response()->json([
            'success' => true,
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'average_rating' => $this->reviewService->getStats()['average_rating'],
                'total' => $reviews->total(),
            ],
        ]);
    }

    /**
     * POST /api/reviews - создать отзыв
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        $data = $request->validated();
        $ipAddress = $request->ip();

        $review = $this->reviewService->create($data, $ipAddress);

        return response()->json([
            'success' => true,
            'message' => 'Спасибо за отзыв! Он будет опубликован после модерации.',
            'data' => new ReviewResource($review),
        ], 201);
    }
}
