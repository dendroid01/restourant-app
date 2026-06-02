<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ManagerRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && $user->isAdmin(); // Только администратор
    }

    public function rules(): array
    {
        $managerId = $this->route('id');
        $isCreate = $this->isMethod('POST');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($managerId),
            ],
            'password' => $isCreate
                ? ['required', 'string', 'min:6', 'max:255']
                : ['nullable', 'string', 'min:6', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', Rule::in(array_keys(\App\Services\ManagerService::AVAILABLE_SECTIONS))],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Имя обязательно',
            'email.required' => 'Email обязателен',
            'email.email' => 'Введите корректный email',
            'email.unique' => 'Пользователь с таким email уже существует',
            'password.required' => 'Пароль обязателен',
            'password.min' => 'Пароль должен содержать минимум 6 символов',
            'permissions.*.in' => 'Некорректный раздел доступа',
        ];
    }
}
