<?php

// app/Http/Controllers/Api/Admin/ReviewController.php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::orderBy('created_at', 'desc');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(20));
    }

    // PATCH /admin/reviews/{review}/moderate
    public function moderate(Request $request, Review $review)
    {
        $request->validate([
            'status' => ['required', 'in:approved,rejected'],
        ]);

        $review->update(['status' => $request->status]);

        return response()->json($review);
    }

    public function destroy(Review $review)
    {
        $review->delete();
        return response()->json(['message' => 'Удалено']);
    }
}
