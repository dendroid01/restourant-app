<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UploadMultipleRequest;
use App\Http\Requests\Admin\UploadRequest;
use App\Http\Resources\UploadMultipleResource;
use App\Http\Resources\UploadResource;
use App\Services\UploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUploadController extends Controller
{
    public function __construct(
        protected UploadService $uploadService
    ) {}

    /**
     * POST /api/admin/upload - загрузить один файл
     */
    public function upload(UploadRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $type = $request->get('type', 'image');
        $directory = $request->get('directory', $type === 'image' ? 'images' : 'files');

        try {
            if ($type === 'image') {
                $result = $this->uploadService->uploadImage($file, $directory);
            } else {
                $result = $this->uploadService->uploadFile($file, $directory);
            }

            return response()->json([
                'success' => true,
                'message' => 'Файл успешно загружен',
                'data' => new UploadResource($result),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * POST /api/admin/upload/multiple - загрузить несколько файлов
     */
    public function uploadMultiple(UploadMultipleRequest $request): JsonResponse
    {
        $files = $request->file('files');
        $directory = $request->get('directory', 'images');

        $results = $this->uploadService->uploadMultipleImages($files, $directory);

        $successCount = count(array_filter($results, fn($r) => $r['success']));

        return response()->json([
            'success' => $successCount > 0,
            'message' => "Загружено {$successCount} из " . count($files) . " файлов",
            'data' => new UploadMultipleResource($results),
        ], $successCount > 0 ? 201 : 422);
    }

    /**
     * DELETE /api/admin/upload - удалить файл
     */
    public function destroy(Request $request): JsonResponse
    {
        $request->validate([
            'url' => ['required', 'string', 'max:500'],
        ]);

        $deleted = $this->uploadService->deleteFile($request->url);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Файл не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Файл успешно удалён',
        ]);
    }

    /**
     * GET /api/admin/upload/info - получить информацию о файле
     */
    public function info(Request $request): JsonResponse
    {
        $request->validate([
            'url' => ['required', 'string', 'max:500'],
        ]);

        $info = $this->uploadService->getFileInfo($request->url);

        if (!$info) {
            return response()->json([
                'success' => false,
                'message' => 'Файл не найден',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $info,
        ]);
    }
}
