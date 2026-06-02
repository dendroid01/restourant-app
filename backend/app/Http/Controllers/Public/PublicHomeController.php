<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\Public\HomeDataResource;
use App\Services\HomeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicHomeController extends Controller
{
    public function __construct(
        protected HomeService $homeService
    ) {}

    /**
     * GET /api/home - динамические данные для главной страницы
     * (слайды, новости, рекомендуемые блюда)
     */
    public function index(Request $request): JsonResponse
    {
        $lang = $request->get('lang', 'ru');

        $data = $this->homeService->getHomeData($lang);

        return response()->json([
            'success' => true,
            'data' => new HomeDataResource($data),
        ]);
    }

    /**
     * POST /api/home/cache/clear - очистить кеш (для админов)
     */
    public function clearCache(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Доступ запрещён',
            ], 403);
        }

        $this->homeService->clearCache();

        return response()->json([
            'success' => true,
            'message' => 'Кеш главной страницы очищен',
        ]);
    }
}
