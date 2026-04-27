<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\SiteText;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::updateOrCreate(
            ['email' => 'admin@catalogo.com'],
            [
                'name' => 'Administrador',
                'password' => Hash::make('password'),
                'is_admin' => true,
                'email_verified_at' => now(),
            ]
        );

        // Default site texts
        $texts = [
            ['key' => 'brand_name', 'value' => 'BEYCOL', 'description' => 'Nombre de la marca'],
            ['key' => 'tagline', 'value' => 'Calidad que se nota', 'description' => 'Eslogan'],
            ['key' => 'hero_badge', 'value' => 'Nuevos productos disponibles', 'description' => 'Badge del hero'],
            ['key' => 'hero_title', 'value' => 'Descubre nuestra colección', 'description' => 'Título principal del hero'],
            ['key' => 'hero_subtitle', 'value' => 'Productos cuidadosamente seleccionados para ofrecerte la mejor experiencia.', 'description' => 'Subtítulo del hero'],
            ['key' => 'hero_background_image', 'value' => '', 'description' => 'URL de imagen de fondo del hero'],
            ['key' => 'hero_background_public_id', 'value' => '', 'description' => 'Public ID de Cloudinary para la portada del hero'],
            ['key' => 'featured_title', 'value' => 'Productos destacados', 'description' => 'Título de sección de destacados'],
            ['key' => 'footer_description', 'value' => 'Tu tienda de confianza para productos de calidad.', 'description' => 'Texto del footer'],
            ['key' => 'contact_email', 'value' => 'beilyyurani200@gmail.com', 'description' => 'Email de contacto'],
            ['key' => 'contact_phone', 'value' => '3223397243', 'description' => 'Teléfono de contacto'],
        ];

        foreach ($texts as $text) {
            SiteText::updateOrCreate(['key' => $text['key']], $text);
        }

        // Sample categories
        $categories = [
            ['name' => 'Accesorios', 'description' => 'Complementos y accesorios'],
            ['name' => 'Hogar', 'description' => 'Artículos para el hogar'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['name' => $cat['name']], $cat);
        }

        // Sample products
        $sampleCategories = Category::all();

        $products = [
            ['name' => 'Camisa de lino', 'description' => 'Camisa confeccionada en 100% lino natural, perfecta para el verano.', 'price' => 89.99, 'is_featured' => true, 'is_active' => true],
        ];

        foreach ($products as $i => $product) {
            $category = $sampleCategories->random();
            Product::updateOrCreate(
                ['name' => $product['name']],
                array_merge($product, [
                    'category_id' => $category->id,
                    'stock' => rand(5, 50),
                    'sort_order' => $i,
                ])
            );
        }

        $this->command->info('✅ Seeder ejecutado correctamente.');
        $this->command->info('📧 Admin: admin@catalogo.com | 🔑 Contraseña: password');
    }
}


