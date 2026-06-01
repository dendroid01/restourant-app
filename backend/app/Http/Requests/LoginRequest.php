<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:6'],
            'device_name' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Email обязателен',
            'email.email' => 'Введите корректный email',
            'password.required' => 'Пароль обязателен',
            'password.min' => 'Пароль должен содержать минимум 6 символов',
        ];
    }
}
