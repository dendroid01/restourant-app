<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * Вход в админку
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();

        $result = $this->authService->login(
            $data['email'],
            $data['password'],
            $data['device_name'] ?? 'web'
        );

        return response()->json([
            'success' => true,
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
        ]);
    }

    /**
     * Выход из админки
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Вы вышли из системы',
        ]);
    }

    /**
     * Получить текущего пользователя
     */
    public function me(Request $request): JsonResponse
    {
        $userData = $this->authService->getCurrentUser($request->user());

        return response()->json([
            'success' => true,
            'user' => $userData,
        ]);
    }
}
