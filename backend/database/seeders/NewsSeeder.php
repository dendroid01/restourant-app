<?php

namespace Database\Seeders;

use App\Models\News;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        $news = [
            [
                'title_ru'    => 'Весеннее меню 2024: природа в каждом блюде',
                'title_en'    => 'Spring Menu 2024: Nature in Every Dish',
                'date_ru'     => '15 марта 2024',
                'date_en'     => 'March 15, 2024',
                'excerpt_ru'  => '<p>Шеф-повар Жан-Пьер Дюбуа представляет новое весеннее меню, вдохновлённое первыми проталинами и пробуждением природы. Молодые побеги черемши, первая спаржа и весенние ягоды — основа обновлённой карты.</p>',
                'excerpt_en'  => '<p>Chef Jean-Pierre Dubois presents a new spring menu inspired by the first thaws and the awakening of nature. Young ramson shoots, first asparagus and spring berries form the basis of the updated menu.</p>',
                'content_ru'  => '<h2>Весна на тарелке</h2><p>Каждый год с приходом весны наш шеф-повар отправляется на рынки и к фермерам в поисках первых сезонных продуктов. В этом году акцент сделан на русских дикоросах — черемше, крапиве, сморчках — в сочетании с французской техникой приготовления.</p><h2>Новинки меню</h2><p>Среди главных новинок — суп-крем из молодой крапивы с яйцом пашот и трюфельным маслом, тартар из ягнёнка со спаржой и пюре из черемши, а также десерт «Весенний луг» — мусс из кислицы с гелем из берёзового сока.</p><p>Специальное предложение действует по 31 мая включительно.</p>',
                'content_en'  => '<h2>Spring on a Plate</h2><p>Every year with the arrival of spring, our chef visits markets and farmers in search of the first seasonal products. This year the focus is on Russian wild plants — ramson, nettles, morels — combined with French cooking techniques.</p><h2>Menu Novelties</h2><p>Among the main new items are young nettle cream soup with poached egg and truffle oil, lamb tartare with asparagus and ramson purée, and the "Spring Meadow" dessert — sorrel mousse with birch sap gel.</p>',
                'image'       => 'https://picsum.photos/1200/600?random=201',
                'image_thumb' => 'https://picsum.photos/400/250?random=201',
                'tags'        => ['меню', 'весна', 'шеф'],
                'status'      => 'published',
            ],
            [
                'title_ru'    => 'Открытие ресторана в Санкт-Петербурге',
                'title_en'    => 'Restaurant Opening in Saint Petersburg',
                'date_ru'     => '1 февраля 2024',
                'date_en'     => 'February 1, 2024',
                'excerpt_ru'  => '<p>С гордостью объявляем об открытии нашего первого ресторана в Санкт-Петербурге. Исторический особняк на Невском проспекте принял первых гостей 1 февраля.</p>',
                'excerpt_en'  => '<p>We are proud to announce the opening of our first restaurant in Saint Petersburg. The historic mansion on Nevsky Prospekt welcomed its first guests on February 1st.</p>',
                'content_ru'  => '<h2>Петербург давно ждал нас</h2><p>Петербург — город с богатейшей гастрономической историей, и мы счастливы стать его частью. Для петербургского ресторана мы разработали специальное меню, которое отражает характер города: в нём есть блюда из невской рыбы, знаменитый петербургский рассольник и авторские десерты с нотами белых ночей.</p><h2>Торжественное открытие</h2><p>На церемонии открытия присутствовали более 150 гостей, в том числе известные петербургские рестораторы, журналисты и представители городской администрации. Вечер украсило выступление квартета из Мариинского театра.</p>',
                'content_en'  => '<h2>St. Petersburg Has Long Awaited Us</h2><p>St. Petersburg is a city with the richest gastronomic history, and we are happy to become part of it. For the St. Petersburg restaurant we developed a special menu that reflects the character of the city.</p>',
                'image'       => 'https://picsum.photos/1200/600?random=202',
                'image_thumb' => 'https://picsum.photos/400/250?random=202',
                'tags'        => ['открытие', 'спб', 'события'],
                'status'      => 'published',
            ],
            [
                'title_ru'    => 'Звезда Мишлен 2024: мы в гиде!',
                'title_en'    => 'Michelin Star 2024: We Are in the Guide!',
                'date_ru'     => '20 января 2024',
                'date_en'     => 'January 20, 2024',
                'excerpt_ru'  => '<p>Ресторан La Belle Époque на Тверской включён в гид Мишлен 2024 и удостоен одной звезды. Это признание многолетнего труда всей нашей команды.</p>',
                'excerpt_en'  => '<p>La Belle Époque on Tverskaya has been included in the Michelin Guide 2024 and awarded one star. This is recognition of the many years of work of our entire team.</p>',
                'content_ru'  => '<h2>История нашей звезды</h2><p>Путь к звезде занял семь лет. Шеф-повар Жан-Пьер Дюбуа, узнав о награде, сказал: «Эта звезда принадлежит всем нам — поварам, официантам, мойщикам посуды. Без каждого из вас её бы не было».</p><p>В ближайшие месяцы мы планируем специальные ужины в честь получения звезды. Следите за нашими новостями!</p>',
                'content_en'  => '<h2>Our Star Story</h2><p>The journey to the star took seven years. Chef Jean-Pierre Dubois, upon learning of the award, said: "This star belongs to all of us — cooks, waiters, dishwashers. Without each of you it would not exist."</p>',
                'image'       => 'https://picsum.photos/1200/600?random=203',
                'image_thumb' => 'https://picsum.photos/400/250?random=203',
                'tags'        => ['мишлен', 'награда', 'достижения'],
                'status'      => 'published',
            ],
            [
                'title_ru'    => 'Мастер-классы по французской выпечке',
                'title_en'    => 'French Pastry Masterclasses',
                'date_ru'     => '10 января 2024',
                'date_en'     => 'January 10, 2024',
                'excerpt_ru'  => '<p>Каждую субботу в феврале наш шеф-кондитер Алексей Волков проводит мастер-классы по французской выпечке. Круассаны, эклеры, макарон — научитесь готовить их дома.</p>',
                'excerpt_en'  => '<p>Every Saturday in February, our pastry chef Alexei Volkov holds masterclasses in French pastry. Croissants, éclairs, macarons — learn to make them at home.</p>',
                'content_ru'  => '<h2>Программа мастер-классов</h2><p>Каждый мастер-класс рассчитан на 4 часа и вмещает до 12 участников. Вы не только научитесь готовить классические французские изделия, но и узнаете секреты работы с тестом, темперирования шоколада и создания идеального заварного крема.</p><p>В конце каждого занятия — совместное чаепитие с дегустацией всего приготовленного.</p><p>Стоимость участия: 8 500 ₽ с человека. Бронирование по телефону или на сайте.</p>',
                'content_en'  => '<h2>Masterclass Program</h2><p>Each masterclass is designed for 4 hours and accommodates up to 12 participants. You will not only learn to make classic French pastries, but also discover the secrets of working with dough, tempering chocolate and creating the perfect custard.</p>',
                'image'       => 'https://picsum.photos/1200/600?random=204',
                'image_thumb' => 'https://picsum.photos/400/250?random=204',
                'tags'        => ['мастер-класс', 'выпечка', 'события'],
                'status'      => 'published',
            ],
            [
                'title_ru'    => 'Новогодний банкет 2024: программа вечера',
                'title_en'    => 'New Year Banquet 2024: Evening Programme',
                'date_ru'     => '15 декабря 2023',
                'date_en'     => 'December 15, 2023',
                'excerpt_ru'  => '<p>Встречайте Новый год в La Belle Époque! Праздничный ужин, живая музыка, шоу-программа и бокал шампанского в полночь. Билеты раскупаются быстро.</p>',
                'excerpt_en'  => '<p>Welcome the New Year at La Belle Époque! Festive dinner, live music, show programme and a glass of champagne at midnight. Tickets are selling fast.</p>',
                'content_ru'  => '<h2>Программа новогодней ночи</h2><p>20:00 — сбор гостей, приветственные канапе и шампанское<br>21:00 — начало праздничного ужина (8 блюд)<br>23:00 — джазовое шоу квартета «Золотая осень»<br>00:00 — бокал шампанского, фейерверк на террасе<br>01:00 — продолжение вечера, танцевальная программа</p><p>Стоимость: 25 000 ₽ с человека, всё включено.</p>',
                'content_en'  => '<h2>New Year\'s Night Programme</h2><p>8:00 PM — guests arrive, welcome canapés and champagne<br>9:00 PM — festive dinner begins (8 courses)<br>11:00 PM — jazz show<br>12:00 AM — champagne toast, terrace fireworks</p>',
                'image'       => 'https://picsum.photos/1200/600?random=205',
                'image_thumb' => 'https://picsum.photos/400/250?random=205',
                'tags'        => ['новый год', 'банкет', 'события'],
                'status'      => 'published',
            ],
            [
                'title_ru'    => 'Летняя терраса открыта',
                'title_en'    => 'Summer Terrace is Open',
                'date_ru'     => '1 мая 2024',
                'date_en'     => 'May 1, 2024',
                'excerpt_ru'  => '<p>С 1 мая открываем летнюю террасу ресторана на Патриарших. Обед с видом на пруды, вечерние коктейли и специальное летнее меню от шефа.</p>',
                'excerpt_en'  => '<p>From May 1st we open the summer terrace of the restaurant at Patriarshiye Ponds. Lunch with a view of the ponds, evening cocktails and a special summer menu from the chef.</p>',
                'content_ru'  => '<h2>Лето у Патриарших</h2><p>Летняя терраса — одно из самых романтичных мест Москвы. 40 посадочных мест с видом на воду, зелёные зонты, живые цветы на каждом столике. Специально для террасы мы разработали облегчённое летнее меню: охлаждённые супы, свежие морепродукты, лёгкие десерты.</p>',
                'content_en'  => '<h2>Summer at Patriarshiye</h2><p>The summer terrace is one of the most romantic spots in Moscow. 40 seats overlooking the water, green umbrellas, fresh flowers on every table. We developed a special light summer menu for the terrace: cold soups, fresh seafood, light desserts.</p>',
                'image'       => 'https://picsum.photos/1200/600?random=206',
                'image_thumb' => 'https://picsum.photos/400/250?random=206',
                'tags'        => ['терраса', 'лето', 'патриаршие'],
                'status'      => 'draft', // черновик
            ],
        ];

        foreach ($news as $item) {
            News::create($item);
        }
    }
}
