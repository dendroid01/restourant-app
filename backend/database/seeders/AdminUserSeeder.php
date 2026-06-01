<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Администратор',
            'email' => 'admin@example.com',
            'password' => bcrypt('qwerty123!'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        User::create([
            'name' => 'Менеджер',
            'email' => 'manager@example.com',
            'password' => bcrypt('qwerty123!'),
            'role' => 'manager',
            'is_active' => true,
        ]);
    }
}
