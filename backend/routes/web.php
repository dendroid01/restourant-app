<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\AdminDashboardController;

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
    });
});

Route::get('/test', function () {
    return response()->json(['message' => 'API works!']);
});
