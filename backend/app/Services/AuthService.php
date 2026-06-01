<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Логин пользователя
     */
    public function login(string $email, string $password, string $deviceName = 'web'): array
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Неверный email или пароль'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Аккаунт заблокирован'],
            ]);
        }

        $token = $user->createToken($deviceName)->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Логаут пользователя
     */
    public function logout($user): void
    {
        $user->currentAccessToken()->delete();
    }

    /**
     * Получить текущего пользователя с правами
     */
    public function getCurrentUser($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'is_admin' => $user->isAdmin(),
            'permissions' => $user->permissions ?? [],
            'allowed_sections' => $this->getAllowedSections($user),
        ];
    }

    /**
     * Какие разделы доступны пользователю (для бокового меню)
     */
    private function getAllowedSections(User $user): array
    {
        if ($user->isAdmin()) {
            return [
                'dashboard', 'news', 'restaurants', 'menu',
                'pages', 'reviews', 'orders', 'managers'
            ];
        }

        return $user->permissions ?? [];
    }
}
