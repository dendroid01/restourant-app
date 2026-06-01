<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReviewStatusRequest;
use App\Http\Resources\ReviewResource;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    public function __construct(
        protected ReviewService $reviewService
    ) {}

    /**
     * GET /api/admin/reviews - список отзывов
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['status', 'rating', 'search', 'date_from', 'date_to', 'sort_by', 'sort_order']);
        $perPage = $request->get('per_page', 10);

        $reviews = $this->reviewService->getPaginated($filters, $perPage);

        return response()->json([
            'success' => true,
            'data' => ReviewResource::collection($reviews),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
            ],
            'stats' => $this->reviewService->getStats(),
            'statuses' => $this->reviewService->getStatuses(),
            'rating_options' => $this->reviewService->getRatingOptions(),
        ]);
    }

    /**
     * GET /api/admin/reviews/{id} - детально
     */
    public function show(int $id): JsonResponse
    {
        $review = $this->reviewService->findById($id);

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Отзыв не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ReviewResource($review),
        ]);
    }

    /**
     * PATCH /api/admin/reviews/{id}/approve - одобрить
     */
    public function approve(int $id): JsonResponse
    {
        $userId = auth()->id();
        $review = $this->reviewService->approve($id, $userId);

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Отзыв не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Отзыв одобрен',
            'data' => new ReviewResource($review),
        ]);
    }

    /**
     * PATCH /api/admin/reviews/{id}/reject - отклонить
     */
    public function reject(int $id): JsonResponse
    {
        $review = $this->reviewService->reject($id);

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Отзыв не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Отзыв отклонён',
            'data' => new ReviewResource($review),
        ]);
    }

    /**
     * PATCH /api/admin/reviews/{id}/status - изменить статус (альтернативный метод)
     */
    public function updateStatus(ReviewStatusRequest $request, int $id): JsonResponse
    {
        $status = $request->status;

        if ($status === 'approved') {
            $review = $this->reviewService->approve($id, auth()->id());
        } else {
            $review = $this->reviewService->reject($id);
        }

        if (!$review) {
            return response()->json([
                'success' => false,
                'message' => 'Отзыв не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => $status === 'approved' ? 'Отзыв одобрен' : 'Отзыв отклонён',
            'data' => new ReviewResource($review),
        ]);
    }

    /**
     * DELETE /api/admin/reviews/{id} - удалить
     */
    public function destroy(int $id): JsonResponse
    {
        $deleted = $this->reviewService->delete($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Отзыв не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Отзыв успешно удалён',
        ]);
    }

    /**
     * GET /api/admin/reviews/stats - статистика
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->reviewService->getStats(),
        ]);
    }
}
