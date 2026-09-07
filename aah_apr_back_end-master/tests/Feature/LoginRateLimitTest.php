<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginRateLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_login_is_rate_limited(): void
    {
        // 5 allowed attempts
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/authentication/login', [
                'email' => 'developer@developer.com',
                'password' => 'wrong-password',
            ])->assertStatus(401);
        }

        // 6th attempt should be throttled (429)
        $this->postJson('/api/authentication/login', [
            'email' => 'developer@developer.com',
            'password' => 'wrong-password',
        ])->assertStatus(429);
    }
}