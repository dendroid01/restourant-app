<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminNewsController;
use App\Http\Controllers\Admin\AdminRestaurantController;
use App\Http\Controllers\Admin\AdminMenuCategoryController;
use App\Http\Controllers\Admin\AdminMenuItemController;
use App\Http\Controllers\Admin\AdminReviewController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminManagerController;
use App\Http\Controllers\Admin\AdminUploadController;
use App\Http\Controllers\Public\PublicReviewController;
use App\Http\Controllers\Public\PublicBookingController;
use App\Http\Controllers\Public\PublicEventController;

Route::prefix('api/v1')->group(function () {

    Route::get('/sanctum/csrf-cookie', function () {
        return response()->json(['message' => 'CSRF cookie set']);
    })->middleware('web');

    // Публичные маршруты
    Route::post('/admin/login', [AuthController::class, 'login']);
    Route::get('/reviews', [PublicReviewController::class, 'index']);
    Route::post('/reviews', [PublicReviewController::class, 'store']);

    Route::post('/bookings', [PublicBookingController::class, 'store']);
    Route::post('/event-requests', [PublicEventController::class, 'store']);

    // Защищенные маршруты (требуют авторизации)
    Route::middleware('auth:sanctum')->group(function () {

        Route::post('/upload', [AdminUploadController::class, 'upload']);
        Route::post('/upload/multiple', [AdminUploadController::class, 'uploadMultiple']);
        Route::delete('/upload', [AdminUploadController::class, 'destroy']);
        Route::get('/upload/info', [AdminUploadController::class, 'info']);

        // Общие маршруты - доступ всем авторизованным
        Route::post('/admin/logout', [AuthController::class, 'logout']);
        Route::get('/admin/me', [AuthController::class, 'me']);
        Route::get('/stats', [AdminDashboardController::class, 'stats']);
        Route::get('/stats/summary', [AdminDashboardController::class, 'statsSummary']);

        Route::get('/restaurants/select', [AdminRestaurantController::class, 'listForSelect']);
        Route::get('/restaurants/all', [AdminRestaurantController::class, 'all']);

        // ============ НОВОСТИ (permission: news) ============
        Route::middleware('permission:news')->group(function () {
            Route::get('/news/statuses', [AdminNewsController::class, 'statuses']);
            Route::apiResource('news', AdminNewsController::class)->except(['create', 'edit']);
        });

        // ============ РЕСТОРАНЫ (permission: restaurants) ============
        Route::middleware('permission:restaurants')->group(function () {
            Route::post('/restaurants/reorder', [AdminRestaurantController::class, 'reorder']);
            Route::get('/restaurants/statuses', [AdminRestaurantController::class, 'statuses']);
            Route::apiResource('restaurants', AdminRestaurantController::class)->except(['create', 'edit']);
        });

        // ============ МЕНЮ (permission: menu) ============
        Route::middleware('permission:menu')->group(function () {
            Route::get('/menu/categories/flat', [AdminMenuCategoryController::class, 'flat']);
            Route::post('/menu/categories/reorder', [AdminMenuCategoryController::class, 'reorder']);
            Route::get('/menu/categories/statuses', [AdminMenuCategoryController::class, 'statuses']);
            Route::apiResource('menu/categories', AdminMenuCategoryController::class)->except(['create', 'edit']);

            Route::get('/menu/items/event-dishes', [AdminMenuItemController::class, 'eventDishes']);
            Route::get('/menu/items/featured', [AdminMenuItemController::class, 'featured']);
            Route::post('/menu/items/bulk/status', [AdminMenuItemController::class, 'bulkUpdateStatus']);
            Route::post('/menu/items/bulk/featured', [AdminMenuItemController::class, 'bulkUpdateFeatured']);
            Route::post('/menu/items/reorder', [AdminMenuItemController::class, 'reorder']);
            Route::get('/menu/items/stats', [AdminMenuItemController::class, 'stats']);
            Route::apiResource('menu/items', AdminMenuItemController::class)->except(['create', 'edit']);
        });

        // ============ ОТЗЫВЫ (permission: reviews) ============
        Route::middleware('permission:reviews')->group(function () {
            Route::get('admin/reviews', [AdminReviewController::class, 'index']);
            Route::get('admin/reviews/{id}', [AdminReviewController::class, 'show']);
            Route::patch('admin/reviews/{id}/approve', [AdminReviewController::class, 'approve']);
            Route::patch('admin/reviews/{id}/reject', [AdminReviewController::class, 'reject']);
            Route::patch('admin/reviews/{id}/status', [AdminReviewController::class, 'updateStatus']);
            Route::delete('admin/reviews/{id}', [AdminReviewController::class, 'destroy']);
            Route::get('admin/reviews/stats', [AdminReviewController::class, 'stats']);
        });

        // ============ ЗАКАЗЫ (permission: orders) ============
        Route::middleware('permission:orders')->group(function () {
            Route::get('admin/orders', [AdminOrderController::class, 'index']);
            Route::get('admin/orders/stats', [AdminOrderController::class, 'stats']);
            Route::get('admin/orders/{type}/{id}', [AdminOrderController::class, 'show']);
            Route::patch('admin/orders/{type}/{id}/status', [AdminOrderController::class, 'updateStatus']);
            Route::patch('admin/orders/{type}/{id}', [AdminOrderController::class, 'update']);
            Route::delete('admin/orders/{type}/{id}', [AdminOrderController::class, 'destroy']);
            Route::post('/admin/orders/event/{id}/items', [AdminOrderController::class, 'addEventItem']);
            Route::put('/admin/orders/event/{eventId}/items/{itemId}', [AdminOrderController::class, 'updateEventItem']);
            Route::delete('/admin/orders/event/{eventId}/items/{itemId}', [AdminOrderController::class, 'deleteEventItem']);
            Route::get('/admin/orders/event/{id}/available-dishes', [AdminOrderController::class, 'getAvailableDishes']);
        });

        // ============ МЕНЕДЖЕРЫ (только admin) ============
        Route::middleware('permission:managers')->group(function () {
            Route::get('/managers', [AdminManagerController::class, 'index']);
            Route::get('/managers/{id}', [AdminManagerController::class, 'show']);
            Route::post('/managers', [AdminManagerController::class, 'store']);
            Route::put('/managers/{id}', [AdminManagerController::class, 'update']);
            Route::delete('/managers/{id}', [AdminManagerController::class, 'destroy']);
            Route::patch('/managers/{id}/block', [AdminManagerController::class, 'toggleBlock']);
            Route::get('/managers/stats', [AdminManagerController::class, 'stats']);
            Route::get('/managers/sections', [AdminManagerController::class, 'sections']);
        });
    });
});
