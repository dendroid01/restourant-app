<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ManagerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $availableSections = \App\Services\ManagerService::AVAILABLE_SECTIONS;

        $permissionsLabels = [];
        foreach ($this->permissions ?? [] as $permission) {
            if (isset($availableSections[$permission])) {
                $permissionsLabels[] = $availableSections[$permission];
            }
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'is_active' => (bool) $this->is_active,
            'status_label' => $this->is_active ? 'Активен' : 'Заблокирован',
            'status_badge' => $this->is_active ? 'success' : 'error',
            'permissions' => $this->permissions ?? [],
            'permissions_labels' => $permissionsLabels,
            'role' => $this->role,
            'created_at' => $this->created_at?->toISOString(),
            'created_at_formatted' => $this->created_at?->format('d.m.Y H:i'),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
