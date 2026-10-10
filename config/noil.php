<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Producto que sirve esta instalación
    |--------------------------------------------------------------------------
    |
    | admin_tecnica es compartida por todos los productos NOIL. Cada proyecto
    | solo sincroniza los módulos, opciones y roles de su producto.
    |
    */

    'producto_id' => (int) env('NOIL_PRODUCTO_ID', 3),

    /*
    |--------------------------------------------------------------------------
    | Conexión maestra (admin_tecnica)
    |--------------------------------------------------------------------------
    |
    | La conexión por defecto cambia en cada petición a la base del cliente.
    | Todo lo que lea admin_* usa esta conexión para no seguir al tenant.
    |
    */

    'master_connection' => env('DB_CONNECTION', 'sqlite'),

    /*
    |--------------------------------------------------------------------------
    | Llave AES de admin_usuarios.SPassword
    |--------------------------------------------------------------------------
    |
    | Las contraseñas están cifradas con AES_ENCRYPT de MySQL. Se descifran en
    | PHP para no depender del motor de la base ni mandar la llave en cada query.
    |
    */

    'aes_key' => env('NOIL_AES_KEY', ''),

    /*
    |--------------------------------------------------------------------------
    | Sincronizar catálogos al elegir cliente
    |--------------------------------------------------------------------------
    |
    | Apagar solo en desarrollo con sqlite, donde no hay base de cliente con
    | las tablas master_* y admin_*.
    |
    */

    'sincronizar' => (bool) env('NOIL_SYNC', true),

];
