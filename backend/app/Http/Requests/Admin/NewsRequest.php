<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class NewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isAdmin() || in_array('news', $user->permissions ?? []));
    }

    public function rules(): array
    {
        $isUpdate = $this->isMethod('PUT') || $this->isMethod('PATCH');

        return [
            'title_ru' => ['required', 'string', 'max:255'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'excerpt_ru' => ['nullable', 'string'],
            'excerpt_en' => ['nullable', 'string'],
            'content_ru' => ['nullable', 'string'],
            'content_en' => ['nullable', 'string'],
            'image_thumb' => ['required', 'string', 'max:500'],
            'image_full' => ['nullable', 'string', 'max:500'],
            'published_at' => ['nullable', 'date'],
            'status' => ['required', 'in:published,draft'],
            'tags' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'title_ru.required' => 'Заголовок (RU) обязателен',
            'title_ru.max' => 'Заголовок не может быть длиннее 255 символов',
            'image_thumb.required' => 'URL превью-изображения обязателен',
            'status.required' => 'Статус обязателен',
            'status.in' => 'Некорректный статус',
            'published_at.date' => 'Неверный формат даты',
        ];
    }
}
