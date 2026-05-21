<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            RestaurantSeeder::class,
            MenuCategorySeeder::class,
            MenuItemSeeder::class,
            NewsSeeder::class,
            ReviewSeeder::class,
            OrderSeeder::class,
            PageSeeder::class,
        ]);
    }
}
