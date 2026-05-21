<?php

// app/Http/Controllers/Api/Admin/OrderController.php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::orderBy('created_at', 'desc');

        if ($request->filled('type')) $query->where('type', $request->type);
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('restaurant')) $query->where('restaurant', $request->restaurant);
        if ($request->filled('date_from')) $query->whereDate('date', '>=', $request->date_from);
        if ($request->filled('date_to')) $query->whereDate('date', '<=', $request->date_to);

        return response()->json($query->paginate(20));
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'client' => ['sometimes', 'string', 'max:100'],
            'phone' => ['sometimes', 'string'],
            'email' => ['sometimes', 'nullable', 'email'],
            'date' => ['sometimes', 'date'],
            'time' => ['sometimes', 'nullable', 'date_format:H:i'],
            'guests' => ['sometimes', 'integer', 'min:1'],
            'wishes' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'status' => ['sometimes', 'in:new,processing,confirmed,cancelled'],
        ]);

        $order->update($validated);

        return response()->json($order);
    }
}
