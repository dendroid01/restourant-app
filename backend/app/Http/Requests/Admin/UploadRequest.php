<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isAdmin() || in_array('news', $user->permissions ?? []));
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'max:5120'], // 5MB в килобайтах
            'type' => ['nullable', 'string', 'in:image,document'],
            'directory' => ['nullable', 'string', 'max:100', 'regex:/^[a-z0-9_-]+$/i'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Файл не выбран',
            'file.file' => 'Загрузите корректный файл',
            'file.max' => 'Максимальный размер файла: 5MB',
            'type.in' => 'Тип должен быть image или document',
            'directory.regex' => 'Директория может содержать только буквы, цифры, дефис и подчёркивание',
        ];
    }
}
