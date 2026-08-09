<?php

namespace App\Modules\Booking\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckInScanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'qr_token' => ['required', 'string', 'max:64'],
            'checkin_type' => ['nullable', 'string', 'in:court,equipment,beverage'],
            'items_served' => ['nullable', 'array'],
        ];
    }
}
