<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50', 'regex:/^[\+\d\s\(\)-]+$/'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Имя обязательно',
            'name.min' => 'Имя должно содержать минимум 2 символа',
            'email.required' => 'Email обязателен',
            'email.email' => 'Введите корректный email',
            'message.required' => 'Сообщение обязательно',
            'message.min' => 'Сообщение должно содержать минимум 10 символов',
            'phone.regex' => 'Введите корректный номер телефона',
        ];
    }
}
