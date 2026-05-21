<?php

// app/Http/Controllers/Api/Admin/ManagerController.php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreManagerRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ManagerController extends Controller
{
    public function index()
    {
        $managers = User::where('role', 'manager')
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name', 'email', 'role', 'rights', 'status', 'created_at']);

        return response()->json($managers);
    }

    public function store(StoreManagerRequest $request)
    {
        $manager = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'manager',
            'rights'   => $request->rights ?? [],
            'status'   => $request->status ?? 'active',
        ]);

        return response()->json($manager->only(['id', 'name', 'email', 'role', 'rights', 'status']), 201);
    }

    public function update(StoreManagerRequest $request, User $user)
    {
        $data = $request->safe()->except('password');

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json($user->only(['id', 'name', 'email', 'role', 'rights', 'status']));
    }

    public function destroy(User $user)
    {
        abort_if($user->role === 'admin', 403, 'Нельзя удалить администратора');
        $user->delete();
        return response()->json(['message' => 'Удалено']);
    }
}
