# Feature Enrichment — Attempt 3

Generated: 2026-07-22

Each section is one LLM call (~5–8K tokens). The instruction tells the generator how all files in the feature interact and what contracts they must honour.

---

## Shared Backend

**Name:** `shared-backend`  
**Type:** SHARED  
**Change required:** false

**Files in this feature:**
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/exception/GlobalExceptionHandler.java` — EXCEPTION handler — centrally processes exceptions thrown by controllers and services, mapping them to standardized HTTP responses. Specifically handles `ResourceNotFoundException` and general `Exception`.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/exception/ResourceNotFoundException.java` — CUSTOM EXCEPTION — an unchecked exception indicating that a requested resource does not exist.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/dto/ErrorResponse.java` — DTO — standardizes the structure for error messages returned to clients.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/model/User.java` — MODEL entity — represents a user in the database, including their authentication credentials and role.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/model/Role.java` — MODEL enum — defines the distinct roles a user can have within the application.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/repository/UserRepository.java` — REPOSITORY layer — provides data access operations for `User` entities.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/service/UserService.java` — SERVICE layer — implements `UserDetailsService` for Spring Security, providing user details for authentication.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/util/JwtUtil.java` — UTILITY class — handles the creation, validation, and parsing of JSON Web Tokens (JWTs).
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/security/JwtAuthFilter.java` — SECURITY CONFIGURATION — a Servlet filter that intercepts requests to validate JWTs and establish the user's security context.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/config/SecurityConfig.java` — SECURITY CONFIGURATION — defines the Spring Security filter chain, password encoder, and access rules for API endpoints.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/config/AdminInitializer.java` — CONFIGURATION component — ensures a default admin user exists on application startup.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/config/DataSeeder.java` — CONFIGURATION component — populates the database with initial sample data for development and testing.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/controller/AuthController.java` — CONTROLLER layer — provides API endpoints for user login and registration.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/controller/SpaController.java` — CONTROLLER layer — forwards all non-API requests to the frontend's `index.html` for single-page application routing.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/dto/AuthRequest.java` — DTO — carries user login credentials (username and password) for authentication requests.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/dto/AuthResponse.java` — DTO — encapsulates the JWT returned to the client upon successful authentication.

**Feature Instruction:**

The Shared Backend feature provides foundational services, models, utilities, and configurations essential for the entire Hotel Chul Mutton Baner - Sagar Takawale Group of Hotels application. This includes user authentication and authorization, global exception handling, and database seeding. It defines core entities like `User` and `Role`, and DTOs for authentication (`AuthRequest`, `AuthResponse`, `ErrorResponse`).

**Exception Handling:**
`ResourceNotFoundException.java` is a custom unchecked exception thrown when a requested resource (e.g., a user, a menu item) cannot be found. `GlobalExceptionHandler.java` is a `@RestControllerAdvice` that centrally handles exceptions across all controllers. It specifically catches `ResourceNotFoundException` and maps it to an `ErrorResponse` DTO with an HTTP 404 status code. Other general exceptions are also caught and mapped to a generic `ErrorResponse` with an HTTP 500 status.

**User Management and Authentication:**
`Role.java` is an enum defining user roles: `ADMIN` and `CUSTOMER`. `User.java` is the JPA entity representing a user, containing fields for `id`, `username`, `password`, and `role`. `UserRepository.java` provides standard CRUD operations and a custom method `findByUsername(String username): Optional<User>` to retrieve a user by their username.

`UserService.java` implements Spring Security's `UserDetailsService` interface. Its `loadUserByUsername(String username): UserDetails` method retrieves a `User` from the `UserRepository` and converts it into a Spring Security `UserDetails` object. This service is crucial for Spring Security's authentication process.

`JwtUtil.java` is a utility class responsible for JWT operations. It provides methods:
1. `generateToken(String username): String`: Creates a new JWT for the given username.
2. `validateToken(String token, UserDetails userDetails): Boolean`: Validates a given JWT against the user's details.
3. `extractUsername(String token): String`: Extracts the username from a JWT.

`AuthController.java` exposes REST endpoints for user authentication and registration:
1. `POST /api/auth/login`: Accepts an `AuthRequest` (username, password). It authenticates the user using Spring Security's `AuthenticationManager`, then uses `JwtUtil` to generate a JWT. It returns an `AuthResponse` containing the JWT.
   - Throws `BadCredentialsException` if authentication fails, resulting in HTTP 401.
2. `POST /api/auth/register`: Accepts an `AuthRequest` (username, password). It creates a new `User` with the `CUSTOMER` role, encrypts the password using `PasswordEncoder`, saves the user via `UserRepository`, and then generates and returns a JWT in an `AuthResponse`.
   - Throws `DataIntegrityViolationException` if the username already exists, resulting in HTTP 409.

**Security Configuration:**
`JwtAuthFilter.java` is a `OncePerRequestFilter` that intercepts incoming HTTP requests. It extracts the JWT from the `Authorization` header, validates it using `JwtUtil`, and if valid, sets the user's authentication in the Spring Security context using `UserService.loadUserByUsername()`.

`SecurityConfig.java` configures the Spring Security filter chain. It defines:
- A `PasswordEncoder` bean (e.g., `BCryptPasswordEncoder`).
- An `AuthenticationManager` bean.
- HTTP security rules, specifying which API endpoints require authentication and which roles have access. Public endpoints (like `/api/auth/**`) are permitted without authentication. All other `/api/**` endpoints require authentication. Admin endpoints (`/api/admin/**`) require the `ADMIN` role.
- Adds `JwtAuthFilter` to the security filter chain before `UsernamePasswordAuthenticationFilter`.

**Application Initialization and Data Seeding:**
`AdminInitializer.java` is an `@Component` that runs on application startup. It checks if an admin user exists in the database. If not, it creates a default admin user with a predefined username and password (e.g., `admin`/`adminpass`) and the `ADMIN` role, ensuring the application always has an administrative account.

`DataSeeder.java` is an `@Component` that runs on application startup. It's responsible for populating the database with initial sample data for development and testing purposes. This includes creating sample users, menu items, locations, etc., to provide a functional dataset out-of-the-box.

**Single Page Application (SPA) Support:**
`SpaController.java` is a `@Controller` that handles all non-API routes. It forwards requests to `index.html`, which is the entry point for the React frontend application. This ensures that client-side routing is managed by React Router and deep links work correctly.

**Interactions:**
- `AuthController` uses `UserService` for user details and `JwtUtil` for token generation.
- `JwtAuthFilter` uses `JwtUtil` for token validation and `UserService` to load user details.
- `SecurityConfig` injects `JwtAuthFilter` and `UserService` to configure the security chain.
- `AdminInitializer` and `DataSeeder` inject `UserRepository` to manage initial user and other data.
- `GlobalExceptionHandler` catches `ResourceNotFoundException` and returns `ErrorResponse`.

---

## Location Management

**Name:** `location-management`  
**Type:** BACKEND  
**Change required:** false

**Files in this feature:**
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/model/Location.java` — MODEL layer — represents a physical restaurant location with unique identifier, name, address, phone number, latitude, and longitude.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/repository/LocationRepository.java` — REPOSITORY layer — provides data access operations for Location entities.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/service/LocationService.java` — SERVICE layer — implements business logic for managing restaurant locations, including `getAllLocations(): List<LocationDto>`, `getLocationById(UUID id): LocationDto`, `createLocation(LocationDto locationDto): LocationDto`, `updateLocation(UUID id, LocationDto locationDto): LocationDto`, and `deleteLocation(UUID id): void`.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/dto/LocationDto.java` — DTO layer — Data Transfer Object for Location entities, used for exposing location data through the API.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/controller/LocationController.java` — CONTROLLER layer — exposes public API endpoints for retrieving location information, including `GET /api/v1/locations` and `GET /api/v1/locations/{id}`.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/controller/AdminLocationController.java` — CONTROLLER layer — exposes admin-only API endpoints for CRUD operations on locations, including `GET /api/v1/admin/locations`, `GET /api/v1/admin/locations/{id}`, `POST /api/v1/admin/locations`, `PUT /api/v1/admin/locations/{id}`, and `DELETE /api/v1/admin/locations/{id}`.

**Feature Instruction:**

The Location Management feature provides the backend infrastructure for managing multiple physical restaurant locations for Hotel Chul Mutton Baner - Sagar Takawale Group of Hotels. This includes defining the data model for a location, providing a repository for persistence, implementing business logic for CRUD operations, and exposing public and administrative API endpoints. The `Location` entity stores details such as name, address, phone, and coordinates. `LocationDto` is used for data transfer between the service and controller layers. `LocationRepository` handles database interactions. `LocationService` encapsulates the core business logic, including validation and interaction with the repository. `LocationController` exposes public read-only endpoints for fetching location information, while `AdminLocationController` provides authenticated administrative endpoints for creating, updating, and deleting locations. All administrative endpoints require authentication and authorization.

### Location Entity (`Location.java`)
This JPA entity represents a single restaurant location. It will have fields for `id` (UUID), `name` (String), `address` (String), `phone` (String), `latitude` (Double), and `longitude` (Double).

### Location DTO (`LocationDto.java`)
This DTO mirrors the `Location` entity but is used for data transfer. It will contain `id` (UUID), `name` (String), `address` (String), `phone` (String), `latitude` (Double), and `longitude` (Double).

### Location Repository (`LocationRepository.java`)
This interface extends `JpaRepository` to provide standard CRUD operations for `Location` entities. It will not require any custom query methods beyond those provided by Spring Data JPA.

### Location Service (`LocationService.java`)
`LocationService` is responsible for the business logic related to locations. It injects `LocationRepository`.

- `getAllLocations()`: Returns a `List<LocationDto>` of all available locations. It retrieves all `Location` entities from the repository and converts them to `LocationDto`s.
- `getLocationById(UUID id)`: Returns a `LocationDto` for the given ID. If the location is not found, it throws a `ResourceNotFoundException`.
- `createLocation(LocationDto locationDto)`: Creates a new location. It takes a `LocationDto`, converts it to a `Location` entity, saves it via the repository, and returns the saved `Location` as a `LocationDto`. It validates that the `name`, `address`, and `phone` are not null or empty.
- `updateLocation(UUID id, LocationDto locationDto)`: Updates an existing location. It finds the location by ID, updates its fields from the `LocationDto`, saves the updated entity, and returns the updated `Location` as a `LocationDto`. If the location is not found, it throws a `ResourceNotFoundException`. It validates that the `name`, `address`, and `phone` are not null or empty.
- `deleteLocation(UUID id)`: Deletes a location by ID. If the location is not found, it throws a `ResourceNotFoundException`.

### Location Controller (`LocationController.java`)
`LocationController` exposes public API endpoints for retrieving location information. It injects `LocationService`.

- `getAllLocations()`: Handles GET requests to `/api/v1/locations`. Returns a `List<LocationDto>` with HTTP status 200 OK.
- `getLocationById(UUID id)`: Handles GET requests to `/api/v1/locations/{id}`. Returns a `LocationDto` with HTTP status 200 OK. If `LocationService` throws `ResourceNotFoundException`, it returns HTTP status 404 NOT FOUND.

### Admin Location Controller (`AdminLocationController.java`)
`AdminLocationController` exposes administrative API endpoints for CRUD operations on locations. It injects `LocationService`. All endpoints require `ADMIN` role.

- `getAllLocations()`: Handles GET requests to `/api/v1/admin/locations`. Returns a `List<LocationDto>` with HTTP status 200 OK.
- `getLocationById(UUID id)`: Handles GET requests to `/api/v1/admin/locations/{id}`. Returns a `LocationDto` with HTTP status 200 OK. If `LocationService` throws `ResourceNotFoundException`, it returns HTTP status 404 NOT FOUND.
- `createLocation(LocationDto locationDto)`: Handles POST requests to `/api/v1/admin/locations`. Creates a new location. Returns the created `LocationDto` with HTTP status 201 CREATED. If `LocationService` throws `IllegalArgumentException` due to validation errors, it returns HTTP status 400 BAD REQUEST.
- `updateLocation(UUID id, LocationDto locationDto)`: Handles PUT requests to `/api/v1/admin/locations/{id}`. Updates an existing location. Returns the updated `LocationDto` with HTTP status 200 OK. If `LocationService` throws `ResourceNotFoundException`, it returns HTTP status 404 NOT FOUND. If `LocationService` throws `IllegalArgumentException`, it returns HTTP status 400 BAD REQUEST.
- `deleteLocation(UUID id)`: Handles DELETE requests to `/api/v1/admin/locations/{id}`. Deletes a location. Returns HTTP status 204 NO CONTENT. If `LocationService` throws `ResourceNotFoundException`, it returns HTTP status 404 NOT FOUND.

---

## Menu Management (Core)

**Name:** `menu-management-core`  
**Type:** BACKEND  
**Change required:** false

