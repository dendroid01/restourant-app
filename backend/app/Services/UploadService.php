<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadService
{
    /**
     * Допустимые типы файлов
     */
    const ALLOWED_IMAGES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const ALLOWED_DOCUMENTS = ['application/pdf'];

    /**
     * Максимальный размер файла (5MB)
     */
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    /**
     * Загрузить изображение
     */
    public function uploadImage(UploadedFile $file, string $directory = 'images'): array
    {
        $this->validateFile($file, self::ALLOWED_IMAGES);

        $filename = $this->generateFileName($file);
        $path = $file->storeAs($directory, $filename, 'public');

        return [
            'success' => true,
            'url' => url(Storage::url($path)),
            'path' => $path,
            'filename' => $filename,
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ];
    }

    /**
     * Загрузить несколько изображений
     */
    public function uploadMultipleImages(array $files, string $directory = 'images'): array
    {
        $results = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                try {
                    $results[] = $this->uploadImage($file, $directory);
                } catch (\Exception $e) {
                    $results[] = [
                        'success' => false,
                        'error' => $e->getMessage(),
                        'original_name' => $file->getClientOriginalName(),
                    ];
                }
            }
        }

        return $results;
    }

    /**
     * Загрузить файл (любой разрешённый)
     */
    public function uploadFile(UploadedFile $file, string $directory = 'files'): array
    {
        $allowed = array_merge(self::ALLOWED_IMAGES, self::ALLOWED_DOCUMENTS);
        $this->validateFile($file, $allowed);

        $filename = $this->generateFileName($file);
        $path = $file->storeAs($directory, $filename, 'public');

        return [
            'success' => true,
            'url' => url(Storage::url($path)),
            'path' => $path,
            'filename' => $filename,
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'extension' => $file->getClientOriginalExtension(),
        ];
    }

    /**
     * Удалить файл
     */
    public function deleteFile(string $url): bool
    {
        $path = str_replace('/storage/', '', parse_url($url, PHP_URL_PATH));

        if ($path && Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }

        return false;
    }

    /**
     * Валидация файла
     */
    private function validateFile(UploadedFile $file, array $allowedMimeTypes): void
    {
        if (!$file->isValid()) {
            throw new \Exception('Файл не загрузился');
        }

        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new \Exception('Максимальный размер файла: 5MB');
        }

        if (!in_array($file->getMimeType(), $allowedMimeTypes)) {
            $allowedStr = implode(', ', $allowedMimeTypes);
            throw new \Exception("Недопустимый тип файла. Разрешены: {$allowedStr}");
        }
    }

    /**
     * Генерация уникального имени файла
     */
    private function generateFileName(UploadedFile $file): string
    {
        $extension = $file->getClientOriginalExtension();
        $random = Str::random(40);
        return $random . '.' . $extension;
    }

    /**
     * Получить информацию о файле по URL
     */
    public function getFileInfo(string $url): ?array
    {
        $path = str_replace('/storage/', '', parse_url($url, PHP_URL_PATH));

        if (!$path || !Storage::disk('public')->exists($path)) {
            return null;
        }

        return [
            'url' => $url,
            'path' => $path,
            'size' => Storage::disk('public')->size($path),
            'last_modified' => Storage::disk('public')->lastModified($path),
        ];
    }
}
