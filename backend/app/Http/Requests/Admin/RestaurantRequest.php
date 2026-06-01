<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RestaurantRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isAdmin() || in_array('restaurants', $user->permissions ?? []));
    }

    public function rules(): array
    {
        return [
            'name_ru' => ['required', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'description_ru' => ['nullable', 'string'],
            'description_en' => ['nullable', 'string'],
            'address_ru' => ['required', 'string', 'max:500'],
            'address_en' => ['nullable', 'string', 'max:500'],
            'phone' => ['required', 'string', 'max:50'],
            'hours_ru' => ['required', 'string', 'max:255'],
            'hours_en' => ['nullable', 'string', 'max:255'],
            'lat' => ['nullable', 'numeric', 'min:-90', 'max:90'],
            'lng' => ['nullable', 'numeric', 'min:-180', 'max:180'],
            'order' => ['nullable', 'integer', 'min:0'],
            'status' => ['required', 'in:active,inactive'],
            'galleries' => ['nullable', 'array'],
            'galleries.*.id' => ['nullable', 'integer', 'exists:restaurant_galleries,id'],
            'galleries.*.image_url' => ['required_without:galleries.*.id', 'string', 'max:500'],
            'galleries.*.order' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'name_ru.required' => 'Название (RU) обязательно',
            'address_ru.required' => 'Адрес (RU) обязателен',
            'phone.required' => 'Телефон обязателен',
            'hours_ru.required' => 'Режим работы (RU) обязателен',
            'status.required' => 'Статус обязателен',
            'lat.numeric' => 'Широта должна быть числом',
            'lng.numeric' => 'Долгота должна быть числом',
        ];
    }
}
