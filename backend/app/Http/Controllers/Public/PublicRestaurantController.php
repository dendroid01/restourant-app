<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Public\PublicRestaurantListResource;
use App\Http\Resources\Public\PublicRestaurantResource;
use App\Services\RestaurantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicRestaurantController extends Controller
{
    public function __construct(
        protected RestaurantService $restaurantService
    ) {}

    /**
     * GET /api/restaurants - список всех активных ресторанов
     */
    public function index(Request $request): JsonResponse
    {
        $restaurants = $this->restaurantService->getActiveRestaurants();

        return response()->json([
            'success' => true,
            'data' => PublicRestaurantListResource::collection($restaurants),
            'count' => $restaurants->count(),
        ]);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $restaurant = $this->restaurantService->getActiveRestaurant($id);

        if (!$restaurant) {
            return response()->json([
                'success' => false,
                'message' => 'Ресторан не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new PublicRestaurantResource($restaurant),
        ]);
    }

    /**
     * GET /api/restaurants/slides - слайды для главной страницы
     */
    public function slides(): JsonResponse
    {
        $slides = $this->restaurantService->getHeroSlides();

        return response()->json([
            'success' => true,
            'data' => $slides,
        ]);
    }
}
