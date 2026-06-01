<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardResource;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    /**
     * Получить все данные для дашборда
     */
    public function stats(): JsonResponse
    {
        $stats = $this->dashboardService->getStats();
        $recentOrders = $this->dashboardService->getRecentOrders(5);
        $pendingReviews = $this->dashboardService->getPendingReviews(5);
        $quickActions = $this->dashboardService->getQuickActions();

        // Фильтруем быстрые действия по правам пользователя
        $user = auth()->user();
        if (!$user->isAdmin()) {
            $userPermissions = $user->permissions ?? [];
            $quickActions = array_filter($quickActions, function ($action) use ($userPermissions) {
                return in_array($action['permission'], $userPermissions);
            });
            $quickActions = array_values($quickActions);
        }

        $data = [
            'stats' => $stats,
            'recent_orders' => $recentOrders,
            'pending_reviews' => $pendingReviews,
            'quick_actions' => $quickActions,
        ];

        return response()->json([
            'success' => true,
            'data' => new DashboardResource($data),
        ]);
    }

    /**
     * Получить только статистику (кратко)
     */
    public function statsSummary(): JsonResponse
    {
        $stats = $this->dashboardService->getStats();

        return response()->json([
            'success' => true,
            'data' => [
                'news_count' => $stats['news']['total'],
                'restaurants_count' => $stats['restaurants']['total'],
                'pending_reviews_count' => $stats['reviews']['pending'],
                'new_orders_count' => $stats['orders']['new_orders'],
            ],
        ]);
    }
}
