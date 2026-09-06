<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_login_with_seeded_developer_user(): void
    {
        $response = $this->postJson('/api/authentication/login', [
            'email' => 'developer@developer.com',
            'password' => 'test-password-123',
        ]);

        $response->assertStatus(200)
            ->assertJson(['status' => true]);

        $token = $response->json('access_token');
        $this->assertNotNull($token);
        $this->assertIsString($token);
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        $response = $this->postJson('/api/authentication/login', [
            'email' => 'developer@developer.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    public function test_protected_route_requires_authentication(): void
    {
        $this->getJson('/api/dashboard/overview')->assertStatus(401);
    }

    public function test_seeded_roles_have_status(): void
    {
        $this->assertDatabaseHas('roles', ['name' => 'Sys_admin', 'status' => 'active']);
        $this->assertSame(10, \Spatie\Permission\Models\Role::count());
        $this->assertSame(8, \App\Models\Database::count());
    }
}