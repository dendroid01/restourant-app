<?php

// app/Http/Requests/StoreEventRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'min:2', 'max:100',
                'regex:/^[a-zA-Zа-яА-ЯёЁ\s\-\.]{2,}(\s[a-zA-Zа-яА-ЯёЁ\s\-\.]{2,})+$/u'],
            'phone' => ['required', 'string', 'regex:/^(\+7|8|7)\d{10}$/'],
            'email' => ['required', 'email:rfc,dns'],
            'restaurant' => ['required', 'string', 'max:100'],
            'date' => ['required', 'date', 'after:+2 days'],
            'guests' => ['required', 'integer', 'min:10'],
            'wishes' => ['nullable', 'string', 'max:2000'],
            'dishes' => ['nullable', 'array'],
            'dishes.*.id' => ['required', 'string'],
            'dishes.*.title' => ['required', 'string'],
            'dishes.*.qty' => ['required', 'integer', 'min:1'],
            'dishes.*.price' => ['required', 'integer', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'phone' => preg_replace('/[\s\-\(\)]/', '', $this->phone ?? ''),
        ]);
    }
}