**Files in this feature:**
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/model/MenuItem.java` — MODEL layer — defines the structure and relationships for a menu item, including its category and associated location.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/model/MenuItemCategory.java` — MODEL layer — defines the structure for a menu item category.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/repository/MenuItemRepository.java` — REPOSITORY layer — provides data access operations for MenuItem entities, including custom queries by category and location.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/repository/MenuItemCategoryRepository.java` — REPOSITORY layer — provides data access operations for MenuItemCategory entities.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/service/MenuService.java` — SERVICE layer — implements business logic for managing menu items and categories, orchestrating persistence and interacting with the location-management feature.

**Feature Instruction:**

The Menu Management (Core) feature provides the foundational data models and persistence logic for the restaurant's menu. It defines the `MenuItem` and `MenuItemCategory` entities, which represent the dishes offered and their respective classifications. The `MenuService` orchestrates interactions with `MenuItemRepository` and `MenuItemCategoryRepository` to manage these entities. This feature is purely backend and focuses on data integrity and business logic, exposing its capabilities to the `menu-management-api` feature through the `MenuService`.

### MenuItem.java
This entity represents a single food item available on the menu. It includes details such as name, description, price, and a reference to its category and the location where it's available. It is mapped to the `menu_items` table in the database.

### MenuItemCategory.java
This entity represents a category for menu items, such as "Appetizers," "Main Course," or "Desserts." It helps organize the menu for both customers and staff. It is mapped to the `menu_item_categories` table in the database.

### MenuItemRepository.java
This Spring Data JPA repository provides standard CRUD operations for `MenuItem` entities. It will also include custom query methods to retrieve menu items based on various criteria, such as by category or location.

### MenuItemCategoryRepository.java
This Spring Data JPA repository provides standard CRUD operations for `MenuItemCategory` entities. It will include custom query methods to find categories by name or to retrieve all categories.

### MenuService.java
This service layer class encapsulates the business logic for menu management. It interacts with `MenuItemRepository` and `MenuItemCategoryRepository` to perform operations like creating, retrieving, updating, and deleting menu items and categories. It will expose methods to the `menu-management-api` feature for managing the menu. The `MenuService` will also interact with the `location-management` feature to associate menu items with specific `Location` entities.

#### Public Methods:
- `MenuItem createMenuItem(MenuItem menuItem)`:
  1. Validates the `menuItem` object.
  2. Ensures the associated `MenuItemCategory` and `Location` exist. If the `Location` does not exist, it will throw a `ResourceNotFoundException`.
  3. Saves the `menuItem` to the database using `menuItemRepository.save()`.
  4. Returns the saved `MenuItem`.
- `MenuItem getMenuItemById(UUID id)`:
  1. Retrieves a `MenuItem` by its `id` using `menuItemRepository.findById()`.
  2. Throws `ResourceNotFoundException` if the item is not found.
  3. Returns the `MenuItem`.
- `List<MenuItem> getAllMenuItems()`:
  1. Retrieves all `MenuItem` objects from the database using `menuItemRepository.findAll()`.
  2. Returns a list of `MenuItem`.
- `List<MenuItem> getMenuItemsByCategory(UUID categoryId)`:
  1. Retrieves all `MenuItem` objects belonging to a specific category using `menuItemRepository.findByCategoryId()`.
  2. Throws `ResourceNotFoundException` if the category is not found.
  3. Returns a list of `MenuItem`.
- `List<MenuItem> getMenuItemsByLocation(UUID locationId)`:
  1. Retrieves all `MenuItem` objects available at a specific location using `menuItemRepository.findByLocationId()`.
  2. Throws `ResourceNotFoundException` if the location is not found.
  3. Returns a list of `MenuItem`.
- `MenuItem updateMenuItem(UUID id, MenuItem updatedMenuItem)`:
  1. Finds the existing `MenuItem` by `id` using `menuItemRepository.findById()`. Throws `ResourceNotFoundException` if not found.
  2. Updates the fields of the existing `MenuItem` with values from `updatedMenuItem`.
  3. Ensures the associated `MenuItemCategory` and `Location` exist. If the `Location` does not exist, it will throw a `ResourceNotFoundException`.
  4. Saves the updated `MenuItem` using `menuItemRepository.save()`.
  5. Returns the updated `MenuItem`.
- `void deleteMenuItem(UUID id)`:
  1. Checks if the `MenuItem` exists by `id` using `menuItemRepository.existsById()`.
  2. Throws `ResourceNotFoundException` if the item does not exist.
  3. Deletes the `MenuItem` using `menuItemRepository.deleteById()`.
- `MenuItemCategory createMenuItemCategory(MenuItemCategory category)`:
  1. Validates the `category` object.
  2. Saves the `category` to the database using `menuItemCategoryRepository.save()`.
  3. Returns the saved `MenuItemCategory`.
- `MenuItemCategory getMenuItemCategoryById(UUID id)`:
  1. Retrieves a `MenuItemCategory` by its `id` using `menuItemCategoryRepository.findById()`.
  2. Throws `ResourceNotFoundException` if the category is not found.
  3. Returns the `MenuItemCategory`.
- `List<MenuItemCategory> getAllMenuItemCategories()`:
  1. Retrieves all `MenuItemCategory` objects from the database using `menuItemCategoryRepository.findAll()`.
  2. Returns a list of `MenuItemCategory`.
- `MenuItemCategory updateMenuItemCategory(UUID id, MenuItemCategory updatedCategory)`:
  1. Finds the existing `MenuItemCategory` by `id` using `menuItemCategoryRepository.findById()`. Throws `ResourceNotFoundException` if not found.
  2. Updates the fields of the existing `MenuItemCategory` with values from `updatedCategory`.
  3. Saves the updated `MenuItemCategory` using `menuItemCategoryRepository.save()`.
  4. Returns the updated `MenuItemCategory`.
- `void deleteMenuItemCategory(UUID id)`:
  1. Checks if the `MenuItemCategory` exists by `id` using `menuItemCategoryRepository.existsById()`.
  2. Throws `ResourceNotFoundException` if the category does not exist.
  3. Deletes the `MenuItemCategory` using `menuItemCategoryRepository.deleteById()`.

---

## Menu Management (API)

**Name:** `menu-management-api`  
**Type:** BACKEND  
**Change required:** false

**Files in this feature:**
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/controller/MenuController.java` — CONTROLLER layer — exposes public API endpoints for fetching menu information, including getAllMenuItems(): ResponseEntity<List<MenuItemDto>>, getMenuItemsByCategory(UUID categoryId): ResponseEntity<List<MenuItemDto>>, getMenuItemsByLocation(UUID locationId): ResponseEntity<List<MenuItemDto>>, and getAllMenuItemCategories(): ResponseEntity<List<MenuItemCategoryDto>>.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/controller/AdminMenuController.java` — CONTROLLER layer — exposes admin-only API endpoints for CRUD operations on menu items and categories, including createMenuItem(CreateMenuItemRequest): ResponseEntity<MenuItemDto>, getMenuItemById(UUID id): ResponseEntity<MenuItemDto>, updateMenuItem(UUID id, CreateMenuItemRequest request): ResponseEntity<MenuItemDto>, deleteMenuItem(UUID id): ResponseEntity<Void>, createMenuItemCategory(MenuItemCategoryDto categoryDto): ResponseEntity<MenuItemCategoryDto>, getMenuItemCategoryById(UUID id): ResponseEntity<MenuItemCategoryDto>, updateMenuItemCategory(UUID id, MenuItemCategoryDto categoryDto): ResponseEntity<MenuItemCategoryDto>, and deleteMenuItemCategory(UUID id): ResponseEntity<Void>.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/dto/MenuItemDto.java` — DTO layer — Data Transfer Object for MenuItem entities, used for API responses and requests.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/dto/MenuItemCategoryDto.java` — DTO layer — Data Transfer Object for MenuItemCategory entities, used for API responses and requests.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/dto/CreateMenuItemRequest.java` — DTO layer — Data Transfer Object for creating or updating a menu item, used in API requests.

**Feature Instruction:**

The Menu Management (API) feature provides public and administrative API endpoints for managing the restaurant's menu items and categories. It interacts with the `menu-management-core` feature for business logic and persistence.

### MenuController.java
This controller exposes public-facing endpoints for customers to browse the menu. It injects `MenuService` from the `menu-management-core` feature. All methods return `MenuItemDto` or `MenuItemCategoryDto` objects.

1.  `getAllMenuItems()`: Retrieves all available menu items. Calls `menuService.getAllMenuItems()` and maps the `MenuItem` entities to `MenuItemDto`.
2.  `getMenuItemsByCategory(UUID categoryId)`: Retrieves menu items belonging to a specific category. Calls `menuService.getMenuItemsByCategory(categoryId)` and maps the `MenuItem` entities to `MenuItemDto`. Throws `ResourceNotFoundException` if the category does not exist.
3.  `getMenuItemsByLocation(UUID locationId)`: Retrieves menu items available at a specific location. Calls `menuService.getMenuItemsByLocation(locationId)` and maps the `MenuItem` entities to `MenuItemDto`. Throws `ResourceNotFoundException` if the location does not exist.
4.  `getAllMenuItemCategories()`: Retrieves all available menu item categories. Calls `menuService.getAllMenuItemCategories()` and maps the `MenuItemCategory` entities to `MenuItemCategoryDto`.

### AdminMenuController.java
This controller provides administrative endpoints for CRUD operations on menu items and categories. It injects `MenuService` from the `menu-management-core` feature. All methods return `MenuItemDto` or `MenuItemCategoryDto` objects.

1.  `createMenuItem(CreateMenuItemRequest request)`: Creates a new menu item. Maps the `CreateMenuItemRequest` to a `MenuItem` entity, calls `menuService.createMenuItem()`, and maps the result back to `MenuItemDto`. Returns HTTP 201 Created on success.
2.  `getMenuItemById(UUID id)`: Retrieves a menu item by its ID. Calls `menuService.getMenuItemById(id)` and maps the `MenuItem` entity to `MenuItemDto`. Throws `ResourceNotFoundException` if the item is not found.
3.  `updateMenuItem(UUID id, CreateMenuItemRequest request)`: Updates an existing menu item. Maps the `CreateMenuItemRequest` to a `MenuItem` entity, calls `menuService.updateMenuItem(id, updatedMenuItem)`, and maps the result back to `MenuItemDto`. Throws `ResourceNotFoundException` if the item is not found.
4.  `deleteMenuItem(UUID id)`: Deletes a menu item by its ID. Calls `menuService.deleteMenuItem(id)`. Returns HTTP 204 No Content on success. Throws `ResourceNotFoundException` if the item is not found.
5.  `createMenuItemCategory(MenuItemCategoryDto categoryDto)`: Creates a new menu item category. Maps the `MenuItemCategoryDto` to a `MenuItemCategory` entity, calls `menuService.createMenuItemCategory()`, and maps the result back to `MenuItemCategoryDto`. Returns HTTP 201 Created on success.
6.  `getMenuItemCategoryById(UUID id)`: Retrieves a menu item category by its ID. Calls `menuService.getMenuItemCategoryById(id)` and maps the `MenuItemCategory` entity to `MenuItemCategoryDto`. Throws `ResourceNotFoundException` if the category is not found.
7.  `updateMenuItemCategory(UUID id, MenuItemCategoryDto categoryDto)`: Updates an existing menu item category. Maps the `MenuItemCategoryDto` to a `MenuItemCategory` entity, calls `menuService.updateMenuItemCategory(id, updatedCategory)`, and maps the result back to `MenuItemCategoryDto`. Throws `ResourceNotFoundException` if the category is not found.
8.  `deleteMenuItemCategory(UUID id)`: Deletes a menu item category by its ID. Calls `menuService.deleteMenuItemCategory(id)`. Returns HTTP 204 No Content on success. Throws `ResourceNotFoundException` if the category is not found.

### MenuItemDto.java
This DTO represents a menu item, used for transferring data between the service layer and the API.

### MenuItemCategoryDto.java
This DTO represents a menu item category, used for transferring data between the service layer and the API.

### CreateMenuItemRequest.java
This DTO is used for requests to create or update a menu item, containing all necessary fields for these operations.

---

## Order Management (Core)

**Name:** `order-management-core`  
**Type:** BACKEND  
**Change required:** false

