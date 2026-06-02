<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UploadMultipleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $successCount = 0;
        $failedCount = 0;
        $urls = [];

        foreach ($this->resource as $item) {
            if ($item['success']) {
                $successCount++;
                $urls[] = $item['url'];
            } else {
                $failedCount++;
            }
        }

        return [
            'success' => $successCount > 0,
            'total' => count($this->resource),
            'success_count' => $successCount,
            'failed_count' => $failedCount,
            'urls' => $urls,
            'items' => UploadResource::collection($this->resource),
        ];
    }
}
