<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use Illuminate\Database\Seeder;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        $restaurants = [
            [
                'name_ru'         => 'La Belle Époque на Тверской',
                'name_en'         => 'La Belle Époque at Tverskaya',
                'description_ru'  => 'Флагманский ресторан сети в самом сердце Москвы. Изысканный интерьер эпохи Belle Époque, живая музыка каждый вечер и авторская кухня от шеф-повара с мишленовской звездой. Идеальное место для деловых встреч и романтических ужинов.',
                'description_en'  => 'The flagship restaurant of the chain in the heart of Moscow. Exquisite Belle Époque interior, live music every evening and original cuisine from a Michelin-starred chef. The perfect place for business meetings and romantic dinners.',
                'address_ru'      => 'ул. Тверская, 15, Москва',
                'address_en'      => 'Tverskaya St., 15, Moscow',
                'phone'           => '+7 (495) 123-45-67',
                'hours_ru'        => 'Пн–Вс: 12:00 — 00:00',
                'hours_en'        => 'Mon–Sun: 12:00 — 00:00',
                'image'           => 'https://picsum.photos/800/600?random=101',
                'status'          => 'active',
                'sort_order'      => 1,
            ],
            [
                'name_ru'         => 'La Belle Époque на Патриарших',
                'name_en'         => 'La Belle Époque at Patriarshiye Ponds',
                'description_ru'  => 'Уютный ресторан с панорамным видом на Патриаршие пруды. Камерная атмосфера, открытая терраса в летний сезон и эксклюзивная винная карта с более чем 300 позициями. Любимое место московской богемы.',
                'description_en'  => 'A cozy restaurant with panoramic views of the Patriarshiye Ponds. Intimate atmosphere, open terrace in summer season and an exclusive wine list with more than 300 positions. A favorite haunt of the Moscow bohème.',
                'address_ru'      => 'Малый Патриарший пер., 5, Москва',
                'address_en'      => 'Maly Patriarshiy Ln., 5, Moscow',
                'phone'           => '+7 (495) 765-43-21',
                'hours_ru'        => 'Пн–Вс: 12:00 — 02:00',
                'hours_en'        => 'Mon–Sun: 12:00 — 02:00',
                'image'           => 'https://picsum.photos/800/600?random=102',
                'status'          => 'active',
                'sort_order'      => 2,
            ],
            [
                'name_ru'         => 'La Belle Époque в Санкт-Петербурге',
                'name_en'         => 'La Belle Époque in Saint Petersburg',
                'description_ru'  => 'Первый ресторан сети за пределами Москвы. Расположен в историческом особняке на Невском проспекте. Высокие потолки, хрустальные люстры и вид на Казанский собор создают неповторимую атмосферу Петербурга.',
                'description_en'  => 'The first restaurant in the chain outside of Moscow. Located in a historic mansion on Nevsky Prospekt. High ceilings, crystal chandeliers and a view of the Kazan Cathedral create the unique atmosphere of St. Petersburg.',
                'address_ru'      => 'Невский пр., 48, Санкт-Петербург',
                'address_en'      => 'Nevsky Prospekt, 48, Saint Petersburg',
                'phone'           => '+7 (812) 456-78-90',
                'hours_ru'        => 'Пн–Вс: 11:00 — 23:00',
                'hours_en'        => 'Mon–Sun: 11:00 — 23:00',
                'image'           => 'https://picsum.photos/800/600?random=103',
                'status'          => 'active',
                'sort_order'      => 3,
            ],
            [
                'name_ru'         => 'La Belle Époque в Сочи',
                'name_en'         => 'La Belle Époque in Sochi',
                'description_ru'  => 'Ресторан у самого берега Чёрного моря. Открытая терраса с видом на горизонт, коктейльный бар и специальное летнее меню с акцентом на свежие морепродукты. Работает в режиме бранча по выходным.',
                'description_en'  => 'A restaurant right on the Black Sea shore. Open terrace overlooking the horizon, cocktail bar and a special summer menu with an emphasis on fresh seafood. Brunch available on weekends.',
                'address_ru'      => 'Приморская набережная, 12, Сочи',
                'address_en'      => 'Primorskaya Embankment, 12, Sochi',
                'phone'           => '+7 (862) 234-56-78',
                'hours_ru'        => 'Пн–Вс: 10:00 — 01:00',
                'hours_en'        => 'Mon–Sun: 10:00 — 01:00',
                'image'           => 'https://picsum.photos/800/600?random=104',
                'status'          => 'active',
                'sort_order'      => 4,
            ],
            [
                'name_ru'         => 'La Belle Époque в Казани',
                'name_en'         => 'La Belle Époque in Kazan',
                'description_ru'  => 'Ресторан в историческом центре Казани, в пешей доступности от Казанского Кремля. Уникальное сочетание французской классики и татарских кулинарных традиций. Специальные сеты с дегустацией местных продуктов.',
                'description_en'  => 'Restaurant in the historic center of Kazan, within walking distance of Kazan Kremlin. A unique blend of French classics and Tatar culinary traditions. Special tasting sets with local products.',
                'address_ru'      => 'ул. Баумана, 22, Казань',
                'address_en'      => 'Bauman St., 22, Kazan',
                'phone'           => '+7 (843) 345-67-89',
                'hours_ru'        => 'Пн–Вс: 12:00 — 23:00',
                'hours_en'        => 'Mon–Sun: 12:00 — 23:00',
                'image'           => 'https://picsum.photos/800/600?random=105',
                'status'          => 'inactive', // готовится к открытию
                'sort_order'      => 5,
            ],
        ];

        foreach ($restaurants as $data) {
            Restaurant::create($data);
        }
    }
}