**Files in this feature:**
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/model/Order.java` — MODEL layer — defines the `Order` entity with relationships to `User`, `Location`, and `OrderItem`.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/model/OrderItem.java` — MODEL layer — defines the `OrderItem` entity with relationships to `Order` and `MenuItem`.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/model/OrderStatus.java` — MODEL layer — enum defining the possible statuses of an order.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/model/OrderType.java` — MODEL layer — enum defining the type of order (DELIVERY or PICKUP).
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/repository/OrderRepository.java` — REPOSITORY layer — provides data access for `Order` entities, including custom queries to find orders by user ID and status.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/repository/OrderItemRepository.java` — REPOSITORY layer — provides data access for `OrderItem` entities.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/service/OrderService.java` — SERVICE layer — implements business logic for creating, retrieving, updating, and cancelling orders; delegates persistence to `OrderRepository` and `OrderItemRepository` and interacts with `shared-backend.UserService`, `location-management.LocationService`, and `menu-management-core.MenuService`.

**Feature Instruction:**

The Order Management (Core) feature provides the foundational backend models and persistence logic for handling customer food orders. It defines the `Order`, `OrderItem`, `OrderStatus`, and `OrderType` entities, along with their respective Spring Data JPA repositories (`OrderRepository` and `OrderItemRepository`). The `OrderService` encapsulates the core business logic for managing orders, including creation, retrieval, and updates. This feature interacts with the `shared-backend` feature for `User` information, `location-management` for `Location` details, and `menu-management-core` for `MenuItem` details. The `OrderService` will orchestrate interactions with these external features to validate and enrich order data.

### Order Model (`Order.java`)
This JPA entity represents a customer's food order. It includes fields for a unique `orderId`, the `user` who placed the order, the `orderType` (DELIVERY or PICKUP), the `orderStatus` (e.g., PENDING, CONFIRMED, DELIVERED), the `totalAmount`, `orderDate`, `deliveryAddress` (if applicable), and a list of `orderItems`. It will have a ManyToOne relationship with `User` and `Location` (for delivery address), and OneToMany with `OrderItem`.

### OrderItem Model (`OrderItem.java`)
This JPA entity represents a single line item within an `Order`. It includes fields for a unique `orderItemId`, the associated `order`, the `menuItem` being ordered, the `quantity`, and the `subtotal`. It will have a ManyToOne relationship with `Order` and `MenuItem`.

### OrderStatus Enum (`OrderStatus.java`)
This enum defines the possible states an order can be in, such as `PENDING`, `CONFIRMED`, `PREPARING`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.

### OrderType Enum (`OrderType.java`)
This enum defines whether an order is for `DELIVERY` or `PICKUP`.

### OrderRepository (`OrderRepository.java`)
This Spring Data JPA repository provides standard CRUD operations for the `Order` entity. It will also include custom query methods to find orders by `userId` and `orderStatus`.

### OrderItemRepository (`OrderItemRepository.java`)
This Spring Data JPA repository provides standard CRUD operations for the `OrderItem` entity.

### OrderService (`OrderService.java`)
This service class contains the business logic for order management. It will inject `OrderRepository`, `OrderItemRepository`, `menu-management-core.MenuService`, `location-management.LocationService`, and `shared-backend.UserService`.

#### Public Functions:

1.  `createOrder(CreateOrderRequestDTO createOrderRequest)`: `OrderResponseDTO`
    *   **Logic:**
        1.  Validate the `userId` by calling `shared-backend.UserService.findById(createOrderRequest.getUserId())`. Throw `ResourceNotFoundException` if the user does not exist.
        2.  Validate the `locationId` by calling `location-management.LocationService.getLocationById(createOrderRequest.getLocationId())`. Throw `ResourceNotFoundException` if the location does not exist.
        3.  Iterate through `createOrderRequest.getOrderItems()`:
            a.  For each `OrderItemRequest`, retrieve the `MenuItem` details using `menu-management-core.MenuService.getMenuItemById(item.getMenuItemId())`. Throw `ResourceNotFoundException` if any menu item does not exist or is unavailable.
            b.  Calculate the `subtotal` for each `OrderItem`.
        4.  Create a new `Order` entity, setting `orderType`, `orderStatus` to `PENDING`, `orderDate` to current timestamp, and `totalAmount` by summing all `OrderItem` subtotals.
        5.  Save the `Order` entity using `orderRepository.save()`.
        6.  For each `OrderItemRequest`, create an `OrderItem` entity, associate it with the saved `Order`, and save it using `orderItemRepository.save()`.
        7.  Return an `OrderResponseDTO` containing the details of the created order.
    *   **Error Cases:**
        *   `ResourceNotFoundException` (HTTP 404) if `userId`, `locationId`, or any `menuItemId` is not found.
        *   `IllegalArgumentException` (HTTP 400) if any menu item is unavailable or quantity is invalid.

2.  `getOrderById(UUID orderId)`: `OrderResponseDTO`
    *   **Logic:**
        1.  Retrieve the `Order` from `orderRepository` by `orderId`. Throw `ResourceNotFoundException` if not found.
        2.  Map the `Order` entity to an `OrderResponseDTO`.
        3.  Return the `OrderResponseDTO`.
    *   **Error Cases:**
        *   `ResourceNotFoundException` (HTTP 404) if the order is not found.

3.  `getOrdersByUserId(Long userId)`: `List<OrderResponseDTO>`
    *   **Logic:**
        1.  Retrieve a list of `Order` entities from `orderRepository` by `userId`.
        2.  Map each `Order` entity to an `OrderResponseDTO`.
        3.  Return the list of `OrderResponseDTO`.
    *   **Error Cases:** None specific, returns an empty list if no orders are found.

4.  `updateOrderStatus(UUID orderId, OrderStatus newStatus)`: `OrderResponseDTO`
    *   **Logic:**
        1.  Retrieve the `Order` from `orderRepository` by `orderId`. Throw `ResourceNotFoundException` if not found.
        2.  Update the `orderStatus` of the `Order` entity to `newStatus`.
        3.  Save the updated `Order` entity using `orderRepository.save()`.
        4.  Return an `OrderResponseDTO` containing the details of the updated order.
    *   **Error Cases:**
        *   `ResourceNotFoundException` (HTTP 404) if the order is not found.
        *   `IllegalArgumentException` (HTTP 400) if `newStatus` is invalid for the current order state (e.g., trying to set DELIVERED on a PENDING order without intermediate steps).

5.  `cancelOrder(UUID orderId)`: `OrderResponseDTO`
    *   **Logic:**
        1.  Retrieve the `Order` from `orderRepository` by `orderId`. Throw `ResourceNotFoundException` if not found.
        2.  If the current `orderStatus` allows cancellation (e.g., PENDING, CONFIRMED, PREPARING), set `orderStatus` to `CANCELLED`.
        3.  Save the updated `Order` entity using `orderRepository.save()`.
        4.  Return an `OrderResponseDTO` containing the details of the cancelled order.
    *   **Error Cases:**
        *   `ResourceNotFoundException` (HTTP 404) if the order is not found.
        *   `IllegalStateException` (HTTP 409) if the order cannot be cancelled due to its current status (e.g., already DELIVERED or OUT_FOR_DELIVERY).


---

## Order Management (API)

**Name:** `order-management-api`  
**Type:** BACKEND  
**Change required:** false

**Files in this feature:**
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/controller/OrderController.java` — CONTROLLER layer — exposes API endpoints for customers to place and track their orders; calls `OrderService.createOrder(CreateOrderRequest)`, `OrderService.getOrderById(UUID)`, and `OrderService.getOrdersByUserId(Long)`.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/controller/AdminOrderController.java` — CONTROLLER layer — exposes admin-only API endpoints for viewing and managing all customer orders; calls `OrderService.getAllOrders()`, `OrderService.getOrderById(UUID)`, and `OrderService.updateOrderStatus(UUID, OrderStatus)`.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/dto/CreateOrderRequest.java` — DTO layer — defines the structure for requests to create new orders.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/dto/OrderItemRequest.java` — DTO layer — defines the structure for a single item within an order creation request.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/dto/OrderResponse.java` — DTO layer — defines the structure for responses containing detailed order information.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/dto/OrderItemResponse.java` — DTO layer — defines the structure for a single item within an order response.

**Feature Instruction:**

The Order Management API feature provides RESTful endpoints for customers to place and track their food orders, and for administrators to manage all orders. It consists of two controllers: `OrderController` for customer-facing operations and `AdminOrderController` for administrative tasks. Both controllers interact with the `OrderService` from the `order-management-core` feature to perform business logic. This feature also defines several Data Transfer Objects (DTOs) for request and response payloads: `CreateOrderRequest` and `OrderItemRequest` for creating new orders, and `OrderResponse` and `OrderItemResponse` for returning order details.

## OrderController
`OrderController` handles customer-initiated requests related to orders. It exposes endpoints for creating a new order, retrieving a specific order by its ID, and fetching all orders placed by the currently authenticated user.

### public ResponseEntity<OrderResponse> createOrder(@RequestBody @Valid CreateOrderRequest request)
1. Validates the `CreateOrderRequest` using `@Valid`.
2. Calls `orderService.createOrder(request)` to process the order creation.
3. Returns a `201 Created` status with the `OrderResponse` if successful.
4. Throws `IllegalArgumentException` if the request is invalid, resulting in a `400 Bad Request`.

### public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID orderId)
1. Calls `orderService.getOrderById(orderId)` to retrieve the order.
2. Returns a `200 OK` status with the `OrderResponse` if the order is found.
3. Throws `ResourceNotFoundException` if no order with the given `orderId` exists, resulting in a `404 Not Found`.

### public ResponseEntity<List<OrderResponse>> getMyOrders()
1. Retrieves the `userId` of the currently authenticated user (from Spring Security context).
2. Calls `orderService.getOrdersByUserId(userId)` to fetch all orders for that user.
3. Returns a `200 OK` status with a list of `OrderResponse` DTOs.

## AdminOrderController
`AdminOrderController` provides endpoints for administrators to view and manage all orders. This includes fetching all orders, retrieving a specific order, and updating an order's status.

### public ResponseEntity<List<OrderResponse>> getAllOrders()
1. Calls `orderService.getAllOrders()` to retrieve all orders.
2. Returns a `200 OK` status with a list of `OrderResponse` DTOs.

### public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID orderId)
1. Calls `orderService.getOrderById(orderId)` to retrieve the order.
2. Returns a `200 OK` status with the `OrderResponse` if the order is found.
3. Throws `ResourceNotFoundException` if no order with the given `orderId` exists, resulting in a `404 Not Found`.

### public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable UUID orderId, @RequestParam OrderStatus newStatus)
1. Calls `orderService.updateOrderStatus(orderId, newStatus)` to update the order's status.
2. Returns a `200 OK` status with the updated `OrderResponse`.
3. Throws `ResourceNotFoundException` if no order with the given `orderId` exists, resulting in a `404 Not Found`.
4. Throws `IllegalArgumentException` if `newStatus` is invalid or the status transition is not allowed, resulting in a `400 Bad Request`.

## DTOs

### CreateOrderRequest
This DTO is used to encapsulate the data required to create a new order. It contains a list of `OrderItemRequest` objects and delivery details.

### OrderItemRequest
This DTO represents a single item within a `CreateOrderRequest`, specifying the `menuItemId` and `quantity`.

### OrderResponse
This DTO is used to return detailed information about an order, including its unique `orderId`, `userId`, `orderType`, `orderStatus`, `totalAmount`, `orderDate`, `deliveryAddress`, and a list of `OrderItemResponse` objects.

### OrderItemResponse
This DTO represents a single item within an `OrderResponse`, providing details such as `orderItemId`, `menuItem` (from `menu-management-core`), `quantity`, and `subtotal`.

---

## Reservation System

**Name:** `reservation-system`  
**Type:** BACKEND  
**Change required:** false

**Files in this feature:**
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/model/Reservation.java` — MODEL layer — defines the `Reservation` entity with fields for customer details, reservation time, number of guests, associated location, status, and special requests.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/model/ReservationStatus.java` — MODEL layer — defines an enum for the possible statuses of a table reservation.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/repository/ReservationRepository.java` — REPOSITORY layer — provides data access operations for `Reservation` entities, including custom queries for availability and customer-specific reservations.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/service/ReservationService.java` — SERVICE layer — implements business logic for managing table reservations, including creation, retrieval, status updates, and cancellation.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/controller/ReservationController.java` — CONTROLLER layer — exposes public API endpoints for customers to create, view, and manage their reservations.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/controller/AdminReservationController.java` — CONTROLLER layer — exposes admin-only API endpoints for full CRUD operations on all reservations.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/dto/CreateReservationRequest.java` — DTO layer — defines the data structure for requests to create a new table reservation.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/dto/ReservationDto.java` — DTO layer — defines the data structure for transferring reservation information between the backend and frontend.

**Feature Instruction:**

The Reservation System feature provides a complete backend solution for managing table reservations at Hotel Chul Mutton Baner - Sagar Takawale Group of Hotels. It includes models for `Reservation` and `ReservationStatus`, a Spring Data JPA `ReservationRepository` for data persistence, a `ReservationService` for business logic, and two controllers: `ReservationController` for public-facing reservation creation and retrieval, and `AdminReservationController` for administrative management of all reservations. It also defines DTOs for `CreateReservationRequest` and `ReservationDto` to handle data transfer between the client and server.

### Data Models
- `Reservation.java`: Represents a single table reservation. It includes fields such as `id` (UUID), `customerName` (String), `customerEmail` (String), `customerPhone` (String), `numberOfGuests` (Integer), `reservationTime` (LocalDateTime), `location` (Location, from `location-management` feature), `status` (ReservationStatus), and `specialRequests` (String). The `location` field is a many-to-one relationship with the `Location` entity from the `location-management` feature.
- `ReservationStatus.java`: An enum defining the possible states of a reservation: `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`.

### Repository Layer
- `ReservationRepository.java`: Extends `JpaRepository<Reservation, UUID>` and provides standard CRUD operations. It will also include custom query methods such as `findByReservationTimeBetweenAndLocationId(LocalDateTime start, LocalDateTime end, UUID locationId)` to check for availability, and `findByCustomerEmail(String customerEmail)` to retrieve reservations for a specific customer.

### Service Layer
- `ReservationService.java`: This service orchestrates the business logic for reservations. It injects `ReservationRepository` and `LocationService` (from `location-management` feature).
  - `createReservation(CreateReservationRequest request)`: 
    1. Validates the `CreateReservationRequest`. 
    2. Retrieves the `Location` entity using `locationService.getLocationById(request.getLocationId())`. Throws `ResourceNotFoundException` if the location does not exist.
    3. Checks for table availability based on `reservationTime` and `locationId` using `reservationRepository.findByReservationTimeBetweenAndLocationId()`. Throws `IllegalStateException` if no tables are available.
    4. Creates a new `Reservation` entity, setting its initial `status` to `PENDING`.
    5. Saves the `Reservation` using `reservationRepository.save()`.
    6. Returns a `ReservationDto` representation of the created reservation.
  - `getReservationById(UUID id)`: 
    1. Retrieves a `Reservation` by its `id` using `reservationRepository.findById()`.
    2. Throws `ResourceNotFoundException` if the reservation is not found.
    3. Returns a `ReservationDto`.
  - `getAllReservations()`: 
    1. Retrieves all `Reservation` entities using `reservationRepository.findAll()`.
    2. Returns a `List<ReservationDto>`.
  - `getReservationsByCustomerEmail(String customerEmail)`:
    1. Retrieves `Reservation` entities by `customerEmail` using `reservationRepository.findByCustomerEmail()`.
    2. Returns a `List<ReservationDto>`.
  - `updateReservationStatus(UUID id, ReservationStatus newStatus)`: 
    1. Retrieves the `Reservation` by `id`. Throws `ResourceNotFoundException` if not found.
    2. Updates the `status` of the reservation to `newStatus`.
    3. Saves the updated `Reservation` using `reservationRepository.save()`.
    4. Returns a `ReservationDto`.
  - `cancelReservation(UUID id)`: 
    1. Retrieves the `Reservation` by `id`. Throws `ResourceNotFoundException` if not found.
    2. Sets the `status` to `CANCELLED`.
    3. Saves the updated `Reservation`.
    4. Returns a `ReservationDto`.

### DTOs
- `CreateReservationRequest.java`: Used for incoming reservation requests. Contains fields like `customerName`, `customerEmail`, `customerPhone`, `numberOfGuests`, `reservationTime`, `locationId`, and `specialRequests`.
- `ReservationDto.java`: Used for outgoing reservation data. Contains `id`, `customerName`, `customerEmail`, `customerPhone`, `numberOfGuests`, `reservationTime`, `location` (LocationDto from `location-management`), `status`, and `specialRequests`.

### Controller Layer
- `ReservationController.java`: Handles public API requests related to reservations.
  - `createReservation(CreateReservationRequest request)`: Handles POST requests to `/api/v1/reservations` to create a new reservation. Calls `reservationService.createReservation()`.
  - `getReservationById(UUID id)`: Handles GET requests to `/api/v1/reservations/{id}` to retrieve a specific reservation. Calls `reservationService.getReservationById()`.
  - `getReservationsByCustomerEmail(String customerEmail)`: Handles GET requests to `/api/v1/reservations/customer/{customerEmail}` to retrieve reservations for a given customer email. Calls `reservationService.getReservationsByCustomerEmail()`.
- `AdminReservationController.java`: Handles admin-only API requests for managing all reservations.
  - `getAllReservations()`: Handles GET requests to `/api/v1/admin/reservations` to retrieve all reservations. Calls `reservationService.getAllReservations()`.
  - `getReservationById(UUID id)`: Handles GET requests to `/api/v1/admin/reservations/{id}`. Calls `reservationService.getReservationById()`.
  - `updateReservationStatus(UUID id, ReservationStatus newStatus)`: Handles PUT requests to `/api/v1/admin/reservations/{id}/status` to update a reservation's status. Calls `reservationService.updateReservationStatus()`.
  - `cancelReservation(UUID id)`: Handles DELETE requests to `/api/v1/admin/reservations/{id}` to cancel a reservation. Calls `reservationService.cancelReservation()`.

---

## Gallery Management

**Name:** `gallery-management`  
**Type:** BACKEND  
**Change required:** false

**Files in this feature:**
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/model/GalleryItem.java` — MODEL layer — represents an image or video in the restaurant's gallery with fields for ID, URL, caption, category, and upload date.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/repository/GalleryItemRepository.java` — REPOSITORY layer — provides data access operations for `GalleryItem` entities, including standard CRUD and custom queries by category.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/service/GalleryService.java` — SERVICE layer — implements `createGalleryItem(GalleryItemDto)`, `getGalleryItemById(UUID)`, `getAllGalleryItems()`, `getGalleryItemsByCategory(String)`, `updateGalleryItem(UUID, GalleryItemDto)`, and `deleteGalleryItem(UUID)` for managing gallery content.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/controller/GalleryController.java` — CONTROLLER layer — exposes public API endpoints for fetching gallery items via `getAllGalleryItems()` and `getGalleryItemsByCategory(String)`.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/controller/AdminGalleryController.java` — CONTROLLER layer — exposes admin-only API endpoints for CRUD operations on gallery items via `createGalleryItem(GalleryItemDto)`, `getGalleryItemById(UUID)`, `getAllGalleryItems()`, `updateGalleryItem(UUID, GalleryItemDto)`, and `deleteGalleryItem(UUID)`.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/dto/GalleryItemDto.java` — DTO layer — Data Transfer Object for `GalleryItem` entities, used for API requests and responses.

