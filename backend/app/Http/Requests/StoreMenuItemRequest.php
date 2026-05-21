<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreMenuItemRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'menu_category_id' => ['required', 'exists:menu_categories,id'],
            'title_ru'         => ['required', 'string', 'max:255'],
            'title_en'         => ['nullable', 'string', 'max:255'],
            'description_ru'   => ['nullable', 'string'],
            'description_en'   => ['nullable', 'string'],
            'price'            => ['required', 'integer', 'min:0'],
            'image'            => ['nullable', 'url', 'max:500'],
            'featured'         => ['boolean'],
            'sort_order'       => ['integer', 'min:0'],
        ];
    }
}
