<?php

namespace App\Modules\Order\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'cart_id' => ['required', 'integer', 'exists:shop.carts,id'],
            'payment_gateway' => ['required', 'string', 'in:momo,bank_transfer,cash'],
            'pickup_notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
