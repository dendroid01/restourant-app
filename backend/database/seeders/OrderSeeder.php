<?php

namespace Database\Seeders;

use App\Models\Order;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $orders = [
            // Бронирования столиков
            [
                'type'       => 'table',
                'client'     => 'Анна Иванова',
                'phone'      => '+79123456789',
                'email'      => 'anna.i@mail.ru',
                'restaurant' => 'Ресторан на Тверской',
                'date'       => '2024-06-20',
                'time'       => '19:00',
                'guests'     => 4,
                'wishes'     => 'Место у окна, отмечаем день рождения',
                'status'     => 'confirmed',
                'amount'     => null,
            ],
            [
                'type'       => 'table',
                'client'     => 'Сергей Попов',
                'phone'      => '+79056789012',
                'email'      => 'sergey.p@yandex.ru',
                'restaurant' => 'Ресторан на Патриарших',
                'date'       => '2024-06-22',
                'time'       => '20:00',
                'guests'     => 2,
                'wishes'     => 'Романтический ужин, нужны цветы на столе',
                'status'     => 'new',
                'amount'     => null,
            ],
            [
                'type'       => 'table',
                'client'     => 'Елена Кузнецова',
                'phone'      => '+79167890123',
                'email'      => 'elena.k@gmail.com',
                'restaurant' => 'Ресторан на Тверской',
                'date'       => '2024-06-18',
                'time'       => '13:00',
                'guests'     => 6,
                'wishes'     => 'Деловой обед, нужен отдельный кабинет',
                'status'     => 'confirmed',
                'amount'     => null,
            ],
            [
                'type'       => 'table',
                'client'     => 'Владимир Орлов',
                'phone'      => '+79278901234',
                'email'      => null,
                'restaurant' => 'Ресторан в Санкт-Петербурге',
                'date'       => '2024-06-15',
                'time'       => '19:30',
                'guests'     => 3,
                'wishes'     => '',
                'status'     => 'cancelled',
                'amount'     => null,
            ],
            // Мероприятия
            [
                'type'       => 'event',
                'client'     => 'Михаил Смирнов',
                'phone'      => '+79214567890',
                'email'      => 'mikhail.s@company.ru',
                'restaurant' => 'Ресторан на Тверской',
                'date'       => '2024-07-15',
                'time'       => null,
                'guests'     => 50,
                'wishes'     => 'Корпоративный вечер, нужен проектор и экран, живая музыка',
                'status'     => 'processing',
                'amount'     => 245000,
                'dishes'     => [
                    ['id' => 'h1', 'title' => 'Утиная грудка с вишнёвым соусом', 'qty' => 25, 'price' => 2450],
                    ['id' => 'g1', 'title' => 'Стейк рибай', 'qty' => 25, 'price' => 3800],
                    ['id' => 's1', 'title' => 'Салат с лангустинами', 'qty' => 50, 'price' => 2100],
                ],
            ],
            [
                'type'       => 'event',
                'client'     => 'Ольга Фёдорова',
                'phone'      => '+79389012345',
                'email'      => 'olga.f@mail.ru',
                'restaurant' => 'Ресторан на Патриарших',
                'date'       => '2024-07-20',
                'time'       => null,
                'guests'     => 20,
                'wishes'     => 'Свадьба, нужно оформление зала цветами, торт не наш',
                'status'     => 'confirmed',
                'amount'     => 156000,
                'dishes'     => [
                    ['id' => 'c1', 'title' => 'Фуа-гра с бриошью', 'qty' => 20, 'price' => 2200],
                    ['id' => 'h4', 'title' => 'Лосось конфи', 'qty' => 20, 'price' => 2650],
                    ['id' => 'd2', 'title' => 'Шоколадный фондан', 'qty' => 20, 'price' => 690],
                ],
            ],
            [
                'type'       => 'event',
                'client'     => 'Андрей Белов',
                'phone'      => '+79490123456',
                'email'      => 'andrey.b@firm.ru',
                'restaurant' => 'Ресторан в Санкт-Петербурге',
                'date'       => '2024-08-01',
                'time'       => null,
                'guests'     => 30,
                'wishes'     => 'Презентация продукта, нужен кейтеринг на 2 часа',
                'status'     => 'new',
                'amount'     => 87000,
                'dishes'     => [],
            ],
        ];

        foreach ($orders as $order) {
            Order::create($order);
        }
    }
}