**Feature Instruction:**

The Gallery Management feature provides a backend API for managing the restaurant's image and video gallery. It includes a `GalleryItem` model to represent individual gallery entries, a `GalleryItemRepository` for data access, and a `GalleryService` for business logic. API endpoints are exposed through `GalleryController` for public access (read-only) and `AdminGalleryController` for administrative CRUD operations. Data transfer between layers and across the API is handled by `GalleryItemDto`.

### GalleryItem.java
This is the JPA entity representing a single gallery item. It will have fields for `id` (UUID), `imageUrl` (String, URL to the image/video), `caption` (String, descriptive text), `category` (String, e.g., "Food", "Ambiance", "Events"), and `uploadDate` (LocalDateTime).

### GalleryItemRepository.java
This Spring Data JPA repository extends `JpaRepository<GalleryItem, UUID>`. It will provide standard CRUD operations and may include custom query methods if specific filtering or searching is required (e.g., `findByCategory(String category)`).

### GalleryService.java
This service class encapsulates the business logic for gallery management. It will inject `GalleryItemRepository`.

**Public Methods:**

*   `GalleryItemDto createGalleryItem(GalleryItemDto galleryItemDto)`:
    1.  Converts the `galleryItemDto` to a `GalleryItem` entity.
    2.  Sets `uploadDate` to `LocalDateTime.now()`.
    3.  Saves the `GalleryItem` using `galleryItemRepository.save()`.
    4.  Converts the saved entity back to `GalleryItemDto` and returns it.

*   `GalleryItemDto getGalleryItemById(UUID id)`:
    1.  Retrieves a `GalleryItem` by its `id` using `galleryItemRepository.findById()`.
    2.  If not found, throws `ResourceNotFoundException`.
    3.  Converts the entity to `GalleryItemDto` and returns it.

*   `List<GalleryItemDto> getAllGalleryItems()`:
    1.  Retrieves all `GalleryItem` entities using `galleryItemRepository.findAll()`.
    2.  Converts the list of entities to a list of `GalleryItemDto` and returns it.

*   `List<GalleryItemDto> getGalleryItemsByCategory(String category)`:
    1.  Retrieves `GalleryItem` entities filtered by `category` using `galleryItemRepository.findByCategory()`.
    2.  Converts the list of entities to a list of `GalleryItemDto` and returns it.

*   `GalleryItemDto updateGalleryItem(UUID id, GalleryItemDto updatedGalleryItemDto)`:
    1.  Retrieves the existing `GalleryItem` by `id` using `galleryItemRepository.findById()`.
    2.  If not found, throws `ResourceNotFoundException`.
    3.  Updates the `imageUrl`, `caption`, and `category` fields of the existing entity with values from `updatedGalleryItemDto`.
    4.  Saves the updated `GalleryItem` using `galleryItemRepository.save()`.
    5.  Converts the saved entity back to `GalleryItemDto` and returns it.

*   `void deleteGalleryItem(UUID id)`:
    1.  Checks if a `GalleryItem` with the given `id` exists using `galleryItemRepository.existsById()`.
    2.  If not found, throws `ResourceNotFoundException`.
    3.  Deletes the `GalleryItem` by `id` using `galleryItemRepository.deleteById()`.

### GalleryController.java
This REST controller exposes public, read-only API endpoints for gallery items. It injects `GalleryService`.

**Public Methods:**

*   `ResponseEntity<List<GalleryItemDto>> getAllGalleryItems()`: Handles GET requests to `/api/v1/gallery`. Calls `galleryService.getAllGalleryItems()` and returns a list of `GalleryItemDto` with HTTP 200 OK.

*   `ResponseEntity<List<GalleryItemDto>> getGalleryItemsByCategory(@RequestParam String category)`: Handles GET requests to `/api/v1/gallery/category`. Calls `galleryService.getGalleryItemsByCategory(category)` and returns a list of `GalleryItemDto` with HTTP 200 OK.

### AdminGalleryController.java
This REST controller exposes admin-only API endpoints for CRUD operations on gallery items. It injects `GalleryService`.

**Public Methods:**

*   `ResponseEntity<GalleryItemDto> createGalleryItem(@RequestBody GalleryItemDto galleryItemDto)`: Handles POST requests to `/api/v1/admin/gallery`. Calls `galleryService.createGalleryItem(galleryItemDto)` and returns the created `GalleryItemDto` with HTTP 201 Created.

*   `ResponseEntity<GalleryItemDto> getGalleryItemById(@PathVariable UUID id)`: Handles GET requests to `/api/v1/admin/gallery/{id}`. Calls `galleryService.getGalleryItemById(id)` and returns the `GalleryItemDto` with HTTP 200 OK. Throws `ResourceNotFoundException` if not found, resulting in HTTP 404 Not Found.

*   `ResponseEntity<List<GalleryItemDto>> getAllGalleryItems()`: Handles GET requests to `/api/v1/admin/gallery`. Calls `galleryService.getAllGalleryItems()` and returns a list of `GalleryItemDto` with HTTP 200 OK.

*   `ResponseEntity<GalleryItemDto> updateGalleryItem(@PathVariable UUID id, @RequestBody GalleryItemDto updatedGalleryItemDto)`: Handles PUT requests to `/api/v1/admin/gallery/{id}`. Calls `galleryService.updateGalleryItem(id, updatedGalleryItemDto)` and returns the updated `GalleryItemDto` with HTTP 200 OK. Throws `ResourceNotFoundException` if not found, resulting in HTTP 404 Not Found.

*   `ResponseEntity<Void> deleteGalleryItem(@PathVariable UUID id)`: Handles DELETE requests to `/api/v1/admin/gallery/{id}`. Calls `galleryService.deleteGalleryItem(id)`. Returns HTTP 204 No Content on successful deletion. Throws `ResourceNotFoundException` if not found, resulting in HTTP 404 Not Found.

### GalleryItemDto.java
This DTO is used for transferring gallery item data between the service and controller layers, and across the API. It will mirror the `GalleryItem` entity but will be used for API requests and responses.

---

## Catering Inquiry System

**Name:** `catering-inquiry-system`  
**Type:** BACKEND  
**Change required:** false

**Files in this feature:**
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/model/CateringInquiry.java` — MODEL layer — defines the JPA entity for a catering inquiry.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/repository/CateringInquiryRepository.java` — REPOSITORY layer — provides data access operations for CateringInquiry entities.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/service/CateringInquiryService.java` — SERVICE layer — implements createCateringInquiry(CateringInquiryDto): CateringInquiryDto, getAllCateringInquiries(): List<CateringInquiryDto>, getCateringInquiryById(UUID): CateringInquiryDto, and deleteCateringInquiry(UUID): void.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/controller/AdminCateringInquiryController.java` — CONTROLLER layer — exposes API endpoints for administrators to manage catering inquiries.
- `backend/src/main/java/com/hotelchulmuttonbanersagartakawalegroupofhotels/dto/CateringInquiryDto.java` — DTO layer — defines the data transfer object for catering inquiries.

**Feature Instruction:**

The Catering Inquiry System feature handles customer inquiries for catering and bulk orders for Hotel Chul Mutton Baner - Sagar Takawale Group of Hotels. It consists of a `CateringInquiry` JPA entity, a `CateringInquiryRepository` for data access, a `CateringInquiryService` for business logic, a `CateringInquiryDto` for data transfer, and an `AdminCateringInquiryController` to expose API endpoints for administrators.

### CateringInquiry.java
This is the JPA entity representing a catering inquiry. It will have fields for `id`, `customerName`, `customerEmail`, `customerPhone`, `eventType`, `eventDate`, `numberOfGuests`, `budget`, `specialRequests`, and `inquiryDate`.

### CateringInquiryRepository.java
This repository extends `JpaRepository` and provides standard CRUD operations for `CateringInquiry` entities. No custom query methods are required for this feature.

### CateringInquiryDto.java
This DTO is used to transfer catering inquiry data between the controller and service layers. It mirrors the fields of the `CateringInquiry` entity, including `id`, `customerName`, `customerEmail`, `customerPhone`, `eventType`, `eventDate`, `numberOfGuests`, `budget`, `specialRequests`, and `inquiryDate`.

### CateringInquiryService.java
This service class encapsulates the business logic for catering inquiries. It injects `CateringInquiryRepository` to perform database operations. It provides the following public methods:

- `CateringInquiryDto createCateringInquiry(CateringInquiryDto inquiryDto)`:
    1. Maps the `CateringInquiryDto` to a `CateringInquiry` entity.
    2. Saves the `CateringInquiry` entity using `cateringInquiryRepository.save()`.
    3. Maps the saved entity back to a `CateringInquiryDto`.
    4. Returns the created `CateringInquiryDto`.
- `List<CateringInquiryDto> getAllCateringInquiries()`:
    1. Retrieves all `CateringInquiry` entities from the database using `cateringInquiryRepository.findAll()`.
    2. Maps each entity to a `CateringInquiryDto`.
    3. Returns a list of `CateringInquiryDto`.
- `CateringInquiryDto getCateringInquiryById(UUID id)`:
    1. Retrieves a `CateringInquiry` entity by its `id` using `cateringInquiryRepository.findById(id)`.
    2. If the inquiry is not found, throws a `ResourceNotFoundException`.
    3. Maps the found entity to a `CateringInquiryDto`.
    4. Returns the `CateringInquiryDto`.
- `void deleteCateringInquiry(UUID id)`:
    1. Checks if a `CateringInquiry` with the given `id` exists using `cateringInquiryRepository.existsById(id)`.
    2. If not found, throws a `ResourceNotFoundException`.
    3. Deletes the `CateringInquiry` entity using `cateringInquiryRepository.deleteById(id)`.

### AdminCateringInquiryController.java
This REST controller handles API requests related to catering inquiries for administrators. It injects `CateringInquiryService`. All endpoints require `ADMIN` role access.

- `POST /api/v1/admin/catering/inquiries`:
    - Request Body: `CateringInquiryDto`
    - Calls `cateringInquiryService.createCateringInquiry(inquiryDto)`.
    - Returns `201 Created` with the created `CateringInquiryDto`.
- `GET /api/v1/admin/catering/inquiries`:
    - Calls `cateringInquiryService.getAllCateringInquiries()`.
    - Returns `200 OK` with a list of `CateringInquiryDto`.
