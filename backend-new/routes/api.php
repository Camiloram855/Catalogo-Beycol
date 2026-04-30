<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\PedidoController;
use App\Http\Controllers\Api\SiteTextController;
use App\Http\Controllers\Api\ProductImageController;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {
    // Products (public - only active)
    Route::get('/products', [ProductController::class, 'indexPublic']);
    Route::get('/products/{product}', [ProductController::class, 'showPublic']);

    // Categories (public)
    Route::get('/categories', [CategoryController::class, 'index']);

    // Site texts (public)
    Route::get('/site-texts', [SiteTextController::class, 'index']);
    Route::post('/pedidos', [PedidoController::class, 'store']);

    /*
    |--------------------------------------------------------------------------
    | Auth Routes
    |--------------------------------------------------------------------------
    */
    Route::post('/auth/login', [AdminAuthController::class, 'login']);

    /*
    |--------------------------------------------------------------------------
    | Protected Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AdminAuthController::class, 'me']);
        Route::post('/auth/logout', [AdminAuthController::class, 'logout']);

        // Products CRUD (admin)
        Route::get('/admin/products', [ProductController::class, 'index']);        // ← agrega
        Route::get('/admin/products/{product}', [ProductController::class, 'show']); // ← agrega
        Route::apiResource('products', ProductController::class)->except(['index', 'show']);

        // Product Images
        Route::post('/products/{product}/images', [ProductImageController::class, 'store']);
        Route::delete('/products/{product}/images/{image}', [ProductImageController::class, 'destroy']);
        Route::patch('/products/{product}/images/{image}/primary', [ProductImageController::class, 'setPrimary']);

        // Categories CRUD
        Route::apiResource('categories', CategoryController::class)->except(['index', 'show']);

        // Site texts
        Route::put('/site-texts', [SiteTextController::class, 'bulkUpdate']);
        Route::patch('/site-texts/{key}', [SiteTextController::class, 'update']);
        Route::post('/site-texts/hero-background', [SiteTextController::class, 'uploadHeroBackground']);
        Route::post('/site-texts/promo-card', [SiteTextController::class, 'uploadPromoCard']);
    });
});
