<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\News;
use App\Models\Restaurant;
use App\Models\RestaurantGallery;
use App\Models\MenuItem;
use App\Models\MenuCategory;
use App\Models\Review;
use App\Models\Booking;
use App\Models\EventRequest;
use App\Models\EventRequestItem;
use App\Models\ContactMessage;
use App\Models\User;
use Carbon\Carbon;

class DashboardDemoSeeder extends Seeder
{
    public function run(): void
    {
        // Создаем админа если нет
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Администратор',
                'email' => 'admin@example.com',
                'password' => bcrypt('qwerty123!'),
                'role' => 'admin',
                'is_active' => true,
                'permissions' => ['news', 'menu', 'reviews', 'orders', 'restaurants', 'messages', 'pages','contacts']
            ]
        );

        // ========== НОВОСТИ ==========
        $newsStatuses = ['published', 'published', 'published', 'draft', 'published', 'draft'];
        $newsTitles = [
            'Открытие нового ресторана в центре города',
            'Летнее меню 2025: свежие вкусы',
            'Мастер-класс от шеф-повара',
            'Скидка 20% на банкеты',
            'Новый десерт от кондитера',
            'Ресторан года по версии журнала'
        ];

        foreach ($newsTitles as $i => $title) {
            News::create([
                'author_id' => $admin->id,
                'title_ru' => $title,
                'title_en' => $title,
                'excerpt_ru' => 'Краткое описание новости ' . ($i + 1),
                'excerpt_en' => 'Short news description ' . ($i + 1),
                'content_ru' => 'Полное содержание новости номер ' . ($i + 1) . '. Здесь много текста о событиях и акциях.',
                'content_en' => 'Full news content number ' . ($i + 1),
                'image_thumb' => 'https://picsum.photos/id/' . (100 + $i) . '/400/300',
                'image_full' => 'https://picsum.photos/id/' . (100 + $i) . '/1200/800',
                'published_at' => $newsStatuses[$i] === 'published' ? Carbon::now()->subDays(rand(1, 30)) : null,
                'status' => $newsStatuses[$i],
                'tags' => ['новости', 'акции']
            ]);
        }

        // ========== РЕСТОРАНЫ ==========
        $restaurants = [];
        $restaurantData = [
            ['name_ru' => 'Grand Cru', 'name_en' => 'Grand Cru', 'address_ru' => 'ул. Ленина, 15', 'phone' => '+7 123 456-78-90', 'hours_ru' => '12:00 - 23:00', 'hours_en' => '12:00 - 23:00'],
            ['name_ru' => 'Прованс', 'name_en' => 'Provence', 'address_ru' => 'пр. Мира, 42', 'phone' => '+7 123 456-78-91', 'hours_ru' => '11:00 - 22:00', 'hours_en' => '11:00 - 22:00'],
            ['name_ru' => 'Восточный базар', 'name_en' => 'Oriental Bazaar', 'address_ru' => 'ул. Пушкина, 8', 'phone' => '+7 123 456-78-92', 'hours_ru' => '12:00 - 00:00', 'hours_en' => '12:00 - 00:00'],
        ];

        foreach ($restaurantData as $i => $data) {
            $restaurant = Restaurant::create([
                ...$data,
                'description_ru' => 'Описание ресторана ' . $data['name_ru'],
                'description_en' => 'Description of ' . $data['name_en'],
                'address_en' => $data['address_ru'],
                'lat' => 55.75 + (rand(0, 100) / 1000),
                'lng' => 37.62 + (rand(0, 100) / 1000),
                'order' => $i,
                'status' => $i < 2 ? 'active' : 'inactive'
            ]);

            // Галерея
            RestaurantGallery::create([
                'restaurant_id' => $restaurant->id,
                'image_url' => 'https://picsum.photos/id/' . (200 + $i) . '/800/600',
                'order' => 0
            ]);

            $restaurants[] = $restaurant;
        }

        // ========== КАТЕГОРИИ МЕНЮ ==========
        $categories = [];
        $categoryData = [
            ['title_ru' => 'Закуски', 'title_en' => 'Starters', 'order' => 1],
            ['title_ru' => 'Супы', 'title_en' => 'Soups', 'order' => 2],
            ['title_ru' => 'Горячие блюда', 'title_en' => 'Main Courses', 'order' => 3],
            ['title_ru' => 'Десерты', 'title_en' => 'Desserts', 'order' => 4],
            ['title_ru' => 'Напитки', 'title_en' => 'Drinks', 'order' => 5],
        ];

        foreach ($categoryData as $cat) {
            $categories[] = MenuCategory::create([
                ...$cat,
                'slug' => strtolower(str_replace(' ', '_', $cat['title_ru'])),
                'is_active' => true
            ]);
        }

        // ========== БЛЮДА ==========
        $dishes = [
            ['title_ru' => 'Карпаччо', 'price' => 450, 'is_featured' => true],
            ['title_ru' => 'Цезарь с курицей', 'price' => 380, 'is_featured' => true],
            ['title_ru' => 'Борщ', 'price' => 250, 'is_featured' => false],
            ['title_ru' => 'Стейк Рибай', 'price' => 1200, 'is_featured' => true],
            ['title_ru' => 'Паста Карбонара', 'price' => 420, 'is_featured' => false],
            ['title_ru' => 'Тирамису', 'price' => 320, 'is_featured' => true],
            ['title_ru' => 'Чизкейк', 'price' => 280, 'is_featured' => false],
            ['title_ru' => 'Морс клюквенный', 'price' => 180, 'is_featured' => false],
            ['title_ru' => 'Лимонад', 'price' => 200, 'is_featured' => false],
            ['title_ru' => 'Утиная грудка', 'price' => 890, 'is_featured' => true],
        ];

        foreach ($dishes as $i => $dish) {
            MenuItem::create([
                'category_id' => $categories[$i % count($categories)]->id,
                'title_ru' => $dish['title_ru'],
                'title_en' => $dish['title_ru'],
                'description_ru' => 'Вкуснейшее блюдо ' . $dish['title_ru'],
                'description_en' => 'Delicious ' . $dish['title_ru'],
                'price' => $dish['price'],
                'image' => 'https://picsum.photos/id/' . (300 + $i) . '/400/300',
                'is_featured' => $dish['is_featured'],
                'is_available_for_events' => rand(0, 1),
                'is_active' => true
            ]);
        }

        // ========== ОТЗЫВЫ ==========
        $reviewStatuses = ['pending', 'approved', 'approved', 'pending', 'approved', 'rejected', 'approved', 'pending'];
        $reviewNames = ['Анна', 'Михаил', 'Елена', 'Дмитрий', 'Ольга', 'Сергей', 'Татьяна', 'Алексей'];
        $reviewTexts = [
            'Отличный ресторан, все очень вкусно!',
            'Обслуживание на высоте, интерьер шикарный',
            'Ждали блюдо 40 минут, разочарован',
            'Лучшее место в городе, рекомендую!',
            'Немного дороговато, но качество отличное',
            'Официант забыл про наш заказ',
            'Атмосфера волшебная, вернусь еще',
            'Вегетарианские блюда - пальчики оближешь'
        ];

        foreach ($reviewNames as $i => $name) {
            $status = $reviewStatuses[$i % count($reviewStatuses)];
            $review = Review::create([
                'name' => $name,
                'email' => strtolower($name) . '@example.com',
                'rating' => rand(3, 5),
                'text_ru' => $reviewTexts[$i % count($reviewTexts)],
                'text_en' => $reviewTexts[$i % count($reviewTexts)],
                'ip_address' => '127.0.0.1',
                'status' => $status,
                'approved_at' => $status === 'approved' ? Carbon::now()->subDays(rand(1, 30)) : null,
                'approved_by' => $status === 'approved' ? $admin->id : null,
            ]);
        }

        // ========== БРОНИРОВАНИЯ (ЗАКАЗЫ) ==========
        $bookingStatuses = ['new', 'new', 'processing', 'confirmed', 'new', 'cancelled', 'confirmed', 'processing'];
        $clientNames = ['Иван Петров', 'Мария Сидорова', 'Алексей Козлов', 'Наталья Воробьева', 'Денис Морозов', 'Екатерина Громова'];

        foreach ($clientNames as $i => $name) {
            Booking::create([
                'restaurant_id' => $restaurants[array_rand($restaurants)]->id,
                'client_name' => $name,
                'phone' => '+7 999 ' . rand(100, 999) . '-' . rand(10, 99) . '-' . rand(10, 99),
                'email' => strtolower(str_replace(' ', '_', $name)) . '@example.com',
                'date' => Carbon::now()->addDays(rand(-10, 20)),
                'time' => rand(12, 22) . ':00',
                'guests' => rand(2, 8),
                'wishes' => rand(0, 1) ? 'Окно у окна, пожалуйста' : null,
                'status' => $bookingStatuses[$i % count($bookingStatuses)],
                'admin_comment' => null
            ]);
        }

        // ========== МЕРОПРИЯТИЯ ==========
        $eventStatuses = ['new', 'processing', 'confirmed', 'new', 'cancelled'];
        $eventClients = ['ООО Ромашка', 'ИП Иванов', 'ЗАО Альфа', 'Свадьба Сергея', 'Корпоратив Газпром'];

        // Получаем блюда для мероприятий
        $eventDishes = MenuItem::where('is_available_for_events', true)->take(5)->get();

        foreach ($eventClients as $i => $clientName) {
            $event = EventRequest::create([
                'restaurant_id' => $restaurants[array_rand($restaurants)]->id,
                'client_name' => $clientName,
                'phone' => '+7 999 ' . rand(100, 999) . '-' . rand(10, 99) . '-' . rand(10, 99),
                'email' => strtolower(str_replace(' ', '_', $clientName)) . '@example.com',
                'date' => Carbon::now()->addDays(rand(5, 45)),
                'guests' => rand(10, 100),
                'wishes' => 'Просьба организовать живу музыку',
                'total_price_per_person' => 0,
                'total_price' => 0,
                'status' => $eventStatuses[$i % count($eventStatuses)],
                'admin_comment' => null
            ]);

            // Добавляем позиции меню к мероприятию
            foreach ($eventDishes as $dish) {
                EventRequestItem::create([
                    'event_request_id' => $event->id,
                    'menu_item_id' => $dish->id,
                    'quantity' => rand(1, 3)
                ]);
            }

            // Пересчитываем сумму
            $event->recalculateTotal();
            $event->save();
        }

        // ========== СООБЩЕНИЯ ИЗ КОНТАКТОВ ==========
        $messageStatuses = [false, false, true, false, true];
        $messageNames = ['Клиент 1', 'Потенциальный партнер', 'Посетитель', 'Заявка на сотрудничество', 'Вопрос по меню'];
        $messageTexts = [
            'Хочу забронировать столик на 15 июня',
            'Предлагаю сотрудничество для проведения банкета',
            'Есть ли у вас вегетарианские блюда?',
            'Возможна ли доставка?',
            'Когда будет обновлено меню?'
        ];

        foreach ($messageNames as $i => $name) {
            ContactMessage::create([
                'name' => $name,
                'email' => 'contact' . ($i + 1) . '@example.com',
                'phone' => '+7 999 ' . rand(100, 999) . '-' . rand(10, 99) . '-' . rand(10, 99),
                'message' => $messageTexts[$i % count($messageTexts)],
                'is_read' => $messageStatuses[$i % count($messageStatuses)]
            ]);
        }

        $this->command->info('✅ Dashboard demo data seeded successfully!');
        $this->command->info('📊 Статистика:');
        $this->command->info('   - Новостей: ' . News::count());
        $this->command->info('   - Ресторанов: ' . Restaurant::count());
        $this->command->info('   - Блюд в меню: ' . MenuItem::count());
        $this->command->info('   - Отзывов: ' . Review::count() . ' (pending: ' . Review::where('status', 'pending')->count() . ')');
        $this->command->info('   - Бронирований: ' . Booking::count() . ' (new: ' . Booking::where('status', 'new')->count() . ')');
        $this->command->info('   - Мероприятий: ' . EventRequest::count() . ' (new: ' . EventRequest::where('status', 'new')->count() . ')');
        $this->command->info('   - Сообщений: ' . ContactMessage::count() . ' (unread: ' . ContactMessage::where('is_read', false)->count() . ')');
    }
}
