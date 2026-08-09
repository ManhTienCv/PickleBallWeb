<?php

namespace App\Modules\Shop\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddToCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'item_type' => ['required', 'string', 'in:product,booking_slot'],
            'variant_id' => ['required_if:item_type,product', 'nullable', 'integer', 'exists:shop.product_variants,id'],
            'slot_id' => ['required_if:item_type,booking_slot', 'nullable', 'integer'],
            'quantity' => ['required', 'integer', 'min:1'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
