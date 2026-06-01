<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminNewsController;
use App\Http\Controllers\Admin\AdminRestaurantController;
use App\Http\Controllers\Admin\AdminMenuCategoryController;
use App\Http\Controllers\Admin\AdminMenuItemController;

Route::prefix('api/v1')->group(function () {

    Route::get('/sanctum/csrf-cookie', function () {
        return response()->json(['message' => 'CSRF cookie set']);
    })->middleware('web');
    // Публичные маршруты
    Route::post('/admin/login', [AuthController::class, 'login']);

    // Защищенные маршруты
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/admin/logout', [AuthController::class, 'logout']);
        Route::get('/admin/me', [AuthController::class, 'me']);

        Route::get('/stats', [AdminDashboardController::class, 'stats']);
        Route::get('/stats/summary', [AdminDashboardController::class, 'statsSummary']);

        Route::apiResource('news', AdminNewsController::class)->except(['create', 'edit']);
        Route::get('/news/statuses', [AdminNewsController::class, 'statuses']);

        Route::get('/restaurants/all', [AdminRestaurantController::class, 'all']);
        Route::post('/restaurants/reorder', [AdminRestaurantController::class, 'reorder']);
        Route::get('/restaurants/statuses', [AdminRestaurantController::class, 'statuses']);
        Route::apiResource('restaurants', AdminRestaurantController::class)->except(['create', 'edit']);


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
});

Route::get('/test', function () {
    return response()->json(['message' => 'API works!']);
});
