<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReviewStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isAdmin() || in_array('reviews', $user->permissions ?? []));
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:approved,rejected'],
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
