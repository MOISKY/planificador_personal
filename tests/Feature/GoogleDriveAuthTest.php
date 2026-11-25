<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\GoogleDriveService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GoogleDriveAuthTest extends TestCase
{
    use RefreshDatabase;

    private ?string $previousTokenBackup = null;

    protected function setUp(): void
    {
        parent::setUp();

        $tokenPath = storage_path('app/google_drive_token.json');
        if (file_exists($tokenPath)) {
            $this->previousTokenBackup = (string) file_get_contents($tokenPath);
            @unlink($tokenPath);
        }

        config()->set('services.google', [
            'client_id' => 'test-client-id',
            'client_secret' => 'test-client-secret',
            'redirect_uri' => 'http://localhost/google/callback',
        ]);
    }

    protected function tearDown(): void
    {
        $tokenPath = storage_path('app/google_drive_token.json');
        if ($this->previousTokenBackup !== null) {
            file_put_contents($tokenPath, $this->previousTokenBackup);
        } elseif (file_exists($tokenPath)) {
            @unlink($tokenPath);
        }

        parent::tearDown();
    }

    private function writeToken(array $data): void
    {
        $tokenPath = storage_path('app/google_drive_token.json');
        if (! is_dir(dirname($tokenPath))) {
            mkdir(dirname($tokenPath), 0755, true);
        }
        file_put_contents($tokenPath, json_encode($data));
    }

    public function test_expired_token_with_failed_refresh_clears_token_and_disconnects(): void
    {
        $this->writeToken([
            'access_token' => 'expired-token',
            'refresh_token' => 'revoked-refresh-token',
            'expires_in' => 3600,
            'created_at' => time() - 7200,
        ]);

        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response([
                'error' => 'invalid_grant',
                'error_description' => 'Token has been expired or revoked.',
            ], 400),
        ]);

        $service = app(GoogleDriveService::class);
        $this->assertFalse($service->isConnected());
        $this->assertFileDoesNotExist(storage_path('app/google_drive_token.json'));
    }

    public function test_upload_with_invalid_credentials_returns_401_requires_auth_and_clears_token(): void
    {
        $user = User::factory()->create();

        $this->writeToken([
            'access_token' => 'revoked-access-token',
            'refresh_token' => 'valid-refresh',
            'expires_in' => 3600,
            'created_at' => time(),
        ]);

        Http::fake([
            'https://www.googleapis.com/drive/v3/files*' => Http::response([
                'error' => [
                    'code' => 401,
                    'message' => 'Request had invalid authentication credentials.',
                    'status' => 'UNAUTHENTICATED',
                ],
            ], 401),
        ]);

        $response = $this->actingAs($user)->postJson(route('api.google.upload'), [
            'file' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf'),
            'folder' => 'Desarrollo / Candidatos / CVs',
        ]);

        $response->assertUnauthorized()
            ->assertJson([
                'requires_auth' => true,
            ]);

        $this->assertFileDoesNotExist(storage_path('app/google_drive_token.json'));
    }

    public function test_oauth_connect_and_callback_returns_popup_view_with_origin_route(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'new-access-token',
                'refresh_token' => 'new-refresh-token',
                'expires_in' => 3600,
            ], 200),
        ]);

        $this->actingAs($user)
            ->get(route('google.connect', [
                'popup' => 1,
                'redirect' => '/desarrollo/candidatos?page=2',
            ]))
            ->assertRedirect();

        $callbackResponse = $this->actingAs($user)
            ->get(route('google.callback', ['code' => 'auth-code-123']));

        $callbackResponse->assertOk()
            ->assertViewIs('google.callback-popup')
            ->assertViewHas('success', true)
            ->assertViewHas('returnUrl', '/desarrollo/candidatos?page=2')
            ->assertSee('google-drive-auth', false);
    }

    public function test_oauth_callback_redirects_to_origin_route_when_not_popup_and_blocks_external_redirect(): void
    {
        $user = User::factory()->create();

        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response([
                'access_token' => 'new-access-token',
                'expires_in' => 3600,
            ], 200),
        ]);

        $this->actingAs($user)
            ->get(route('google.connect', [
                'redirect' => '/desarrollo/candidatos',
            ]))
            ->assertRedirect();

        $this->actingAs($user)
            ->get(route('google.callback', ['code' => 'auth-code-456']))
            ->assertRedirect('/desarrollo/candidatos')
            ->assertSessionHas('success');

        $this->actingAs($user)
            ->get(route('google.connect', [
                'redirect' => 'https://evil.example.com/phishing',
            ]))
            ->assertRedirect();

        $this->actingAs($user)
            ->get(route('google.callback', ['code' => 'auth-code-789']))
            ->assertRedirect('/proyectos/proyectos');
    }
}
