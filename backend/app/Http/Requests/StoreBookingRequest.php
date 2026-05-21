<?php

// app/Http/Requests/StoreBookingRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name'       => ['required', 'string', 'min:2', 'max:100',
                'regex:/^[a-zA-Zа-яА-ЯёЁ\s\-\.]{2,}(\s[a-zA-Zа-яА-ЯёЁ\s\-\.]{2,})+$/u'],
            'phone'      => ['required', 'string',
                'regex:/^(\+7|8|7)\d{10}$/'],
            'email'      => ['required', 'email:rfc,dns'],
            'restaurant' => ['required', 'string', 'max:100'],
            'date'       => ['required', 'date', 'after_or_equal:today'],
            'time'       => ['required', 'date_format:H:i'],
            'guests'     => ['required', 'integer', 'min:1', 'max:50'],
            'wishes'     => ['nullable', 'string', 'max:1000'],
        ];
    }

    // Очистка телефона перед сохранением
    protected function prepareForValidation(): void
    {
        $this->merge([
            'phone' => preg_replace('/[\s\-\(\)]/', '', $this->phone ?? ''),
        ]);
    }
}
