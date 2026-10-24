<?php

namespace App\Services;

/**
 * Equivalente en PHP de AES_ENCRYPT / AES_DECRYPT de MySQL (AES-128-ECB con la
 * llave plegada a 16 bytes), para validar admin_usuarios.SPassword sin ir a la base.
 */
class PasswordAes
{
    public function __construct(private readonly string $key) {}

    public function cifrar(string $plano): string
    {
        return openssl_encrypt($plano, 'aes-128-ecb', $this->llaveMysql(), OPENSSL_RAW_DATA);
    }

    public function descifrar(string $cifrado): ?string
    {
        $plano = openssl_decrypt($cifrado, 'aes-128-ecb', $this->llaveMysql(), OPENSSL_RAW_DATA);

        return $plano === false ? null : $plano;
    }

    public function coincide(?string $cifrado, string $plano): bool
    {
        if ($cifrado === null || $cifrado === '') {
            return false;
        }

        $descifrado = $this->descifrar($cifrado);

        return $descifrado !== null && hash_equals($descifrado, $plano);
    }

    private function llaveMysql(): string
    {
        $llave = str_repeat("\0", 16);
        foreach (str_split($this->key) as $i => $caracter) {
            $llave[$i % 16] = chr(ord($llave[$i % 16]) ^ ord($caracter));
        }

        return $llave;
    }
}
