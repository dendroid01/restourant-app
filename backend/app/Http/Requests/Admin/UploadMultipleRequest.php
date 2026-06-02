<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UploadMultipleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isAdmin() || in_array('restaurants', $user->permissions ?? []));
    }

    public function rules(): array
    {
        return [
            'files' => ['required', 'array', 'max:20'],
            'files.*' => ['required', 'file', 'max:5120', 'mimes:jpeg,png,jpg,gif,webp'],
            'directory' => ['nullable', 'string', 'max:100', 'regex:/^[a-z0-9_-]+$/i'],
        ];
    }

    public function messages(): array
    {
        return [
            'files.required' => 'Файлы не выбраны',
            'files.array' => 'Некорректный формат',
            'files.max' => 'Максимум 20 файлов за раз',
            'files.*.max' => 'Каждый файл не может превышать 5MB',
            'files.*.mimes' => 'Разрешены только изображения: jpeg, png, jpg, gif, webp',
        ];
    }
}
