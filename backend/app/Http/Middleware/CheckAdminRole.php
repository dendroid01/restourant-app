<?php

// app/Http/Middleware/CheckAdminRole.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckAdminRole
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $user = $request->user();

        if (!$user || $user->status === 'blocked') {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Если явно передана роль 'admin' — проверяем
        if (in_array('admin', $roles) && $user->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // Проверяем права менеджера на раздел
        if ($user->role === 'manager' && !empty($roles)) {
            $section = $roles[0]; // первый аргумент — раздел
            $allowed = $user->rights ?? [];
            if (!in_array($section, $allowed) && $user->role !== 'admin') {
                return response()->json(['message' => 'Нет доступа к разделу'], 403);
            }
        }

        return $next($request);
    }
}
