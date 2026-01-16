<?php
/**
 * Cars Routes - API v1
 * All car-related endpoints
 */

return function($uri, $method, $db, $carService, $imagesController, $videosController) {
    
    // GET /cars - List all cars
    if (preg_match('#^/cars$#', $uri) && $method === 'GET') {
        $filters = [
            'search' => $_GET['search'] ?? null,
            'brand' => $_GET['brand'] ?? null,
            'condition' => $_GET['condition'] ?? null,
            'year' => $_GET['year'] ?? null,
            'minPrice' => $_GET['minPrice'] ?? null,
            'maxPrice' => $_GET['maxPrice'] ?? null,
            'sortBy' => $_GET['sortBy'] ?? 'newest',
            'status' => $_GET['status'] ?? null,
            'featured' => isset($_GET['featured']) ? filter_var($_GET['featured'], FILTER_VALIDATE_BOOLEAN) : null,
            'page' => $_GET['page'] ?? 1,
            'perPage' => $_GET['perPage'] ?? 12
        ];
        
        try {
            $result = $carService->getAllCars($filters);
            header('Cache-Control: public, max-age=60');
            Response::paginated($result['cars'], $result['total'], $result['page'], $result['perPage']);
        } catch (PDOException $e) {
            error_log("Cars::getAll error: " . $e->getMessage());
            Response::error('حدث خطأ في جلب السيارات', 500, 'SRV_001');
        }
        return true;
    }

    // GET /cars/:id - Get car by ID
    if (preg_match('#^/cars/(\d+)$#', $uri, $matches) && $method === 'GET') {
        try {
            $car = $carService->getCarById((int)$matches[1]);
            if (!$car) {
                Response::error('السيارة غير موجودة', 404, 'CAR_001');
            }
            Response::success($car);
        } catch (PDOException $e) {
            Response::error('حدث خطأ في جلب بيانات السيارة', 500, 'SRV_001');
        }
        return true;
    }

    // POST /cars/:id/view - Increment view count
    if (preg_match('#^/cars/(\d+)/view$#', $uri, $matches) && $method === 'POST') {
        try {
            $carService->incrementViewCount((int)$matches[1]);
            Response::success(['message' => 'تم تحديث عداد المشاهدات']);
        } catch (PDOException $e) {
            Response::error('حدث خطأ', 500, 'SRV_001');
        }
        return true;
    }

    // GET /brands - Get all brands
    if (preg_match('#^/brands$#', $uri) && $method === 'GET') {
        try {
            $brands = $carService->getBrands();
            Response::success($brands);
        } catch (PDOException $e) {
            Response::error('حدث خطأ في جلب العلامات التجارية', 500, 'SRV_001');
        }
        return true;
    }

    // ==================== Protected Routes ====================

    // POST /cars - Create car
    if (preg_match('#^/cars$#', $uri) && $method === 'POST') {
        AuthMiddleware::authenticate();
        if (!RateLimiter::check('upload')) exit;
        
        try {
            $data = Response::getJsonInput();
            $car = $carService->createCar($data);
            Response::success($car, 201);
        } catch (ValidationException $e) {
            Response::error($e->getMessage(), 400, 'VAL_001', $e->getErrors());
        } catch (PDOException $e) {
            error_log("Cars::create error: " . $e->getMessage());
            Response::error('حدث خطأ في إضافة السيارة', 500, 'SRV_001');
        }
        return true;
    }

    // PUT /cars/:id - Update car
    if (preg_match('#^/cars/(\d+)$#', $uri, $matches) && $method === 'PUT') {
        AuthMiddleware::authenticate();
        
        try {
            $data = Response::getJsonInput();
            $car = $carService->updateCar((int)$matches[1], $data);
            Response::success($car);
        } catch (NotFoundException $e) {
            Response::error($e->getMessage(), 404, 'CAR_001');
        } catch (ValidationException $e) {
            Response::error($e->getMessage(), 400, 'VAL_001', $e->getErrors());
        } catch (PDOException $e) {
            error_log("Cars::update error: " . $e->getMessage());
            Response::error('حدث خطأ في تحديث السيارة', 500, 'SRV_001');
        }
        return true;
    }

    // DELETE /cars/:id - Delete car
    if (preg_match('#^/cars/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
        AuthMiddleware::authenticate();
        
        try {
            $carService->deleteCar((int)$matches[1]);
            Response::success(['message' => 'تم حذف السيارة بنجاح']);
        } catch (NotFoundException $e) {
            Response::error($e->getMessage(), 404, 'CAR_001');
        } catch (PDOException $e) {
            Response::error('حدث خطأ في حذف السيارة', 500, 'SRV_001');
        }
        return true;
    }

    // PUT /cars/:id/featured - Toggle featured
    if (preg_match('#^/cars/(\d+)/featured$#', $uri, $matches) && $method === 'PUT') {
        AuthMiddleware::authenticate();
        
        try {
            $car = $carService->toggleFeatured((int)$matches[1]);
            Response::success($car);
        } catch (NotFoundException $e) {
            Response::error($e->getMessage(), 404, 'CAR_001');
        } catch (PDOException $e) {
            Response::error('حدث خطأ', 500, 'SRV_001');
        }
        return true;
    }

    // PUT /cars/:id/status - Update status
    if (preg_match('#^/cars/(\d+)/status$#', $uri, $matches) && $method === 'PUT') {
        AuthMiddleware::authenticate();
        
        try {
            $data = Response::getJsonInput();
            if (!isset($data['status'])) {
                Response::error('الحالة مطلوبة', 400, 'VAL_001');
            }
            $car = $carService->updateStatus((int)$matches[1], $data['status']);
            Response::success($car);
        } catch (NotFoundException $e) {
            Response::error($e->getMessage(), 404, 'CAR_001');
        } catch (ValidationException $e) {
            Response::error($e->getMessage(), 400, 'VAL_001');
        } catch (PDOException $e) {
            Response::error('حدث خطأ', 500, 'SRV_001');
        }
        return true;
    }

    // POST /cars/:id/images - Upload images
    if (preg_match('#^/cars/(\d+)/images$#', $uri, $matches) && $method === 'POST') {
        AuthMiddleware::authenticate();
        if (!RateLimiter::check('upload')) exit;
        $imagesController->upload((int)$matches[1]);
        return true;
    }

    // DELETE /cars/:id/images/:imageId - Delete image
    if (preg_match('#^/cars/(\d+)/images/(\d+)$#', $uri, $matches) && $method === 'DELETE') {
        AuthMiddleware::authenticate();
        $imagesController->delete((int)$matches[2]);
        return true;
    }

    // PUT /cars/:id/images/reorder - Reorder images
    if (preg_match('#^/cars/(\d+)/images/reorder$#', $uri, $matches) && $method === 'PUT') {
        AuthMiddleware::authenticate();
        $imagesController->reorder((int)$matches[1]);
        return true;
    }

    // POST /cars/:id/video - Add video
    if (preg_match('#^/cars/(\d+)/video$#', $uri, $matches) && $method === 'POST') {
        AuthMiddleware::authenticate();
        if (!RateLimiter::check('upload')) exit;
        $videosController->add((int)$matches[1]);
        return true;
    }

    // DELETE /cars/:id/video - Delete video
    if (preg_match('#^/cars/(\d+)/video$#', $uri, $matches) && $method === 'DELETE') {
        AuthMiddleware::authenticate();
        $videosController->deleteForCar((int)$matches[1]);
        return true;
    }

    return false; // Route not handled
};
