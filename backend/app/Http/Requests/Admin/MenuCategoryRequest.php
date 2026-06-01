<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MenuCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isAdmin() || in_array('menu', $user->permissions ?? []));
    }

    public function rules(): array
    {
        $categoryId = $this->route('id');

        return [
            'parent_id' => ['nullable', 'integer', 'exists:menu_categories,id'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('menu_categories', 'slug')->ignore($categoryId)],
            'title_ru' => ['required', 'string', 'max:255'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'title_ru.required' => 'Название категории (RU) обязательно',
            'slug.unique' => 'Такой slug уже существует',
            'parent_id.exists' => 'Родительская категория не найдена',
        ];
    }
}
