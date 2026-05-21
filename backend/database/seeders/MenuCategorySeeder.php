<?php

namespace Database\Seeders;

use App\Models\MenuCategory;
use Illuminate\Database\Seeder;

class MenuCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['slug' => 'breakfast', 'title_ru' => 'Завтраки',       'title_en' => 'Breakfast',   'sort_order' => 1],
            ['slug' => 'cold',      'title_ru' => 'Холодные закуски','title_en' => 'Cold Starters','sort_order' => 2],
            ['slug' => 'salads',    'title_ru' => 'Салаты',          'title_en' => 'Salads',      'sort_order' => 3],
            ['slug' => 'soups',     'title_ru' => 'Супы',            'title_en' => 'Soups',       'sort_order' => 4],
            ['slug' => 'hot',       'title_ru' => 'Горячие блюда',   'title_en' => 'Hot Dishes',  'sort_order' => 5],
            ['slug' => 'grill',     'title_ru' => 'Гриль',           'title_en' => 'Grill',       'sort_order' => 6],
            ['slug' => 'pasta',     'title_ru' => 'Паста и ризотто', 'title_en' => 'Pasta & Risotto','sort_order' => 7],
            ['slug' => 'desserts',  'title_ru' => 'Десерты',         'title_en' => 'Desserts',    'sort_order' => 8],
            ['slug' => 'wine',      'title_ru' => 'Винная карта',    'title_en' => 'Wine List',   'sort_order' => 9],
            ['slug' => 'drinks',    'title_ru' => 'Напитки',         'title_en' => 'Beverages',   'sort_order' => 10],
        ];

        foreach ($categories as $cat) {
            MenuCategory::create($cat);
        }
    }
}
