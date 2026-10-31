<?php

namespace App\Models\Admin;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Relación entre personal y cargo.
 *
 * @property int $IdPersonalCargo
 * @property int $IdPersonal
 * @property int $IdCargo
 * @property CarbonInterface $FechaRegistro
 * @property-read AdminPersonal $personal
 * @property-read AdminCargo $cargo
 */
class AdminPersonalCargo extends Model
{
    public const CREATED_AT = 'FechaRegistro';

    public const UPDATED_AT = null;

    protected $table = 'admin_personal_cargo';

    protected $primaryKey = 'IdPersonalCargo';

    protected $fillable = [
        'IdPersonal',
        'IdCargo',
        'FechaRegistro',
    ];

    protected function casts(): array
    {
        return [
            'IdPersonal' => 'integer',
            'IdCargo' => 'integer',
            'FechaRegistro' => 'datetime',
        ];
    }

    public function personal(): BelongsTo
    {
        return $this->belongsTo(AdminPersonal::class, 'IdPersonal', 'IdPersonal');
    }

    public function cargo(): BelongsTo
    {
        return $this->belongsTo(AdminCargo::class, 'IdCargo', 'IdCargo');
    }
}
