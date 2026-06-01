<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class OrderUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isAdmin() || in_array('orders', $user->permissions ?? []));
    }

    public function rules(): array
    {
        return [
            'client_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'restaurant_id' => ['nullable', 'integer', 'exists:restaurants,id'],
            'date' => ['nullable', 'date'],
            'time' => ['nullable', 'date_format:H:i'],
            'guests' => ['nullable', 'integer', 'min:1', 'max:100'],
            'wishes' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:new,processing,confirmed,cancelled'],
            'admin_comment' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'restaurant_id.exists' => 'Ресторан не найден',
            'guests.min' => 'Количество гостей должно быть не менее 1',
            'guests.max' => 'Количество гостей не может превышать 100',
            'status.in' => 'Некорректный статус',
        ];
    }
}
