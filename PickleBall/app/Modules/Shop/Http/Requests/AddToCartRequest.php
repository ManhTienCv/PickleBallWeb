<?php

namespace App\Modules\Shop\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddToCartRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $merge = [];
        if (!$this->has('item_type')) {
            $merge['item_type'] = 'product';
        }
        if (!$this->has('variant_id') && $this->has('product_variant_id')) {
            $merge['variant_id'] = $this->input('product_variant_id');
        }
        if (!$this->has('quantity')) {
            $merge['quantity'] = 1;
        }
        if (!empty($merge)) {
            $this->merge($merge);
        }
    }

    public function rules(): array
    {
        return [
            'item_type' => ['required', 'string', 'in:product,booking_slot'],
            'variant_id' => ['required_if:item_type,product', 'nullable', 'integer'],
            'product_variant_id' => ['nullable', 'integer'],
            'slot_id' => ['required_if:item_type,booking_slot', 'nullable', 'integer'],
            'quantity' => ['required', 'integer', 'min:1', 'max:100'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
