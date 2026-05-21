<?php

// app/Http/Requests/Admin/StoreNewsRequest.php
namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreNewsRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title_ru'    => ['required', 'string', 'max:255'],
            'title_en'    => ['nullable', 'string', 'max:255'],
            'excerpt_ru'  => ['nullable', 'string'],
            'excerpt_en'  => ['nullable', 'string'],
            'content_ru'  => ['nullable', 'string'],
            'content_en'  => ['nullable', 'string'],
            'date_ru'     => ['nullable', 'string', 'max:50'],
            'date_en'     => ['nullable', 'string', 'max:50'],
            'image'       => ['nullable', 'url', 'max:500'],
            'image_thumb' => ['nullable', 'url', 'max:500'],
            'tags'        => ['nullable', 'array'],
            'tags.*'      => ['string', 'max:50'],
            'status'      => ['required', 'in:published,draft'],
        ];
    }
}
