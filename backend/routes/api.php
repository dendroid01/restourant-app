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
use App\Http\Controllers\Admin\AdminContactController;
use App\Http\Controllers\Public\PublicReviewController;
use App\Http\Controllers\Public\PublicBookingController;
use App\Http\Controllers\Public\PublicEventController;
use App\Http\Controllers\Public\PublicRestaurantController;
use App\Http\Controllers\Public\PublicMenuController;
use App\Http\Controllers\Public\PublicNewsController;
use App\Http\Controllers\Public\PublicContactController;

;

Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set']);
})->middleware('web');

// ============ ПУБЛИЧНЫЕ МАРШРУТЫ (без авторизации) ============
Route::post('/admin/login', [AuthController::class, 'login']);
Route::get('/reviews', [PublicReviewController::class, 'index']);
Route::post('/reviews', [PublicReviewController::class, 'store']);
Route::post('/bookings', [PublicBookingController::class, 'store']);
Route::post('/event-requests', [PublicEventController::class, 'store']);
Route::get('/restaurants', [PublicRestaurantController::class, 'index']);
Route::get('/restaurants/{id}', [PublicRestaurantController::class, 'show']);
Route::get('/restaurants/slides', [PublicRestaurantController::class, 'slides']);
Route::get('/menu/items/event-dishes', [AdminMenuItemController::class, 'eventDishes']);

Route::get('/menu/categories', [PublicMenuController::class, 'categories']);
Route::get('/menu/items', [PublicMenuController::class, 'items']);
Route::get('/menu/items/featured', [PublicMenuController::class, 'featured']);
Route::get('/menu/items/event', [PublicMenuController::class, 'eventDishes']);
Route::get('/menu/items/{id}', [PublicMenuController::class, 'show']);

Route::get('/news', [PublicNewsController::class, 'index']);
Route::get('/news/latest', [PublicNewsController::class, 'latest']);
Route::get('/news/archive', [PublicNewsController::class, 'archive']);
Route::get('/news/{id}', [PublicNewsController::class, 'show']);

Route::post('/contact', [PublicContactController::class, 'send']);

// ============ АДМИНСКИЕ МАРШРУТЫ (требуют авторизацию) ============
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {

    Route::post('/upload', [AdminUploadController::class, 'upload']);
    Route::post('/upload/multiple', [AdminUploadController::class, 'uploadMultiple']);
    Route::delete('/upload', [AdminUploadController::class, 'destroy']);
    Route::get('/upload/info', [AdminUploadController::class, 'info']);

    // Общие маршруты - доступ всем авторизованным
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
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


        Route::get('/menu/items/featured', [AdminMenuItemController::class, 'featured']);
        Route::post('/menu/items/bulk/status', [AdminMenuItemController::class, 'bulkUpdateStatus']);
        Route::post('/menu/items/bulk/featured', [AdminMenuItemController::class, 'bulkUpdateFeatured']);
        Route::post('/menu/items/reorder', [AdminMenuItemController::class, 'reorder']);
        Route::get('/menu/items/stats', [AdminMenuItemController::class, 'stats']);
        Route::apiResource('menu/items', AdminMenuItemController::class)->except(['create', 'edit']);
    });

    // ============ ОТЗЫВЫ (permission: reviews) ============
    Route::middleware('permission:reviews')->group(function () {
        Route::get('/reviews', [AdminReviewController::class, 'index']);
        Route::get('/reviews/{id}', [AdminReviewController::class, 'show']);
        Route::patch('/reviews/{id}/approve', [AdminReviewController::class, 'approve']);
        Route::patch('/reviews/{id}/reject', [AdminReviewController::class, 'reject']);
        Route::patch('/reviews/{id}/status', [AdminReviewController::class, 'updateStatus']);
        Route::delete('/reviews/{id}', [AdminReviewController::class, 'destroy']);
        Route::get('/reviews/stats', [AdminReviewController::class, 'stats']);
    });

    // ============ ЗАКАЗЫ (permission: orders) ============
    Route::middleware('permission:orders')->group(function () {
        Route::get('/orders', [AdminOrderController::class, 'index']);
        Route::get('/orders/stats', [AdminOrderController::class, 'stats']);
        Route::get('/orders/{type}/{id}', [AdminOrderController::class, 'show']);
        Route::patch('/orders/{type}/{id}/status', [AdminOrderController::class, 'updateStatus']);
        Route::patch('/orders/{type}/{id}', [AdminOrderController::class, 'update']);
        Route::delete('/orders/{type}/{id}', [AdminOrderController::class, 'destroy']);
        Route::post('/orders/event/{id}/items', [AdminOrderController::class, 'addEventItem']);
        Route::put('/orders/event/{eventId}/items/{itemId}', [AdminOrderController::class, 'updateEventItem']);
        Route::delete('/orders/event/{eventId}/items/{itemId}', [AdminOrderController::class, 'deleteEventItem']);
        Route::get('/orders/event/{id}/available-dishes', [AdminOrderController::class, 'getAvailableDishes']);
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

    Route::middleware('permission:сontacts')->group(function () {
        Route::get('/contact', [AdminContactController::class, 'index']);
        Route::get('/contact/{id}', [AdminContactController::class, 'show']);
        Route::patch('/contact/{id}/read', [AdminContactController::class, 'markAsRead']);
        Route::delete('/contact/{id}', [AdminContactController::class, 'destroy']);
        Route::get('/contact/stats', [AdminContactController::class, 'stats']);
    });
});
