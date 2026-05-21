<?php

namespace Database\Seeders;

use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $reviews = [
            // Одобренные
            [
                'name'    => 'Анна Соколова',
                'email'   => 'anna.s@mail.ru',
                'rating'  => 5,
                'text_ru' => 'Потрясающий ресторан! Были здесь по случаю годовщины свадьбы. Обслуживание безупречное — сомелье подобрал идеальное вино к каждому блюду. Утиная грудка с вишнёвым соусом — лучшее, что я ела в жизни. Обязательно вернёмся!',
                'text_en' => 'Stunning restaurant! We were here for our wedding anniversary. Impeccable service — the sommelier paired perfect wine with every dish. Duck breast with cherry sauce is the best thing I have ever eaten. We will definitely be back!',
                'date_ru' => '15 марта 2024',
                'date_en' => 'March 15, 2024',
                'status'  => 'approved',
            ],
            [
                'name'    => 'Михаил Петров',
                'email'   => 'misha.p@yandex.ru',
                'rating'  => 5,
                'text_ru' => 'Отмечали здесь день рождения отца. Всё на высшем уровне — от встречи у входа до прощания. Шеф лично вышел поздравить именинника, что было очень трогательно. Ризотто с трюфелем — отдельная поэзия.',
                'text_en' => 'We celebrated my father\'s birthday here. Everything at the highest level — from the welcome at the entrance to the farewell. The chef personally came out to congratulate the birthday boy, which was very touching. Truffle risotto is a poem in itself.',
                'date_ru' => '10 марта 2024',
                'date_en' => 'March 10, 2024',
                'status'  => 'approved',
            ],
            [
                'name'    => 'Елена Морозова',
                'email'   => 'elena.m@gmail.com',
                'rating'  => 4,
                'text_ru' => 'Очень красивый интерьер, чувствуешь себя в Париже начала прошлого века. Кухня великолепна, особенно понравился французский луковый суп и тарт татен. Единственный минус — долго ждали столик, хотя бронировали заранее.',
                'text_en' => 'Very beautiful interior, you feel like you are in Paris at the beginning of the last century. The cuisine is magnificent, especially the French onion soup and tarte tatin. The only downside — we waited a long time for our table even though we booked in advance.',
                'date_ru' => '5 марта 2024',
                'date_en' => 'March 5, 2024',
                'status'  => 'approved',
            ],
            [
                'name'    => 'Александр Козлов',
                'email'   => 'alex.k@inbox.ru',
                'rating'  => 5,
                'text_ru' => 'Регулярно хожу сюда на деловые обеды уже три года. Кухня неизменно высокого уровня, персонал всегда помнит мои предпочтения. Лучший бизнес-ланч в Москве по соотношению цена/качество.',
                'text_en' => 'I regularly come here for business lunches for three years now. The cuisine is consistently high quality, the staff always remembers my preferences. The best business lunch in Moscow for value for money.',
                'date_ru' => '28 февраля 2024',
                'date_en' => 'February 28, 2024',
                'status'  => 'approved',
            ],
            [
                'name'    => 'Светлана Новикова',
                'email'   => 'sveta.n@mail.ru',
                'rating'  => 5,
                'text_ru' => 'Были с подругами на воскресный бранч. Атмосфера потрясающая — живая музыка, нарядная публика, вкуснейшие блюда. Круассан с лососем и икрой — просто шедевр. Уже планируем следующий визит!',
                'text_en' => 'We came with friends for Sunday brunch. The atmosphere is stunning — live music, elegant crowd, delicious food. The croissant with salmon and caviar is a masterpiece. We are already planning our next visit!',
                'date_ru' => '25 февраля 2024',
                'date_en' => 'February 25, 2024',
                'status'  => 'approved',
            ],
            [
                'name'    => 'Дмитрий Волков',
                'email'   => 'dmitry.v@yandex.ru',
                'rating'  => 3,
                'text_ru' => 'Кухня хорошая, но для таких цен ожидал большего внимания к деталям. Официант забыл принести хлеб, пришлось напоминать дважды. Десерты отличные, особенно крем-брюле.',
                'text_en' => 'The food is good, but for these prices I expected more attention to detail. The waiter forgot to bring bread, we had to remind him twice. Desserts are excellent, especially the crème brûlée.',
                'date_ru' => '20 февраля 2024',
                'date_en' => 'February 20, 2024',
                'status'  => 'approved',
            ],
            // На модерации
            [
                'name'    => 'Ирина Захарова',
                'email'   => 'irina.z@mail.ru',
                'rating'  => 5,
                'text_ru' => 'Ужинали здесь в честь получения повышения на работе. Это был настоящий праздник! Стейк рибай — один из лучших, что я пробовала. Обслуживание на уровне пятизвёздочного отеля.',
                'text_en' => 'We dined here to celebrate a work promotion. It was a real celebration! The ribeye steak is one of the best I have ever had. Service at the level of a five-star hotel.',
                'date_ru' => '18 марта 2024',
                'date_en' => 'March 18, 2024',
                'status'  => 'pending',
            ],
            [
                'name'    => 'Николай Семёнов',
                'email'   => 'kolia.s@gmail.com',
                'rating'  => 4,
                'text_ru' => 'Хороший ресторан, ходим сюда уже несколько лет. Новое весеннее меню понравилось, особенно суп из белых грибов. Немного расстроили изменившиеся порции — стали чуть меньше, чем раньше.',
                'text_en' => 'Good restaurant, we have been coming here for several years. We liked the new spring menu, especially the porcini mushroom soup. Slightly disappointed by the changed portions — they became a bit smaller than before.',
                'date_ru' => '16 марта 2024',
                'date_en' => 'March 16, 2024',
                'status'  => 'pending',
            ],
            // Отклонённый
            [
                'name'    => 'Анонимный гость',
                'email'   => null,
                'rating'  => 1,
                'text_ru' => 'Купите рекламу здесь www.spam-site.ru скидки и акции',
                'text_en' => 'Buy ads here www.spam-site.ru',
                'date_ru' => '1 марта 2024',
                'date_en' => 'March 1, 2024',
                'status'  => 'rejected',
            ],
        ];

        foreach ($reviews as $review) {
            Review::create($review);
        }
    }
}
