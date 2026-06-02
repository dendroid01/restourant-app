<?php

namespace App\Http\Resources\Public;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HomeDataResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slides' => $this['slides'],
            'latest_news' => $this['latest_news'],
            'featured_dishes' => $this['featured_dishes'],
        ];
    }
}
