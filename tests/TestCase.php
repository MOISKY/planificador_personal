<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * La transacción de RefreshDatabase va siempre sobre la maestra, aunque el test cambie de tenant.
     *
     * @var list<string>
     */
    protected $connectionsToTransact;

    protected function setUp(): void
    {
        $this->connectionsToTransact = [env('DB_CONNECTION', 'sqlite')];

        parent::setUp();

        $this->withoutVite();
    }
}
