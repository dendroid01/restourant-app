<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Главный администратор
        User::create([
            'name'     => 'Александр Петров',
            'email'    => 'admin@restaurant.ru',
            'password' => Hash::make('Admin123!'),
            'role'     => 'admin',
            'rights'   => null,
            'status'   => 'active',
        ]);

        // Менеджеры с разными правами
        $managers = [
            [
                'name'   => 'Екатерина Смирнова',
                'email'  => 'ekaterina@restaurant.ru',
                'rights' => ['Новости', 'Страницы'],
            ],
            [
                'name'   => 'Дмитрий Козлов',
                'email'  => 'dmitry@restaurant.ru',
                'rights' => ['Меню', 'Рестораны'],
            ],
            [
                'name'   => 'Ольга Морозова',
                'email'  => 'olga@restaurant.ru',
                'rights' => ['Заказы', 'Отзывы'],
            ],
            [
                'name'   => 'Сергей Новиков',
                'email'  => 'sergey@restaurant.ru',
                'rights' => ['Новости', 'Меню', 'Отзывы'],
            ],
            [
                'name'   => 'Анна Волкова',
                'email'  => 'anna@restaurant.ru',
                'rights' => ['Заказы'],
                'status' => 'blocked',
            ],
        ];

        foreach ($managers as $manager) {
            User::create([
                'name'     => $manager['name'],
                'email'    => $manager['email'],
                'password' => Hash::make('Manager123!'),
                'role'     => 'manager',
                'rights'   => $manager['rights'],
                'status'   => $manager['status'] ?? 'active',
            ]);
        }
    }
}
