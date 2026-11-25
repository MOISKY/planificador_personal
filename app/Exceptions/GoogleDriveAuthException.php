<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Excepción lanzada cuando Google Drive requiere autorización o sus credenciales/tokens fallaron.
 */
class GoogleDriveAuthException extends RuntimeException {}