- `GET /api/v1/admin/catering/inquiries/{id}`:
    - Path Variable: `UUID id`
    - Calls `cateringInquiryService.getCateringInquiryById(id)`.
    - Returns `200 OK` with the `CateringInquiryDto`.
    - Throws `ResourceNotFoundException` if not found, returning `404 Not Found`.
- `DELETE /api/v1/admin/catering/inquiries/{id}`:
    - Path Variable: `UUID id`
    - Calls `cateringInquiryService.deleteCateringInquiry(id)`.
    - Returns `204 No Content`.
    - Throws `ResourceNotFoundException` if not found, returning `404 Not Found`.

---

## Core UI & Pages

**Name:** `core-ui`  
**Type:** FRONTEND  
**Change required:** false

**Files in this feature:**
- `frontend/src/api/client.ts` — Axios client configuration — sets base URL and implements JWT token interception for authentication.
- `frontend/src/App.tsx` — Root application component — sets up React Router and global context providers for authentication, cart, and location.
- `frontend/src/components/Layout.tsx` — Public page layout component — wraps content with Header, Footer, and WhatsApp CTA for consistent UI.
- `frontend/src/components/Header.tsx` — Site-wide header component — includes navigation, logo, location selector, and cart icon.
- `frontend/src/components/Footer.tsx` — Site-wide footer component — displays contact information, social links, and quick navigation.
- `frontend/src/components/shared/WhatsAppCta.tsx` — Floating WhatsApp CTA button component — initiates a WhatsApp chat with the business.
- `frontend/src/pages/HomePage.tsx` — Landing page component — aggregates hero, reopening banner, featured dishes, testimonials, and map sections.
- `frontend/src/components/home/HeroSection.tsx` — Hero section component for the homepage — displays a high-impact image, headline, and CTAs.
- `frontend/src/components/home/ReopeningBanner.tsx` — Reopening banner component for the homepage — displays a prominent message about the restaurant's reopening.
- `frontend/src/components/home/FeaturedDishes.tsx` — Featured dishes component for the homepage — showcases signature menu items.
- `frontend/src/components/home/Testimonials.tsx` — Testimonials component for the homepage — displays customer reviews and ratings.
- `frontend/src/components/home/LocationMap.tsx` — Location map component for the homepage — embeds Google Maps to show the restaurant's location.
- `frontend/src/pages/AboutPage.tsx` — About Us page component — details the brand story and culinary tradition.
- `frontend/src/pages/ContactPage.tsx` — Contact Us page component — displays contact details, a contact form, and an embedded map.
- `frontend/src/pages/NotFoundPage.tsx` — 404 Not Found page component — handles invalid routes with a user-friendly message.

**Feature Instruction:**

