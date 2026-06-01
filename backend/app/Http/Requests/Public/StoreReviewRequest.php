<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'text_ru' => ['required', 'string', 'min:5', 'max:2000'],
            'text_en' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Имя обязательно',
            'name.min' => 'Имя должно содержать минимум 2 символа',
            'rating.required' => 'Оценка обязательна',
            'rating.min' => 'Оценка должна быть от 1 до 5',
            'rating.max' => 'Оценка должна быть от 1 до 5',
            'text_ru.required' => 'Текст отзыва обязателен',
            'text_ru.min' => 'Текст отзыва должен содержать минимум 5 символов',
        ];
    }
}
