<?php

// app/Http/Controllers/Api/Public/NewsController.php
namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $news = News::where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 12));

        return response()->json($news);
    }

    public function show(string $id)
    {
        $news = News::where('status', 'published')
            ->findOrFail($id);

        return response()->json($news);
    }
}