## Design Tokens
- Navbar: bg-[#A0522D] text-white
- Primary CTA: bg-[#FF4500] hover:bg-[#E04000] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200
- Brand text accent: text-[#A0522D]
- Section bg: bg-[#FFF8E1] (odd sections) / bg-white (even sections)
- Card: bg-white rounded-xl shadow-md border border-gray-100 p-6
- Section container: <section className="py-16 px-4"><div className="max-w-7xl mx-auto">
- Hero h1: text-4xl md:text-6xl font-bold text-white
- Body: text-[#362419] leading-relaxed

This `core-ui` feature provides the foundational UI structure and core pages for the Hotel Chul Mutton Baner application. It includes the global Axios configuration, the main React application setup, shared layout components (Header, Footer, Layout, WhatsAppCta), and the primary public-facing pages (HomePage, AboutPage, ContactPage, NotFoundPage). The design emphasizes authenticity and rustic warmth, using earthy tones and high-impact food imagery, while maintaining a clean and modern user experience.

### `frontend/src/api/client.ts`
This file configures the global Axios instance. It sets the `baseURL` to `/api/v1` and includes an interceptor to attach the JWT token from `localStorage` (key: 'token') to every outgoing request's `Authorization` header. It also handles refreshing the token or redirecting to the login page if the token is invalid or expired, although token refresh logic is not implemented in this feature and would be handled by the `auth-ui` feature.

### `frontend/src/App.tsx`
This is the root component of the application. It sets up the `react-router-dom` for navigation and wraps the entire application with necessary context providers: `AuthContext` (from `auth-ui`), `CartContext` (from `order-flow`), and `LocationContext` (from `location-ui`). This ensures that authentication state, cart data, and selected location are globally available to all components. The main routing logic is defined here, mapping paths to the respective page components.

### `frontend/src/components/Layout.tsx`
This component defines the main layout for all public-facing pages. It includes the `Header` at the top, the `Footer` at the bottom, and a `WhatsAppCta` button for customer support. The `children` prop is used to render the specific page content within this consistent layout. The layout applies the `bg-[#FFF8E1]` background color to the main content area.

### `frontend/src/components/Header.tsx`
This component renders the site-wide header. It includes the restaurant's logo (Hotel Chul Mutton Baner), primary navigation links (Home, Menu, Reservations, About, Contact, Gallery, Catering), a `LocationSelector` component (from `location-ui`) to allow users to choose their preferred branch, and a cart icon (from `order-flow`) that displays the number of items in the cart. The header uses `bg-[#A0522D]` for its background and `text-white` for its text.

### `frontend/src/components/Footer.tsx`
This component provides the site-wide footer, displaying essential business information. It includes the restaurant's name, address (1, Hotel Chul Mutton Baner - Sagar Takawale Group of Hotels, Hotel Chul Mutton Survey no 119/5/11 and 120, 6, Balewadi High St, near My World Society, Baner, Pune, Maharashtra 411045), phone number (072728 15555), opening hours, social media links, and quick navigation links. The footer uses `bg-[#362419]` for its background and `text-white` for its text.

### `frontend/src/components/shared/WhatsAppCta.tsx`
This component renders a floating WhatsApp call-to-action button. When clicked, it opens a WhatsApp chat with the business phone number (072728 15555). It should be positioned fixed at the bottom right of the screen and use a distinct brand color for visibility.

### `frontend/src/pages/HomePage.tsx`
This is the landing page of the application, designed to welcome users and showcase the restaurant's offerings. It integrates several sub-components:
1.  `HeroSection`: Displays a prominent hero image and headline.
2.  `ReopeningBanner`: Informs users about the restaurant's reopening status.
3.  `FeaturedDishes`: Showcases popular menu items, fetching data using `useMenu` hook from `menu-display`.
4.  `Testimonials`: Presents customer reviews.
5.  `LocationMap`: Embeds a Google Map showing the restaurant's location.
Each section should use the defined design tokens for consistent styling.

### `frontend/src/components/home/HeroSection.tsx`
This component creates a full-bleed hero section. It features a high-impact food image (`https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80`) with a `bg-black bg-opacity-50` overlay. The main headline should be "Hotel Chul Mutton Baner: Authentic Indian Flavors" and the sub-headline "Experience the rich culinary tradition of the Sagar Takawale Group of Hotels." It includes a primary call-to-action button "View Our Menu" that navigates to `/menu` and a secondary button "Book a Table" that navigates to `/reservations`. Both buttons use the defined CTA design tokens.

### `frontend/src/components/home/ReopeningBanner.tsx`
This component displays a prominent banner to inform customers about the restaurant's reopening. It should feature a message like "We're thrilled to announce our grand reopening! Join us for an unforgettable dining experience." and potentially a date or a link to reservations. It uses a `bg-[#F4A460]` background with `text-[#362419]` for high visibility.

### `frontend/src/components/home/FeaturedDishes.tsx`
This component displays a selection of featured dishes. It will use the `useMenu` hook (from `menu-display`) to fetch a limited number of menu items, perhaps filtering by a 'featured' category or simply taking the first few items. Each dish is presented in a `MenuItemCard` (from `menu-display`) or a similar card structure, showcasing its image, name, and price. The section title should be "Our Signature Delights" and the section uses the `Section container` design token.

### `frontend/src/components/home/Testimonials.tsx`
This component displays customer testimonials. It should present a carousel or grid of quotes from satisfied customers, emphasizing the authentic flavors and quality service of Hotel Chul Mutton Baner. Placeholder testimonials should be used, e.g., "An unparalleled culinary journey! The flavors transported me back to India." - A Satisfied Customer. The section title should be "What Our Guests Say" and the section uses the `Section container` design token.

### `frontend/src/components/home/LocationMap.tsx`
This component embeds a Google Map to display the restaurant's location. It uses the coordinates `18.567057` (latitude) and `73.804822` (longitude - corrected from prompt to be a valid coordinate) to center the map on Hotel Chul Mutton Baner. It should include a marker for the restaurant's exact address and provide a link to Google Maps for directions. The section title should be "Find Us Here" and the section uses the `Section container` design token.

### `frontend/src/pages/AboutPage.tsx`
This static page provides details about the Hotel Chul Mutton Baner brand and its culinary philosophy. It should include sections on the history of the 'Chul' cooking tradition, the restaurant's commitment to authentic Indian flavors, and the story of the Sagar Takawale Group of Hotels. The content should reflect a confident, authentic, and celebratory tone. The page content is wrapped in the `Layout` component.

### `frontend/src/pages/ContactPage.tsx`
This page displays all contact details for Hotel Chul Mutton Baner. It includes the address (1, Hotel Chul Mutton Baner - Sagar Takawale Group of Hotels, Hotel Chul Mutton Survey no 119/5/11 and 120, 6, Balewadi High St, near My World Society, Baner, Pune, Maharashtra 411045), phone number (072728 15555), and opening hours. It also features a contact form for general inquiries and an embedded map (similar to `LocationMap.tsx`) showing the location. The page content is wrapped in the `Layout` component.

### `frontend/src/pages/NotFoundPage.tsx`
This page serves as a user-friendly 404 error page for invalid routes. It should display a clear message like "Oops! Page Not Found" and provide a link back to the home page. The page content is wrapped in the `Layout` component.


---

## Authentication UI

**Name:** `auth-ui`  
**Type:** FRONTEND  
**Change required:** false

**Files in this feature:**
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/services/authService.ts`
- `frontend/src/hooks/useAuth.ts`
- `frontend/src/types/auth.ts`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/components/ProtectedRoute.tsx`

**Feature Instruction:**

This feature provides the complete user authentication and authorization UI for Hotel Chul Mutton Baner. It includes a React Context (`AuthContext.tsx`) to manage global authentication state (user, token, login/logout functions), a service (`authService.ts`) to interact with the backend authentication API, a custom hook (`useAuth.ts`) for easy consumption of the context, and TypeScript types (`auth.ts`) for authentication-related data. The `LoginPage.tsx` provides the user interface for logging in and registering, while the `ProtectedRoute.tsx` component ensures that certain routes are only accessible to authenticated users, optionally checking for specific roles. The authentication token is stored in `localStorage` under the key 'token'.

## Design Tokens
- Navbar: bg-[#362419] text-white
- Primary CTA: bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200
- Brand text accent: text-[#A0522D]
- Section bg: bg-[#FFF8E1] (odd sections) / bg-[#FDF5E6] (even sections)
- Card: bg-white rounded-xl shadow-md border border-gray-100 p-6
- Section container: <section className="py-16 px-4"><div className="max-w-7xl mx-auto">
- Hero h1: text-4xl md:text-6xl font-bold text-white
- Body: text-[#362419] leading-relaxed

### AuthContext.tsx
This file defines the `AuthContext` which holds the authentication state (`user`, `token`, `isAuthenticated`, `isLoading`) and provides `login`, `logout`, and `register` functions. It uses `authService.ts` to make API calls and stores the token in `localStorage`. The `AuthContext.Provider` wraps the application to make the authentication state available globally.

- `AuthContext.Provider`:
  - On mount, it attempts to load the token from `localStorage`.
  - If a token exists, it sets `isAuthenticated` to `true` and `user` (if user details can be decoded/retrieved).
  - Provides `login`, `logout`, and `register` functions to its children.

- `login(credentials: AuthRequest)`: Promise<void>
  1. Calls `authService.login(credentials)`.
  2. If successful, stores the `token` from the `AuthResponse` in `localStorage` under the key 'token'.
  3. Sets `isAuthenticated` to `true` and `user` (e.g., by decoding the token or making a separate API call to get user details).
  4. Navigates the user to the home page or a dashboard.
  5. If an error occurs, it should be caught and handled (e.g., display an error message).

- `register(userData: AuthRequest)`: Promise<void>
  1. Calls `authService.register(userData)`.
  2. If successful, stores the `token` from the `AuthResponse` in `localStorage` under the key 'token'.
  3. Sets `isAuthenticated` to `true` and `user`.
  4. Navigates the user to the home page or a dashboard.
  5. If an error occurs, it should be caught and handled.

- `logout()`: void
  1. Removes the 'token' from `localStorage`.
  2. Sets `isAuthenticated` to `false` and `user` to `null`.
  3. Navigates the user to the login page.

### authService.ts
This service handles the actual API calls to the backend authentication endpoints.

- `login(credentials: AuthRequest)`: Promise<AuthResponse>
  1. Makes a POST request to `/api/auth/login` with `credentials` as the request body.
  2. Returns the `AuthResponse` containing the token.
  3. Throws an error if the login fails (e.g., 401 Unauthorized).

- `register(userData: AuthRequest)`: Promise<AuthResponse>
  1. Makes a POST request to `/api/auth/register` with `userData` as the request body.
  2. Returns the `AuthResponse` containing the token.
  3. Throws an error if the registration fails (e.g., 400 Bad Request).

### useAuth.ts
This custom hook provides a convenient way for components to access the authentication context.

- `useAuth()`: AuthContextType
  1. Returns the context value from `AuthContext`.
  2. Throws an error if `useAuth` is called outside of an `AuthContext.Provider`.

### auth.ts
This file defines the TypeScript interfaces for authentication-related data transfer objects.

- `AuthRequest`: Defines the structure for login/registration requests.
- `AuthResponse`: Defines the structure for login/registration responses.
- `User`: Defines the structure for user information (e.g., id, username, role).

### LoginPage.tsx
This page provides the user interface for logging in and registering. It uses the `useAuth` hook to interact with the authentication context.

- The page should have two main sections: one for login and one for registration, possibly using tabs or a toggle.
- **Login Form:**
  - Fields: `username` (text input), `password` (password input).
  - Submit button: "Login to Savor the Tradition" (bg-[#A0522D]).
  - Calls `login` from `useAuth` on form submission.
  - Displays error messages if login fails.
- **Registration Form:**
  - Fields: `username` (text input), `password` (password input), `confirm password` (password input).
  - Submit button: "Join Our Culinary Journey" (bg-[#A0522D]).
  - Calls `register` from `useAuth` on form submission.
  - Displays error messages if registration fails (e.g., passwords don't match, username already exists).
- The page should be wrapped in `<Layout>` from `@/components/Layout`.

### ProtectedRoute.tsx
This component acts as a wrapper to protect routes based on authentication status and user roles. It uses the `useAuth` hook to check the user's authentication state.

- `ProtectedRoute` component:
  - Props: `children: React.ReactNode`, `allowedRoles?: string[]`.
  - If `isLoading` is true, it renders a loading spinner or `null`.
  - If `isAuthenticated` is false, it redirects to `/login`.
  - If `allowedRoles` are provided, it checks if the authenticated user's role is included in `allowedRoles`.
  - If the user's role is not allowed, it redirects to an unauthorized page or the home page.
  - If authenticated and authorized, it renders `children`.

---

## Location UI

**Name:** `location-ui`  
**Type:** FRONTEND  
**Change required:** false

**Files in this feature:**
- `frontend/src/context/LocationContext.tsx` — React context for managing the currently selected restaurant location, providing `selectedLocation: Location | null` and `setSelectedLocation: (location: Location | null) => void` to its consumers.
- `frontend/src/services/locationService.ts` — SERVICE layer — implements `getAllLocations(): Promise<Location[]>` to fetch all restaurant locations from the backend.
- `frontend/src/hooks/useLocations.ts` — Custom hook for fetching and managing location data, providing `locations: Location[]`, `loading: boolean`, and `error: Error | null`.
- `frontend/src/types/location.ts` — TypeScript types and interfaces for restaurant locations, mirroring the backend `LocationDto`.
- `frontend/src/components/shared/LocationSelector.tsx` — A dropdown component allowing users to select their preferred restaurant location, consuming `LocationContext`.

**Feature Instruction:**

This feature provides the frontend logic and UI components for managing and displaying restaurant locations. It allows users to select a preferred location, which then influences other parts of the application, such as menu display or reservation booking. The feature consists of a React Context (`LocationContext.tsx`) to hold the currently selected location, a service (`locationService.ts`) to interact with the backend location API, a custom hook (`useLocations.ts`) to fetch and manage location data, a type definition file (`location.ts`), and a UI component (`LocationSelector.tsx`) for users to choose a location.

## Design Tokens
- Primary: bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200
- Secondary: bg-[#F4A460] hover:bg-[#CD853F] text-[#362419] font-semibold rounded-full px-8 py-3 transition-all duration-200
- Accent: text-[#FF4500]
- Background: bg-[#FFF8E1]
- Text: text-[#362419]
- Section container: <section className="py-16 px-4 bg-[#FFF8E1]"><div className="max-w-7xl mx-auto">
- Card: bg-white rounded-xl shadow-md border border-gray-100 p-6

### `frontend/src/types/location.ts`
This file defines the `Location` interface, which mirrors the `LocationDto` from the backend `location-management` feature. It ensures type safety across the frontend application when dealing with location data.

### `frontend/src/services/locationService.ts`
This service provides an asynchronous function `getAllLocations()` that makes an HTTP GET request to the `/api/v1/locations` endpoint of the `location-management` backend feature. It uses the `apiClient` from `frontend/src/api/client.ts` to perform the request and returns a `Promise<Location[]>`.

### `frontend/src/hooks/useLocations.ts`
This custom React hook, `useLocations()`, fetches all available locations using `locationService.getAllLocations()`. It manages the loading state and any errors during the API call. It returns an object containing `locations: Location[]`, `loading: boolean`, and `error: Error | null`.

### `frontend/src/context/LocationContext.tsx`
This file defines the `LocationContext` and `LocationProvider`. The `LocationContext` holds the currently selected `Location` and a function `setSelectedLocation(location: Location | null)` to update it. The `LocationProvider` wraps the application (or a part of it) and makes the selected location and the setter function available to its children. It initializes the selected location to `null` and uses the `useLocations` hook to fetch all available locations. It also stores the selected location's ID in `localStorage` under the key `selectedLocationId` to persist the user's choice across sessions. If a `selectedLocationId` is found in `localStorage` on initial load, it attempts to set that location as the default.

### `frontend/src/components/shared/LocationSelector.tsx`
This component is a dropdown that allows users to select a restaurant location. It consumes the `LocationContext` to get the list of available locations and to set the currently selected location. The dropdown displays the `name` of each `Location`. When a user selects a location, `setSelectedLocation` from the context is called with the chosen `Location` object. The component should display the currently selected location's name as the default value. If no location is selected, it should display a placeholder like "Select a location". The styling should align with the rustic warmth and premium feel of the brand, using design tokens for colors and fonts. The dropdown should be easily accessible and visually appealing, reflecting the confident and authentic tone.

---

## Menu Display

**Name:** `menu-display`  
**Type:** FRONTEND  
**Change required:** false

**Files in this feature:**
- `frontend/src/services/menuService.ts` — SERVICE layer — provides functions for making API calls to menu-related endpoints, specifically `getAllMenuItems(): Promise<MenuItemDto[]>` and `getAllMenuItemCategories(): Promise<MenuItemCategoryDto[]>`.
- `frontend/src/hooks/useMenu.ts` — HOOK layer — provides a custom React hook `useMenu()` for fetching and managing menu data, exposing `menuItems`, `categories`, `loading`, `error`, `filterByCategory`, and `searchMenuItems`.
- `frontend/src/types/menu.ts` — Generated from the backend API contract — defines TypeScript types for menu items and categories.
- `frontend/src/pages/MenuPage.tsx` — PAGE layer — displays the full restaurant menu, utilizing `useMenu` for data, `MenuCategoryFilter` for category selection, and `MenuItemGrid` for item display.
- `frontend/src/components/menu/MenuCategoryFilter.tsx` — COMPONENT layer — provides a filter UI for menu categories, accepting `categories` and an `onSelectCategory` callback.
- `frontend/src/components/menu/MenuItemGrid.tsx` — COMPONENT layer — displays a grid of `MenuItemCard` components, accepting a list of `menuItems`.
- `frontend/src/components/menu/MenuItemCard.tsx` — COMPONENT layer — displays a single menu item and provides an 'Add to Cart' button, interacting with `CartContext`.

**Feature Instruction:**

## Design Tokens
- Navbar: bg-[#362419] text-white
- Primary CTA: bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200
- Brand text accent: text-[#A0522D]
- Section bg: bg-[#FFF8E1] (odd sections) / bg-white (even sections)
- Card: bg-white rounded-xl shadow-md border border-gray-100 p-6
- Section container: <section className="py-16 px-4"><div className="max-w-7xl mx-auto">
- Hero h1: text-4xl md:text-6xl font-bold text-white
- Body: text-[#362419] leading-relaxed

This `menu-display` feature is responsible for presenting the full menu of Hotel Chul Mutton Baner to customers, allowing them to browse by category and view individual menu items. It integrates with the `menu-management-api` backend feature to fetch menu data and with the `order-flow` feature's `CartContext` to enable adding items to the cart.

The `menuService.ts` file acts as the data access layer, providing asynchronous functions to interact with the backend menu API. It exposes `getAllMenuItems()` to fetch all available menu items and `getAllMenuItemCategories()` to retrieve all defined menu categories. These functions utilize an `apiClient` (from `frontend/src/api/client.ts`) to make HTTP requests.

The `useMenu.ts` hook consumes the `menuService.ts` to provide menu items, categories, and loading/error states to React components. It offers a `menuItems` array, `categories` array, `loading` boolean, and `error` object. It also provides `filterByCategory(categoryId: UUID | null)` and `searchMenuItems(query: string)` functions to enable dynamic filtering and searching of menu items on the frontend.

The `menu.ts` file defines the TypeScript interfaces for `MenuItemDto` and `MenuItemCategoryDto`, mirroring the DTOs exposed by the `menu-management-api` backend. These types ensure strong typing throughout the frontend application when handling menu data.

The `MenuPage.tsx` component is the main entry point for displaying the menu. It uses the `useMenu` hook to fetch and manage menu data. It renders a `MenuCategoryFilter` component to allow users to filter items by category and a `MenuItemGrid` component to display the filtered menu items. The page structure should reflect the 'authentic and rustic warmth' design direction, using earthy tones and high-impact food imagery. The main heading should be "Our Culinary Delights" with a confident and celebratory tone.

The `MenuCategoryFilter.tsx` component receives the list of categories and a callback function (`onSelectCategory`) from `MenuPage.tsx`. It renders a set of clickable tabs or buttons, each representing a menu category. When a category is selected, it calls `onSelectCategory` with the `categoryId`.

`MenuItemGrid.tsx` receives a list of `MenuItemDto` objects and renders them in a responsive grid layout. For each `MenuItemDto`, it renders a `MenuItemCard` component.

`MenuItemCard.tsx` displays the details of a single `MenuItemDto`, including its `name`, `description`, `price`, and `imageUrl`. It also includes an "Add to Cart" button. When clicked, this button dispatches an action to the `CartContext` (from the `order-flow` feature) to add the item to the user's shopping cart. The card design should be clean and modern, reflecting the premium yet welcoming feel.

**Inter-file Wiring:**
- `MenuPage.tsx` imports and uses `useMenu.ts`, `MenuCategoryFilter.tsx`, and `MenuItemGrid.tsx`.
- `useMenu.ts` imports and uses `menuService.ts`.
- `MenuItemGrid.tsx` imports and uses `MenuItemCard.tsx`.
- `MenuItemCard.tsx` imports and uses `CartContext` from `order-flow`.

**Cross-feature Contracts:**
- `menuService.ts` calls the `menu-management-api` backend endpoints:
  - `GET /api/v1/menu/items` to fetch all menu items.
  - `GET /api/v1/menu/items/category/{categoryId}` to fetch menu items by category.
  - `GET /api/v1/menu/categories` to fetch all menu categories.
- `MenuItemCard.tsx` interacts with the `CartContext` from the `order-flow` feature to add items to the cart. It expects a `addToCart` function from the `CartContext`.

---

## Online Ordering Flow

**Name:** `order-flow`  
**Type:** FRONTEND  
**Change required:** true

**Files in this feature:**
- `frontend/src/context/CartContext.tsx` — React context for managing the state of the user's shopping cart; provides `cart` (Cart), `addItem` (function), `removeItem` (function), `updateQuantity` (function), and `clearCart` (function) to its consumers.
- `frontend/src/services/local/cartService.ts` — Local service for persisting and retrieving cart state from localStorage; implements `getCart(): Cart`, `saveCart(cart: Cart): void`, `addItemToCart(item: CartItem): Cart`, `removeItemFromCart(menuItemId: UUID): Cart`, `updateItemQuantity(menuItemId: UUID, quantity: number): Cart`, and `clearCart(): void`.
- `frontend/src/types/local/cart.ts` — TypeScript types for the local shopping cart.
- `frontend/src/services/orderService.ts` — Provides functions for making API calls to order-related endpoints; implements `createOrder(order: CreateOrderRequest): Promise<OrderResponse>`, `getOrderById(orderId: UUID): Promise<OrderResponse>`, and `getMyOrders(): Promise<OrderResponse[]>`.
- `frontend/src/hooks/useOrders.ts` — Custom hook for creating, fetching, and managing order data; exposes `createOrder` (async function), `getOrderById` (async function), `myOrders` (OrderResponse[]), `loading` (boolean), `error` (Error | null), and `fetchMyOrders` (async function).
- `frontend/src/types/order.ts` — TypeScript types and interfaces for orders and order items.
- `frontend/src/pages/CheckoutPage.tsx` — Multi-step page for order checkout, including cart summary, address form, and payment.
- `frontend/src/pages/OrderConfirmationPage.tsx` — Displays a summary of the successfully placed order.
- `frontend/src/pages/OrderHistoryPage.tsx` — Allows logged-in users to view their past orders.
- `frontend/src/components/order/CartSummary.tsx` — Component showing the items in the cart, quantities, and total price.
- `frontend/src/components/order/DeliveryAddressForm.tsx` — A form for users to enter their delivery address and contact information.
- `frontend/src/components/order/PaymentOptions.tsx` — Component to select a payment method and trigger the payment process.

**Feature Instruction:**

## Design Tokens
- Navbar: bg-[#362419] text-white
- Primary CTA: bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200
- Brand text accent: text-[#A0522D]
- Section bg: bg-[#FFF8E1] (odd sections) / bg-white (even sections)
- Card: bg-white rounded-xl shadow-md border border-gray-100 p-6
- Section container: <section className="py-16 px-4"><div className="max-w-7xl mx-auto">
- Hero h1: text-4xl md:text-6xl font-bold text-white
- Body: text-[#362419] leading-relaxed

This feature implements the complete online ordering flow for Hotel Chul Mutton Baner, from managing the user's shopping cart locally to placing an order via the backend API and viewing order history. It consists of local cart management, API integration for orders, and user interface components and pages.

### Cart Management

**`frontend/src/types/local/cart.ts`** defines the TypeScript types `CartItem` and `Cart` for the local shopping cart. `CartItem` includes `menuItemId` (UUID), `name` (string), `price` (number), `quantity` (number), and `imageUrl` (string). `Cart` contains an array of `CartItem`s and a `totalAmount` (number).

**`frontend/src/services/local/cartService.ts`** provides utility functions for interacting with the browser's `localStorage` to persist and retrieve the cart state. It exposes `getCart()`, `saveCart(cart: Cart)`, `addItemToCart(item: CartItem)`, `removeItemFromCart(menuItemId: UUID)`, `updateItemQuantity(menuItemId: UUID, quantity: number)`, and `clearCart()`. These functions ensure the cart state is maintained across sessions.

**`frontend/src/context/CartContext.tsx`** establishes a React Context for the shopping cart. `CartProvider` wraps the application, making the cart state and actions available to all child components. The `useCart` hook allows components to consume the context, providing access to the current `cart` (Cart), `addItem` (item: CartItem), `removeItem` (menuItemId: UUID), `updateQuantity` (menuItemId: UUID, quantity: number), and `clearCart` functions. These functions internally call the corresponding `cartService` methods to manage the cart state and persist it to `localStorage`.

### Order API Integration

**`frontend/src/types/order.ts`** defines the data transfer objects (DTOs) for communicating with the backend order-management-api. Key types include `OrderItemRequest` (for sending items in a new order), `CreateOrderRequest` (for creating a new order, including `orderItems`, `deliveryAddress`, and `orderType`), `OrderItemResponse` (for items returned in an order response), and `OrderResponse` (for a complete order returned from the API).

**`frontend/src/services/orderService.ts`** acts as the client for the backend order-management-api. It uses `frontend/src/api/client.ts` to make authenticated HTTP requests. It provides `createOrder(order: CreateOrderRequest): Promise<OrderResponse>` (POST /api/v1/orders), `getOrderById(orderId: UUID): Promise<OrderResponse>` (GET /api/v1/orders/{orderId}), and `getMyOrders(): Promise<OrderResponse[]>` (GET /api/v1/orders/my-orders). These functions handle the network communication and data serialization/deserialization.

**`frontend/src/hooks/useOrders.ts`** is a custom React hook that encapsulates the logic for interacting with the `orderService`. It provides state management for loading, errors, and fetched order data. Components can use `useOrders` to `createOrder(order: CreateOrderRequest)`, `getOrderById(orderId: UUID)`, and access `myOrders` (List<OrderResponse>), `loading` (boolean), `error` (Error | null), and `fetchMyOrders()` to refresh the user's order history.

### User Interface

**`frontend/src/components/order/CartSummary.tsx`** is a React component that displays the contents of the user's shopping cart. It consumes the `CartContext` via `useCart` to render the list of `CartItem`s, their quantities, individual prices, and the total amount. It allows users to adjust item quantities or remove items from the cart.

**`frontend/src/components/order/DeliveryAddressForm.tsx`** is a React component that provides a form for users to input their delivery address and contact information during checkout. It takes an `onSubmit` prop, which is a callback function `(address: { fullName: string, phoneNumber: string, streetAddress: string, city: string, state: string, zipCode: string }) => void` that will be invoked with the collected address data upon submission.

**`frontend/src/components/order/PaymentOptions.tsx`** is a React component that presents payment method options (e.g., Cash on Delivery, simulated online payment). It takes an `onPaymentSuccess` prop, a callback function `() => void` that is executed when a payment is successfully processed (simulated in this component).

**`frontend/src/pages/CheckoutPage.tsx`** orchestrates the multi-step checkout process. It uses `useCart` to access cart data, `DeliveryAddressForm` to collect address details, and `PaymentOptions` to handle payment. Upon successful payment and address submission, it calls `useOrders().createOrder()` to place the order with the backend. After a successful order creation, it clears the cart using `useCart().clearCart()` and navigates the user to the `OrderConfirmationPage`.

**`frontend/src/pages/OrderConfirmationPage.tsx`** displays a summary of a successfully placed order. It retrieves the `orderId` from the URL parameters and uses `useOrders().getOrderById(orderId)` to fetch the order details from the backend. It presents the order number, items, total amount, and delivery information to the user.

**`frontend/src/pages/OrderHistoryPage.tsx`** allows logged-in users to view their past orders. It uses `useOrders().fetchMyOrders()` to retrieve all orders associated with the current user and displays them in a list. Each order entry should provide a link or button to view detailed information on the `OrderConfirmationPage`.

All pages (`CheckoutPage.tsx`, `OrderConfirmationPage.tsx`, `OrderHistoryPage.tsx`) must be wrapped in the `<Layout>` component from `core-ui` to ensure consistent navigation and footer across the application.

---

## Table Reservation Booking

**Name:** `reservation-booking`  
**Type:** FRONTEND  
**Change required:** false

**Files in this feature:**
- `frontend/src/services/reservationService.ts`
- `frontend/src/hooks/useReservations.ts`
- `frontend/src/types/reservation.ts`
- `frontend/src/pages/ReservationPage.tsx`
- `frontend/src/components/reservation/ReservationForm.tsx`
- `frontend/src/components/reservation/BookingConfirmation.tsx`

**Feature Instruction:**

## Design Tokens
- Navbar: bg-[#362419] text-white
- Primary CTA: bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200
- Brand text accent: text-[#A0522D]
- Section bg: bg-[#FFF8E1] (odd sections) / bg-white (even sections)
- Card: bg-white rounded-xl shadow-md border border-gray-100 p-6
- Section container: <section className="py-16 px-4"><div className="max-w-7xl mx-auto">
- Hero h1: text-4xl md:text-6xl font-bold text-white
- Body: text-[#362419] leading-relaxed

This feature provides the user interface and logic for customers to book table reservations at Hotel Chul Mutton Baner. It consists of a `ReservationPage` where users can input reservation details, a `ReservationForm` component for capturing these details, and a `BookingConfirmation` component to display the reservation outcome. The `reservationService.ts` handles API communication with the backend `reservation-system` feature, while `useReservations.ts` provides a custom React hook to manage reservation state and logic within components. The `reservation.ts` file defines the necessary TypeScript types for reservation data.

### `reservationService.ts`
This service file exports an asynchronous function `createReservation` that takes a `CreateReservationRequest` object as input. It makes a POST request to the `/api/v1/reservations` endpoint of the `reservation-system` backend feature. On success, it returns a `ReservationDto` object. In case of an error, it logs the error and re-throws it.

### `useReservations.ts`
This custom React hook, `useReservations`, provides state management for the reservation process. It exposes a `createReservation` function that takes a `CreateReservationRequest` and calls the `reservationService.createReservation` function. It manages loading and error states, and stores the confirmed reservation details in a `confirmedReservation` state variable. It also provides a `clearConfirmedReservation` function to reset the state.

### `reservation.ts`
This file defines the TypeScript interfaces for `ReservationDto` and `CreateReservationRequest`, mirroring the backend DTOs from the `reservation-system` feature. It also defines the `ReservationStatus` enum.

### `ReservationPage.tsx`
This page component is the main entry point for table reservations. It uses the `Layout` component from `core-ui` for consistent navigation and footer. The page displays a prominent heading "Book Your Table at Hotel Chul Mutton Baner" with a confident and celebratory tone. It conditionally renders either the `ReservationForm` or the `BookingConfirmation` component based on whether a reservation has been confirmed. The `ReservationForm` is passed a `onSubmit` prop which calls the `createReservation` function from `useReservations`. The `BookingConfirmation` component receives the `confirmedReservation` details and a `onNewBooking` prop to allow users to make another reservation.

### `ReservationForm.tsx`
This component provides the form for users to input their reservation details. It takes an `onSubmit` prop, which is a function that receives a `CreateReservationRequest` object. The form includes fields for `customerName`, `customerEmail`, `customerPhone`, `numberOfGuests`, `reservationTime` (date and time pickers), `locationId` (a dropdown for selecting a location, potentially using `useLocationContext` from `location-ui` to fetch available locations), and `specialRequests`. The form should have appropriate validation for each field. The submit button will have the primary CTA styling.

### `BookingConfirmation.tsx`
This component displays the details of a successfully confirmed reservation. It receives a `ReservationDto` object as `reservation` prop and an `onNewBooking` function. It presents the reservation ID, customer name, email, phone, number of guests, reservation time, location, and any special requests. It includes a button to "Make Another Reservation" styled with the primary CTA, which triggers the `onNewBooking` function.

---

## Photo & Video Gallery

**Name:** `gallery-display`  
**Type:** FRONTEND  
**Change required:** false

**Files in this feature:**
- `frontend/src/services/galleryService.ts` — SERVICE layer — provides functions for making API calls to gallery endpoints, specifically getAllGalleryItems(): Promise<GalleryItem[]>.
- `frontend/src/hooks/useGallery.ts` — Custom hook for fetching gallery images and videos, exposing galleryItems: GalleryItem[], loading: boolean, and error: Error | null.
- `frontend/src/types/gallery.ts` — Generated from the backend API contract — TypeScript types and interfaces for gallery items.
- `frontend/src/pages/GalleryPage.tsx` — PAGE component — displays a grid of high-quality food and restaurant photos and videos by utilizing the useGallery hook and the GalleryGrid component.
- `frontend/src/components/gallery/GalleryGrid.tsx` — COMPONENT layer — a responsive grid component for displaying gallery items, accepting an array of GalleryItem[] as props.

**Feature Instruction:**

The `gallery-display` feature provides a public-facing photo and video gallery for Hotel Chul Mutton Baner, showcasing its authentic dishes and ambiance. It consists of a service, a custom hook, type definitions, a page component, and a grid component.

## Design Tokens
- Navbar: bg-[#362419] text-white
- Primary CTA: bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200
- Brand text accent: text-[#A0522D]
- Section bg: bg-[#FFF8E1] (odd sections) / bg-[#FDF7E6] (even sections)
- Card: bg-white rounded-xl shadow-md border border-gray-100 p-6
- Section container: <section className="py-16 px-4"><div className="max-w-7xl mx-auto">
- Hero h1: text-4xl md:text-6xl font-bold text-[#362419]
- Body: text-[#362419] leading-relaxed

### `frontend/src/types/gallery.ts`
This file defines the `GalleryItem` interface, which represents the structure of a single gallery item (image or video) as received from the backend API. It includes `id` (UUID), `imageUrl` (string), `caption` (string), `category` (string), and `uploadDate` (string, ISO 8601 format).

### `frontend/src/services/galleryService.ts`
This service provides asynchronous functions to interact with the backend gallery API. It exports `getAllGalleryItems()` which makes a GET request to `/api/v1/gallery` and returns a `Promise<GalleryItem[]>`.

### `frontend/src/hooks/useGallery.ts`
This custom React hook, `useGallery`, encapsulates the logic for fetching gallery items. It uses `galleryService.getAllGalleryItems()` to retrieve data and manages loading and error states. It exposes `galleryItems: GalleryItem[]`, `loading: boolean`, and `error: Error | null`.

### `frontend/src/components/gallery/GalleryGrid.tsx`
This presentational component, `GalleryGrid`, receives an array of `GalleryItem[]` as props and renders them in a responsive grid layout. Each item in the grid will display the `imageUrl` and `caption`. The grid should be visually appealing, using a masonry-like layout or a simple responsive grid that adapts to different screen sizes, showcasing the high-quality food and restaurant photos and videos. It should use Tailwind CSS for styling, adhering to the design tokens.

### `frontend/src/pages/GalleryPage.tsx`
This page component, `GalleryPage`, is the entry point for the gallery feature. It uses the `useGallery` hook to fetch gallery items. It displays a prominent hero section at the top, followed by the `GalleryGrid` component to render the fetched items. The page should be wrapped in the `Layout` component from `core-ui`.

**Page Sections:**
1.  **Hero Section:**
    -   Background Image: `url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80')` with a `bg-black bg-opacity-50` overlay.
    -   Headline: "Our Culinary Journey: A Visual Feast"
    -   Subheadline: "Experience the authentic flavors and vibrant ambiance of Hotel Chul Mutton Baner through our captivating photo and video gallery."
    -   Styling: `text-white`, `text-center`, `py-20`.
2.  **Gallery Content Section:**
    -   Heading: "Moments from Our Kitchen and Table"
    -   Description: "A collection of our signature dishes, the warmth of our kitchen, and the joyful faces of our patrons. Each image tells a story of tradition, passion, and culinary excellence."
    -   This section will render the `GalleryGrid` component, passing the `galleryItems` fetched from `useGallery`.
    -   Styling: Uses `Section container` design token for padding and max-width. Background alternates between `bg-[#FFF8E1]` and `bg-[#FDF7E6]` for visual separation if there are multiple sections (though here it's one main section).

**Error Handling:**
-   If `useGallery` returns an error, `GalleryPage` should display a user-friendly error message.
-   If `useGallery` indicates loading, `GalleryPage` should display a loading spinner or skeleton UI.

---

## Catering Inquiry UI

**Name:** `catering-ui`  
**Type:** FRONTEND  
**Change required:** false

**Files in this feature:**
- `frontend/src/services/cateringService.ts` — SERVICE layer — provides functions for submitting catering inquiry forms by calling the backend API.
- `frontend/src/hooks/useCatering.ts` — Custom HOOK layer — manages state and submission logic for catering inquiry forms.
- `frontend/src/types/catering.ts` — Generated from the backend API contract — TypeScript types and interfaces for catering inquiries.
- `frontend/src/pages/CateringPage.tsx` — PAGE layer — displays information about catering services and hosts the catering inquiry form.
- `frontend/src/components/catering/CateringInquiryForm.tsx` — COMPONENT layer — provides a form for customers to submit catering inquiries.

**Feature Instruction:**

## Design Tokens
- Navbar: bg-[#362419] text-white
- Primary CTA: bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200
- Brand text accent: text-[#A0522D]
- Section bg: bg-[#FFF8E1] (odd sections) / bg-white (even sections)
- Card: bg-white rounded-xl shadow-md border border-gray-100 p-6
- Section container: <section className="py-16 px-4"><div className="max-w-7xl mx-auto">
- Hero h1: text-4xl md:text-6xl font-bold text-white
- Body: text-[#362419] leading-relaxed

This feature provides a user interface for customers to inquire about catering and bulk orders for Hotel Chul Mutton Baner. It consists of a dedicated page (`CateringPage.tsx`) that displays information about catering services and includes a form (`CateringInquiryForm.tsx`) for submitting inquiries. The form leverages a custom React hook (`useCatering.ts`) to manage its state and submission logic, which in turn interacts with a service (`cateringService.ts`) to communicate with the backend API. All data structures related to catering inquiries are defined in `catering.ts`.

### `CateringPage.tsx`
This page serves as the entry point for catering inquiries. It will display a hero section with a background image, a compelling headline, and a subheadline that reflects the restaurant's confident and authentic tone. Following the hero, there will be sections detailing the catering services offered, potentially including testimonials or example menus (though these are not part of this feature's implementation, placeholder text should be used). The core of the page will be the `CateringInquiryForm` component, allowing users to submit their requests.

### `CateringInquiryForm.tsx`
This component renders the actual form for customers to submit catering inquiries. It will collect details such as customer name, email, phone, event type, event date, number of guests, budget, and special requests. The form will use the `useCatering` hook to handle form state, validation, and submission. Upon successful submission, a success message should be displayed, and the form should be reset. Error messages should be displayed for invalid input or failed submissions.

### `useCatering.ts`
This custom React hook encapsulates the logic for managing catering inquiry form submissions. It provides state for form fields, loading status, and any submission errors. It exposes a `submitInquiry` function that takes a `CateringInquiryRequest` object and calls `cateringService.submitCateringInquiry`. It should handle loading states and error propagation from the service.

### `cateringService.ts`
This service file is responsible for making API calls to the backend's catering inquiry endpoint. It exports an asynchronous function `submitCateringInquiry` that takes a `CateringInquiryRequest` object and sends it to the `/api/v1/catering/inquiries` endpoint using the `apiClient` from `@/api/client.ts`. It should return a `CateringInquiryDto` upon successful submission or throw an error if the API call fails.

### `catering.ts`
This file defines the TypeScript interfaces for `CateringInquiryRequest` and `CateringInquiryDto`. These types ensure consistency between the frontend and the backend API contract for catering inquiries.

**Inter-file Wiring:**
- `CateringPage.tsx` renders `CateringInquiryForm.tsx`.
- `CateringInquiryForm.tsx` imports and uses the `useCatering` hook.
- `useCatering.ts` imports and calls `cateringService.submitCateringInquiry`.
- `cateringService.ts` uses `apiClient` (from `frontend/src/api/client.ts`) to make HTTP requests to the backend catering inquiry API.
- `cateringService.ts` and `useCatering.ts` import types from `catering.ts`.

**Cross-feature Contracts:**
- `cateringService.ts` calls the `catering-inquiry-system` backend feature's API endpoint:
  - `POST /api/v1/admin/catering/inquiries` with `CateringInquiryDto` as the request body and expecting `CateringInquiryDto` as the response. Note: The backend API contract for `catering-inquiry-system` only exposes an admin endpoint for creating inquiries. This implies that the frontend catering inquiry form will submit to this admin endpoint. This should be explicitly handled in the `cateringService.ts`.

---

## Admin Portal

**Name:** `admin-portal`  
**Type:** FRONTEND  
**Change required:** false

**Files in this feature:**
- `frontend/src/components/AdminLayout.tsx` — COMPONENT layer — provides the main layout for the admin dashboard, including a sidebar for navigation.
- `frontend/src/pages/AdminDashboardPage.tsx` — PAGE layer — the main landing page for the admin panel, showing key metrics and summaries.
- `frontend/src/pages/AdminLocationsPage.tsx` — PAGE layer — admin page for managing restaurant locations, with a table and create/edit forms.
- `frontend/src/components/admin/location/LocationsTable.tsx` — COMPONENT layer — a table component to display and manage all restaurant locations, exposing `onEdit` and `onDelete` callbacks.
- `frontend/src/components/admin/location/LocationForm.tsx` — COMPONENT layer — a form component (in a dialog) for creating or editing a location, exposing `onSubmit` and `onClose` callbacks.
- `frontend/src/pages/AdminMenuPage.tsx` — PAGE layer — admin page for managing menu items, featuring a data table, edit/create forms, and delete confirmation.
- `frontend/src/components/admin/menu/MenuTable.tsx` — COMPONENT layer — a table component to display and manage all menu items, exposing `onEdit` and `onDelete` callbacks.
- `frontend/src/components/admin/menu/MenuItemForm.tsx` — COMPONENT layer — a form component (in a dialog) for creating or editing a menu item, exposing `onSubmit` and `onClose` callbacks.
- `frontend/src/components/admin/menu/DeleteMenuItemDialog.tsx` — COMPONENT layer — a confirmation dialog for deleting a menu item, exposing `onConfirm` and `onCancel` callbacks.
- `frontend/src/pages/AdminOrdersPage.tsx` — PAGE layer — admin page for viewing and managing customer orders.
- `frontend/src/components/admin/order/OrdersTable.tsx` — COMPONENT layer — a table component to display all customer orders with filtering and status updates, exposing `onViewDetails` and `onUpdateStatus` callbacks.
- `frontend/src/components/admin/order/OrderDetailView.tsx` — COMPONENT layer — a detailed view (in a dialog or side panel) of a single order, exposing an `onClose` callback.
- `frontend/src/pages/AdminReservationsPage.tsx` — PAGE layer — admin page for viewing and managing table reservations.
- `frontend/src/components/admin/reservation/ReservationsTable.tsx` — COMPONENT layer — a table component to display all reservations with status updates, exposing an `onUpdateStatus` callback.
- `frontend/src/pages/AdminGalleryPage.tsx` — PAGE layer — admin page for uploading and managing gallery images and videos.
- `frontend/src/pages/AdminCateringPage.tsx` — PAGE layer — admin page for viewing and managing catering inquiries.

**Feature Instruction:**

## Design Tokens
- Navbar: bg-[#362419] text-white
- Sidebar: bg-[#362419] text-white
- Primary CTA: bg-[#A0522D] hover:bg-[#8B4513] text-white font-semibold rounded-full px-8 py-3 transition-all duration-200
- Brand text accent: text-[#A0522D]
- Section bg: bg-[#FFF8E1] (odd sections) / bg-[#FDF7E6] (even sections)
- Card: bg-white rounded-xl shadow-md border border-gray-100 p-6
- Section container: <section className="py-16 px-4"><div className="max-w-7xl mx-auto">
- Hero h1: text-4xl md:text-6xl font-bold text-white
- Body: text-[#362419] leading-relaxed

The Admin Portal feature provides a comprehensive dashboard for managing various aspects of the Hotel Chul Mutton Baner restaurant. It consists of a shared `AdminLayout` component for consistent navigation and structure across all admin pages, and individual pages for managing locations, menu items, orders, reservations, gallery content, and catering inquiries. Each management page utilizes specific hooks and components to interact with the backend APIs and display/edit data.

### AdminLayout.tsx
This component provides the overall layout for the admin dashboard. It includes a persistent sidebar for navigation to different admin sections (Dashboard, Locations, Menu, Orders, Reservations, Gallery, Catering) and a main content area where specific admin pages are rendered. The sidebar links should be styled to reflect the active page. The layout ensures a consistent user experience for administrators.

### AdminDashboardPage.tsx
This page serves as the landing page for the admin panel. It should display a summary of key metrics relevant to the restaurant's operations, such as total orders, pending reservations, new catering inquiries, and perhaps a quick overview of menu items or locations. This page will primarily fetch data from various backend endpoints to present a holistic view.

### AdminLocationsPage.tsx
This page allows administrators to manage restaurant locations. It uses the `useLocations` hook to fetch, create, update, and delete location data. The page renders a `LocationsTable` to display all locations and provides functionality to open a `LocationForm` in a dialog for adding new locations or editing existing ones. The `LocationsTable` will display `LocationDto` objects, showing `name`, `address`, `phone`, `latitude`, and `longitude`. The `LocationForm` will accept these fields for input.

### LocationsTable.tsx
This component is responsible for rendering a table of `LocationDto` objects. It will display columns for `name`, `address`, `phone`, `latitude`, and `longitude`. It should include actions for editing and deleting locations. When an edit action is triggered, it should call a prop function `onEdit` with the `LocationDto` to be edited. When a delete action is triggered, it should call a prop function `onDelete` with the `UUID` of the location to be deleted.

### LocationForm.tsx
This component provides a form for creating or editing a `LocationDto`. It should be rendered within a dialog. The form will have input fields for `name`, `address`, `phone`, `latitude`, and `longitude`. It will accept an optional `LocationDto` prop for pre-filling the form in edit mode. Upon submission, it will call an `onSubmit` prop function with the `LocationDto` data. It should also have an `onClose` prop to handle closing the dialog.

### AdminMenuPage.tsx
This page is for managing menu items. It uses the `useMenu` hook (from `menu-display` feature, but adapted for admin actions) to fetch, create, update, and delete menu items. It displays a `MenuTable` for listing menu items and provides buttons to open `MenuItemForm` for adding/editing items and `DeleteMenuItemDialog` for confirming deletions. The `MenuTable` will display `MenuItemDto` objects, including `name`, `description`, `price`, `imageUrl`, `category.name`, `locationId`, and `available`. The `MenuItemForm` will accept these fields for input, and also allow selecting a `categoryId` and `locationId` from available options (which need to be fetched). The `DeleteMenuItemDialog` will confirm deletion of a `MenuItemDto` by its `id`.

### MenuTable.tsx
This component displays a table of `MenuItemDto` objects. It should include columns for `name`, `description`, `price`, `imageUrl`, `category.name`, `locationId`, and `available`. It will provide actions for editing and deleting menu items. The `onEdit` prop will be called with the `MenuItemDto` to be edited, and the `onDelete` prop will be called with the `UUID` of the menu item to be deleted.

### MenuItemForm.tsx
This component provides a form for creating or editing a `MenuItemDto`. It should be rendered within a dialog. It will have input fields for `name`, `description`, `price`, `imageUrl`, and a checkbox for `available`. It will also include dropdowns to select a `MenuItemCategoryDto` (by `id`) and a `LocationDto` (by `id`). It accepts an optional `MenuItemDto` for pre-filling. Upon submission, it calls an `onSubmit` prop with the `CreateMenuItemRequest` data. It also has an `onClose` prop.

### DeleteMenuItemDialog.tsx
This component is a confirmation dialog for deleting a menu item. It takes a `MenuItemDto` as a prop to display the item's name for confirmation. It has an `onConfirm` prop that is called with the `UUID` of the item to be deleted, and an `onCancel` prop to close the dialog.

### AdminOrdersPage.tsx
This page allows administrators to view and manage customer orders. It uses the `useOrders` hook to fetch all orders and update their statuses. It displays an `OrdersTable` to list all orders and provides functionality to view order details in an `OrderDetailView` dialog. The `OrdersTable` will display `OrderResponse` objects, including `orderId`, `userId`, `orderType`, `orderStatus`, `totalAmount`, `orderDate`, and `deliveryAddress`. The `OrderDetailView` will show a detailed breakdown of a single `OrderResponse`.

### OrdersTable.tsx
This component displays a table of `OrderResponse` objects. It should include columns for `orderId`, `userId`, `orderType`, `orderStatus`, `totalAmount`, `orderDate`, and `deliveryAddress`. It will provide an action to view order details, calling an `onViewDetails` prop with the `OrderResponse`. It also includes functionality to update the `orderStatus` of an order, calling an `onUpdateStatus` prop with the `orderId` and the new `OrderStatus`.

### OrderDetailView.tsx
This component displays a detailed view of a single `OrderResponse`. It should be rendered within a dialog or side panel. It will show all fields of the `OrderResponse`, including a list of `OrderItemResponse` objects with their `menuItem` details and `quantity`. It should also provide an `onClose` prop to close the view.

### AdminReservationsPage.tsx
This page allows administrators to view and manage table reservations. It uses the `useReservations` hook to fetch all reservations and update their statuses. It displays a `ReservationsTable` to list all reservations. The `ReservationsTable` will display `ReservationDto` objects, including `id`, `customerName`, `customerEmail`, `customerPhone`, `numberOfGuests`, `reservationTime`, `location.name`, and `status`. It will also allow updating the `status` of a reservation.

### ReservationsTable.tsx
This component displays a table of `ReservationDto` objects. It should include columns for `id`, `customerName`, `customerEmail`, `customerPhone`, `numberOfGuests`, `reservationTime`, `location.name`, and `status`. It will provide functionality to update the `status` of a reservation, calling an `onUpdateStatus` prop with the `id` and the new `ReservationStatus`.

### AdminGalleryPage.tsx
This page allows administrators to upload and manage gallery images and videos. It uses the `useGallery` hook to fetch, create, update, and delete gallery items. It will display a grid or table of `GalleryItemDto` objects, with actions for editing and deleting. It will also include a form for uploading new gallery items, accepting `imageUrl`, `caption`, and `category`.

### AdminCateringPage.tsx
This page allows administrators to view and manage catering inquiries. It uses the `useCatering` hook to fetch all catering inquiries. It will display a table or list of `CateringInquiryDto` objects, showing details like `customerName`, `customerEmail`, `eventType`, `eventDate`, `numberOfGuests`, `budget`, `specialRequests`, and `inquiryDate`. It should also provide an option to delete inquiries.


---

## Infrastructure

**Name:** `infrastructure`  
**Type:** INFRA  
**Change required:** false

**Feature Instruction:**

_Not enriched (INFRA or skipped)._

---

