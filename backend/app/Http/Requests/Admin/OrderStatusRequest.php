<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class OrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isAdmin() || in_array('orders', $user->permissions ?? []));
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:new,processing,confirmed,cancelled'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'Статус обязателен',
            'status.in' => 'Некорректный статус',
        ];
    }
}
