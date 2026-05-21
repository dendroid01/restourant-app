<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api;

// ─── Публичные маршруты ───────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // Рестораны
    Route::get('restaurants', [Api\Public\RestaurantController::class, 'index']);
    Route::get('restaurants/{restaurant}', [Api\Public\RestaurantController::class, 'show']);

    // Новости
    Route::get('news', [Api\Public\NewsController::class, 'index']);
    Route::get('news/{news}', [Api\Public\NewsController::class, 'show']);

    // Меню
    Route::get('menu/categories', [Api\Public\MenuController::class, 'categories']);
    Route::get('menu/recommended', [Api\Public\MenuController::class, 'recommended']);
    Route::get('menu/items', [Api\Public\MenuController::class, 'items']);       // ?category=hot

    // Отзывы
    Route::get('reviews', [Api\Public\ReviewController::class, 'index']);
    Route::post('reviews', [Api\Public\ReviewController::class, 'store']);

    // Страницы
    Route::get('pages/{slug}', [Api\Public\PageController::class, 'show']);

    // Заявки
    Route::post('orders/booking', [Api\Public\OrderController::class, 'storeBooking']);
    Route::post('orders/event', [Api\Public\OrderController::class, 'storeEvent']);
});

// ─── Авторизация ──────────────────────────────────────────────────────
Route::prefix('v1/admin')->group(function () {
    Route::post('login', [Api\Admin\AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [Api\Admin\AuthController::class, 'logout']);
        Route::get('me',     [Api\Admin\AuthController::class, 'me']);

        // ─── Новости ─────────────────────────────────────────────────
        Route::middleware('role:Новости')->group(function () {
            Route::apiResource('news', Api\Admin\NewsController::class);
        });

        // ─── Рестораны ───────────────────────────────────────────────
        Route::middleware('role:Рестораны')->group(function () {
            Route::apiResource('restaurants', Api\Admin\RestaurantController::class);
        });

        // ─── Меню ────────────────────────────────────────────────────
        Route::middleware('role:Меню')->group(function () {
            Route::apiResource('menu/categories', Api\Admin\MenuCategoryController::class);
            Route::apiResource('menu/items', Api\Admin\MenuItemController::class);
        });

        // ─── Отзывы ──────────────────────────────────────────────────
        Route::middleware('role:Отзывы')->group(function () {
            Route::get('reviews', [Api\Admin\ReviewController::class, 'index']);
            Route::patch('reviews/{review}/moderate', [Api\Admin\ReviewController::class, 'moderate']);
            Route::delete('reviews/{review}', [Api\Admin\ReviewController::class, 'destroy']);
        });

        // ─── Заказы ──────────────────────────────────────────────────
        Route::middleware('role:Заказы')->group(function () {
            Route::get('orders', [Api\Admin\OrderController::class, 'index']);
            Route::patch('orders/{order}', [Api\Admin\OrderController::class, 'update']);
        });

        // ─── Страницы ────────────────────────────────────────────────
        Route::middleware('role:Страницы')->group(function () {
            Route::apiResource('pages', Api\Admin\PageController::class);
        });

        // ─── Менеджеры — только admin ────────────────────────────────
        Route::middleware('role:admin')->group(function () {
            Route::apiResource('managers', Api\Admin\ManagerController::class);
        });
    });
});
