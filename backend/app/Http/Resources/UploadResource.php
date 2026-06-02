<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UploadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'success' => $this['success'],
            'url' => $this['url'] ?? null,
            'path' => $this['path'] ?? null,
            'filename' => $this['filename'] ?? null,
            'size' => $this['size'] ?? null,
            'size_formatted' => isset($this['size']) ? $this->formatBytes($this['size']) : null,
            'mime_type' => $this['mime_type'] ?? null,
            'extension' => $this['extension'] ?? null,
            'error' => $this['error'] ?? null,
            'original_name' => $this['original_name'] ?? null,
        ];
    }

    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
