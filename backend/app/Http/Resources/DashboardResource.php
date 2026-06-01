<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'stats' => $this->resource['stats'],
            'recent_orders' => $this->resource['recent_orders'],
            'pending_reviews' => $this->resource['pending_reviews'],
            'quick_actions' => $this->resource['quick_actions'],
            'last_updated' => now()->toISOString(),
        ];
    }
}
